import os
import sqlite3
from datetime import datetime, timedelta
from typing import List, Dict, Any
from collections import defaultdict
from loguru import logger

class EnergyPlusParser:
    def __init__(self, sql_path: str):
        self.sql_path = sql_path

    def _convert_to_kw(self, val: float, units: str) -> float:
        """
        Convert raw energy units (Joules vs Watts) to standard kW metrics.
        EnergyPlus energy is reported in Joules (J) -> divide by 3,600,000.
        EnergyPlus power is reported in Watts (W) -> divide by 1,000.
        """
        if not units:
            return val / 1000.0
            
        u_upper = units.upper()
        if "J" in u_upper:
            # Joules to kWh (equivalent to average kW for an hourly interval)
            return val / 3600000.0
        elif "W" in u_upper:
            # Watts to kW
            return val / 1000.0
            
        return val

    def parse_metrics(self) -> List[Dict[str, Any]]:
        """
        Parse outputs from EnergyPlus eplusout.sql database join mappings.
        """
        logger.info(f"Parsing simulation SQLite database: {self.sql_path}")
        parsed_records = []
        
        if not os.path.exists(self.sql_path):
            logger.error(f"SQL database file not found at {self.sql_path}")
            return parsed_records
            
        try:
            with sqlite3.connect(self.sql_path) as conn:
                cursor = conn.cursor()
                
                # 1. Determine if EnvironmentPeriods table has Type 3 (Weather Run)
                has_weather_run = False
                try:
                    cursor.execute("SELECT COUNT(*) FROM EnvironmentPeriods WHERE EnvironmentType = 3")
                    has_weather_run = cursor.fetchone()[0] > 0
                except sqlite3.Error:
                    # Catch any SQLite related schema/operational errors defensively
                    pass

                # Fetch TimeIndex mappings filtering out Design Days/Warmup intervals
                if has_weather_run:
                    cursor.execute("""
                        SELECT Time.TimeIndex, Time.Month, Time.Day, Time.Hour, Time.Minute 
                        FROM Time 
                        JOIN EnvironmentPeriods ON Time.EnvironmentPeriodIndex = EnvironmentPeriods.EnvironmentPeriodIndex
                        WHERE EnvironmentPeriods.EnvironmentType = 3
                        ORDER BY Time.TimeIndex ASC
                    """)
                else:
                    cursor.execute("SELECT TimeIndex, Month, Day, Hour, Minute FROM Time ORDER BY TimeIndex ASC")
                
                time_rows = cursor.fetchall()
                time_map = {row[0]: (row[1], row[2], row[3], row[4]) for row in time_rows}
                
                if not time_map:
                    logger.warning("No time steps matched the environment filters.")
                    return parsed_records

                # 2. Fetch ReportDataDictionary metadata
                cursor.execute("SELECT ReportDataDictionaryIndex, KeyValue, Name, Units FROM ReportDataDictionary")
                dict_rows = cursor.fetchall()
                
                # Catalog variable indexing information
                variable_catalog = {}
                
                for idx, key_value, name, units in dict_rows:
                    name_lower = name.lower()
                    key_lower = key_value.lower() if key_value else ""
                    
                    # Tag key categories
                    is_temp = ("zone mean air temperature" in name_lower or "zone air temperature" in name_lower)
                    is_indoor_humidity = "zone air relative humidity" in name_lower
                    is_outdoor_humidity = "site outdoor air relative humidity" in name_lower
                    is_occupancy = ("zone people occupant count" in name_lower or "occupant count" in name_lower)
                    is_power = ("electricity:facility" in name_lower or "facility total electric power" in name_lower)
                    is_cooling = ("air system total cooling energy" in name_lower or "sensible cooling energy" in name_lower)
                    is_heating = ("air system total heating energy" in name_lower or "sensible heating energy" in name_lower)
                    is_lights = ("interiorlights:electricity" in name_lower or "lights electric power" in name_lower)
                    
                    variable_catalog[idx] = {
                        "name": name,
                        "key": key_value,
                        "units": units,
                        "is_temp": is_temp and not any(x in key_lower for x in ["outdoor", "environment", "ambient"]),
                        "is_indoor_humidity": is_indoor_humidity,
                        "is_outdoor_humidity": is_outdoor_humidity,
                        "is_occupancy": is_occupancy,
                        "is_power": is_power,
                        "is_cooling": is_cooling,
                        "is_heating": is_heating,
                        "is_lights": is_lights
                    }
                    
                # Summary logging to facilitate debugging of dynamic IDFs
                logger.info(
                    f"Cataloged variables: "
                    f"{sum(v['is_temp'] for v in variable_catalog.values())} temperature variables, "
                    f"{sum(v['is_power'] for v in variable_catalog.values())} power variables, "
                    f"{sum(v['is_cooling'] for v in variable_catalog.values())} cooling variables, "
                    f"{sum(v['is_heating'] for v in variable_catalog.values())} heating variables."
                )

                # 3. Retrieve all ReportData rows sorted to scale for large annual datasets
                cursor.execute("SELECT TimeIndex, ReportDataDictionaryIndex, Value FROM ReportData ORDER BY TimeIndex ASC")
                
                # Group values by TimeIndex and dictionary index, ignoring out-of-period rows
                grouped_data = defaultdict(lambda: defaultdict(list))
                
                # Fetch row-by-row to optimize memory allocation on huge results sets
                while True:
                    rows = cursor.fetchmany(2000)
                    if not rows:
                        break
                    for time_idx, dict_idx, val in rows:
                        if time_idx not in time_map:
                            continue
                        grouped_data[time_idx][dict_idx].append(val)
                    
                current_year = datetime.utcnow().year
                
                for time_idx in sorted(time_map.keys()):
                    month, day, hour, minute = time_map[time_idx]
                    vals = grouped_data.get(time_idx, {})
                    
                    temp_vals = []
                    indoor_hum_vals = []
                    outdoor_hum_vals = []
                    occ_vals = []
                    
                    total_power_kw = 0.0
                    cooling_kw = 0.0
                    heating_kw = 0.0
                    lights_kw = 0.0
                    
                    for dict_idx, readings in vals.items():
                        info = variable_catalog.get(dict_idx)
                        if not info:
                            continue
                            
                        if info["is_temp"]:
                            temp_vals.extend(readings)
                        elif info["is_indoor_humidity"]:
                            indoor_hum_vals.extend(readings)
                        elif info["is_outdoor_humidity"]:
                            outdoor_hum_vals.extend(readings)
                        elif info["is_occupancy"]:
                            occ_vals.extend(readings)
                        elif info["is_power"]:
                            total_power_kw += sum(self._convert_to_kw(r, info["units"]) for r in readings)
                        elif info["is_cooling"]:
                            cooling_kw += sum(self._convert_to_kw(r, info["units"]) for r in readings)
                        elif info["is_heating"]:
                            heating_kw += sum(self._convert_to_kw(r, info["units"]) for r in readings)
                        elif info["is_lights"]:
                            lights_kw += sum(self._convert_to_kw(r, info["units"]) for r in readings)
                            
                    # Calculate averages & sums safely
                    temperature = sum(temp_vals) / len(temp_vals) if temp_vals else 22.0
                    
                    # Prioritize indoor humidity over site outdoor humidity
                    if indoor_hum_vals:
                        humidity = sum(indoor_hum_vals) / len(indoor_hum_vals)
                    elif outdoor_hum_vals:
                        humidity = sum(outdoor_hum_vals) / len(outdoor_hum_vals)
                    else:
                        humidity = 50.0
                        
                    occupancy = sum(occ_vals) if occ_vals else 0.0
                    hvac_load_kw = cooling_kw + heating_kw
                    
                    # Normalize intervals bounds safely using datetime math
                    try:
                        base_day = datetime(current_year, month, day)
                        # Handle minute=60 or hour=24 gracefully via timedelta offset
                        recorded_at = base_day + timedelta(hours=hour, minutes=minute)
                    except ValueError:
                        recorded_at = datetime.utcnow()
                    
                    record = {
                        "temperature": round(temperature, 2),
                        "humidity": round(humidity, 2),
                        "occupancy": round(occupancy, 2),
                        "energy_usage": round(total_power_kw, 2),
                        "hvac_load": round(hvac_load_kw, 2),
                        "lighting_load": round(lights_kw, 2),
                        "recorded_at": recorded_at
                    }
                    parsed_records.append(record)
                    
            logger.info(f"Successfully parsed {len(parsed_records)} rows from SQLite database.")
        except Exception as e:
            logger.error(f"Error parsing SQLite database: {e}")
            
        return parsed_records
