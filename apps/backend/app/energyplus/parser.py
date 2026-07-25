import os
import sqlite3
from datetime import datetime, timedelta
from typing import List, Dict, Any
from loguru import logger

class EnergyPlusParser:
    def __init__(self, sql_path: str):
        self.sql_path = sql_path

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
            
            # Fetch ReportDataDictionary indexes
            cursor.execute("SELECT ReportDataDictionaryIndex, Name FROM ReportDataDictionary")
            dict_rows = cursor.fetchall()
            
            # Match variables indexes
            temp_idx = None
            humidity_idx = None
            occupancy_idx = None
            power_idx = None
            hvac_idx = None
            lights_idx = None
            
            for idx, name in dict_rows:
                name_lower = name.lower()
                if "zone air temperature" in name_lower:
                    temp_idx = idx
                elif "relative humidity" in name_lower:
                    humidity_idx = idx
                elif "occupant count" in name_lower or "people occupant count" in name_lower:
                    occupancy_idx = idx
                elif "facility total electric power" in name_lower:
                    power_idx = idx
                elif "sensible cooling energy" in name_lower or "sensible heating energy" in name_lower:
                    hvac_idx = idx
                elif "lights electric power" in name_lower:
                    lights_idx = idx
                    
            # Retrieve all ReportData rows grouped by TimeIndex
            cursor.execute("SELECT TimeIndex, ReportDataDictionaryIndex, Value FROM ReportData ORDER BY TimeIndex ASC")
            data_rows = cursor.fetchall()
            
            # Group values by TimeIndex
            grouped_data = {}
            for time_idx, dict_idx, val in data_rows:
                if time_idx not in grouped_data:
                    grouped_data[time_idx] = {}
                grouped_data[time_idx][dict_idx] = val
                
            base_time = datetime.utcnow() - timedelta(hours=len(time_map))
            
            for time_idx in sorted(time_map.keys()):
                month, day, hour, minute = time_map[time_idx]
                vals = grouped_data.get(time_idx, {})
                
                temp = vals.get(temp_idx, 22.0) if temp_idx is not None else 22.0
                humidity = vals.get(humidity_idx, 50.0) if humidity_idx is not None else 50.0
                occupancy = vals.get(occupancy_idx, 0.0) if occupancy_idx is not None else 0.0
                
                total_power = vals.get(power_idx, 0.0) if power_idx is not None else 0.0
                energy_usage_kw = total_power / 1000.0
                
                hvac_load_j = vals.get(hvac_idx, 0.0) if hvac_idx is not None else 0.0
                hvac_load_kw = hvac_load_j / 3600000.0
                
                lights_w = vals.get(lights_idx, 0.0) if lights_idx is not None else 0.0
                lighting_load_kw = lights_w / 1000.0
                
                # Timestamp creation
                recorded_at = base_time + timedelta(hours=time_idx)
                
                record = {
                    "temperature": round(temp, 2),
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
