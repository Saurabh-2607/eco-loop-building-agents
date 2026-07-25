import csv
from datetime import datetime, timedelta
from typing import List, Dict, Any
from loguru import logger

class EnergyPlusParser:
    def __init__(self, csv_path: str):
        self.csv_path = csv_path

    def parse_metrics(self) -> List[Dict[str, Any]]:
        """
        Parse raw EnergyPlus output CSV, scaling values to standard metrics units.
        """
        logger.info(f"Parsing simulation CSV dataset: {self.csv_path}")
        parsed_records = []
        
        # Fallback date if datetime format is non-standard
        base_time = datetime.utcnow() - timedelta(hours=24)
        
        try:
            with open(self.csv_path, mode="r") as f:
                reader = csv.DictReader(f)
                
                for idx, row in enumerate(reader):
                    try:
                        # Extract columns, handling variations in headers
                        temp = float(row.get("Zone Air Temperature [C]", 22.0))
                        humidity = float(row.get("Zone Air Relative Humidity [%]", 50.0))
                        occupancy = float(row.get("Zone People Occupant Count []", 0.0))
                        
                        # Convert power units to kW
                        total_power_w = float(row.get("Facility Total Electric Power [W]", 0.0))
                        energy_usage_kw = total_power_w / 1000.0
                        
                        # Sensible cooling energy is in Joules. Convert to kW (assuming hourly step: J / 3600000)
                        hvac_load_j = float(row.get("Ideal Loads Air System Sensible Cooling Energy [J]", 0.0))
                        hvac_load_kw = hvac_load_j / 3600000.0
                        
                        lighting_power_w = float(row.get("Lights Electric Power [W]", 0.0))
                        lighting_load_kw = lighting_power_w / 1000.0
                        
                        # Date parsing
                        # E.g. "07/25 01:00:00" -> construct timestamp
                        recorded_at = base_time + timedelta(hours=idx)
                        
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
                    except Exception as row_err:
                        logger.warning(f"Failed to parse row {idx}: {row_err}")
                        continue
            logger.info(f"Successfully parsed {len(parsed_records)} rows from CSV.")
        except Exception as e:
            logger.error(f"Error opening or reading CSV file: {e}")
            
        return parsed_records
