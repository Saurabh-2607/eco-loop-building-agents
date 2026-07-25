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
            conn = sqlite3.connect(self.sql_path)
            cursor = conn.cursor()
            
            # Fetch TimeIndex mappings
            cursor.execute("SELECT TimeIndex, Month, Day, Hour, Minute FROM Time ORDER BY TimeIndex ASC")
            time_rows = cursor.fetchall()
            time_map = {row[0]: (row[1], row[2], row[3], row[4]) for row in time_rows}
            
            # Fetch ReportDataDictionary indexes with KeyValue, Name and Units
            cursor.execute("SELECT ReportDataDictionaryIndex, KeyValue, Name, Units FROM ReportDataDictionary")
            dict_rows = cursor.fetchall()
            
            # Match variables indexes
            temp_indices = []
            humidity_indices = []
            occupancy_indices = []
            
            power_mappings = []       # List of tuples (idx, units)
            hvac_cooling_mappings = [] # List of tuples (idx, units)
            hvac_heating_mappings = [] # List of tuples (idx, units)
            lights_mappings = []       # List of tuples (idx, units)
            
            for idx, key_value, name, units in dict_rows:
                name_lower = name.lower()
                key_lower = key_value.lower() if key_value else ""
                
                # Filter out obvious outdoor or non-zone variables for temperature averaging
                is_indoor_temp = ("zone mean air temperature" in name_lower or "zone air temperature" in name_lower)
                is_outdoor_key = any(x in key_lower for x in ["outdoor", "environment", "ambient", "weather"])
                
                if is_indoor_temp and not is_outdoor_key:
                    temp_indices.append(idx)
                elif "zone air relative humidity" in name_lower or "site outdoor air relative humidity" in name_lower:
                    humidity_indices.append(idx)
                elif "zone people occupant count" in name_lower or "occupant count" in name_lower:
                    occupancy_indices.append(idx)
                elif "electricity:facility" in name_lower or "facility total electric power" in name_lower:
                    power_mappings.append((idx, units))
                elif "air system total cooling energy" in name_lower or "sensible cooling energy" in name_lower:
                    hvac_cooling_mappings.append((idx, units))
                elif "air system total heating energy" in name_lower or "sensible heating energy" in name_lower:
                    hvac_heating_mappings.append((idx, units))
                elif "interiorlights:electricity" in name_lower or "lights electric power" in name_lower:
                    lights_mappings.append((idx, units))
                    
            # Retrieve all ReportData rows grouped by TimeIndex
            cursor.execute("SELECT TimeIndex, ReportDataDictionaryIndex, Value FROM ReportData ORDER BY TimeIndex ASC")
            data_rows = cursor.fetchall()
            
            # Group values by TimeIndex and dictionary index as lists to support multiple zones
            grouped_data = defaultdict(lambda: defaultdict(list))
            for time_idx, dict_idx, val in data_rows:
                grouped_data[time_idx][dict_idx].append(val)
                
            current_year = datetime.utcnow().year
            
            for time_idx in sorted(time_map.keys()):
                month, day, hour, minute = time_map[time_idx]
                vals = grouped_data.get(time_idx, {})
                
                # Zone temperature: Average of conditioned zone temperatures, filtering outliers (e.g. < 10°C or > 40°C)
                raw_temps = []
                for idx in temp_indices:
                    raw_temps.extend(vals.get(idx, []))
                temps = [t for t in raw_temps if 10.0 <= t <= 40.0]
                temperature = sum(temps) / len(temps) if temps else 22.0
                
                # Zone relative humidity: Average of matching humidity points
                raw_hums = []
                for idx in humidity_indices:
                    raw_hums.extend(vals.get(idx, []))
                hums = [h for h in raw_hums if 0.0 <= h <= 100.0]
                humidity = sum(hums) / len(hums) if hums else 50.0
                
                # Zone occupant count: Sum of all matching zones occupancy counts
                raw_occs = []
                for idx in occupancy_indices:
                    raw_occs.extend(vals.get(idx, []))
                occupancy = sum(raw_occs) if raw_occs else 0.0
                
                # Total Electric Power: Sum and convert units dynamically
                power_sum = 0.0
                for idx, units in power_mappings:
                    power_sum += sum(self._convert_to_kw(v, units) for v in vals.get(idx, []))
                energy_usage_kw = power_sum
                
                # HVAC cooling and heating energy: Sum and convert units
                cooling_kw = 0.0
                for idx, units in hvac_cooling_mappings:
                    cooling_kw += sum(self._convert_to_kw(v, units) for v in vals.get(idx, []))
                    
                heating_kw = 0.0
                for idx, units in hvac_heating_mappings:
                    heating_kw += sum(self._convert_to_kw(v, units) for v in vals.get(idx, []))
                hvac_load_kw = cooling_kw + heating_kw
                
                # Lighting Power: Sum and convert units
                lights_kw = 0.0
                for idx, units in lights_mappings:
                    lights_kw += sum(self._convert_to_kw(v, units) for v in vals.get(idx, []))
                lighting_load_kw = lights_kw
                
                # Construct real datetime timestamp by applying timedelta to base date to handle Hour=24 cleanly
                try:
                    recorded_at = datetime(current_year, month, day) + timedelta(hours=hour, minutes=minute)
                except ValueError:
                    recorded_at = datetime.utcnow()
                
                record = {
                    "temperature": round(temperature, 2),
                    "humidity": round(humidity, 2),
                    "occupancy": round(occupancy, 2),
                    "energy_usage": round(energy_usage_kw, 2),
                    "hvac_load": round(hvac_load_kw, 2),
                    "lighting_load": round(lighting_load_kw, 2),
                    "recorded_at": recorded_at
                }
                parsed_records.append(record)
                
            conn.close()
            logger.info(f"Successfully parsed {len(parsed_records)} rows from SQLite database.")
        except Exception as e:
            logger.error(f"Error parsing SQLite database: {e}")
            
        return parsed_records
