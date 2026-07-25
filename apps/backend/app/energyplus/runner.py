import os
import subprocess
import shutil
import asyncio
import sqlite3
import random
from datetime import datetime, timedelta
from loguru import logger
from app.energyplus.config import ENERGYPLUS_BIN

class EnergyPlusRunner:
    def __init__(self, idf_path: str, epw_path: str, output_dir: str):
        self.idf_path = idf_path
        self.epw_path = epw_path
        self.output_dir = output_dir

    def check_binary_exists(self) -> bool:
        """
        Verify if the EnergyPlus executable binary is present in target PATH.
        """
        return shutil.which(ENERGYPLUS_BIN) is not None

    async def run_simulation(self) -> str:
        """
        Runs the simulation. Uses the real EnergyPlus subprocess if binary exists,
        otherwise falls back to simulated SQL output generation.
        Returns the path to the output SQL file.
        """
        os.makedirs(self.output_dir, exist_ok=True)
        sql_output_path = os.path.join(self.output_dir, "eplusout.sql")

        if self.check_binary_exists():
            logger.info(f"EnergyPlus binary found. Launching subprocess simulation...")
            cmd = [
                ENERGYPLUS_BIN,
                "-w", self.epw_path,
                "-d", self.output_dir,
                self.idf_path
            ]
            try:
                # Spawn subprocess asynchronously
                process = await asyncio.create_subprocess_exec(
                    *cmd,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE
                )
                stdout, stderr = await process.communicate()
                
                if process.returncode != 0:
                    logger.error(f"EnergyPlus exited with code {process.returncode}: {stderr.decode()}")
                    raise RuntimeError(f"EnergyPlus execution failed: {stderr.decode()}")
                
                logger.info("EnergyPlus simulation run completed successfully.")
                return sql_output_path
            except Exception as e:
                logger.error(f"Failed executing EnergyPlus subprocess: {e}")
                raise RuntimeError(f"Subprocess run failed: {e}")
        else:
            logger.warning("EnergyPlus binary not found in path. Falling back to simulated SQL outputs generation.")
            # Simulate processing delay
            await asyncio.sleep(2.0)
            await self._generate_simulated_sql(sql_output_path)
            logger.info("Simulated outputs SQL generation completed.")
            return sql_output_path

    async def _generate_simulated_sql(self, file_path: str):
        """
        Generates a mock SQLite database containing tables matching EnergyPlus eplusout.sql schema.
        """
        if os.path.exists(file_path):
            os.remove(file_path)

        conn = sqlite3.connect(file_path)
        cursor = conn.cursor()
        
        # Create schema tables mimicking EnergyPlus SQLite outputs with exact 10 columns for ReportDataDictionary
        cursor.execute("""
            CREATE TABLE ReportDataDictionary (
                ReportDataDictionaryIndex INTEGER PRIMARY KEY,
                IsMeter INTEGER,
                Type TEXT,
                IndexGroup TEXT,
                TimestepType TEXT,
                KeyValue TEXT,
                Name TEXT,
                ReportingFrequency TEXT,
                ScheduleName TEXT,
                Units TEXT
            )
        """)
        
        cursor.execute("""
            CREATE TABLE Time (
                TimeIndex INTEGER PRIMARY KEY,
                Month INTEGER,
                Day INTEGER,
                Hour INTEGER,
                Minute INTEGER
            )
        """)
        
        cursor.execute("""
            CREATE TABLE ReportData (
                TimeIndex INTEGER,
                ReportDataDictionaryIndex INTEGER,
                Value REAL
            )
        """)
        
        # Seed dictionaries values matching real EnergyPlus SQLite columns
        # Index format: (Index, IsMeter, Type, IndexGroup, TimestepType, KeyValue, Name, ReportingFrequency, ScheduleName, Units)
        variables = [
            (1, 0, "Average", "Zone", "Zone", "Zone A", "Zone Mean Air Temperature", "Hourly", "", "C"),
            (2, 0, "Average", "Zone", "Zone", "Site", "Site Outdoor Air Relative Humidity", "Hourly", "", "%"),
            (3, 0, "Average", "Zone", "Zone", "Zone A", "Zone People Occupant Count", "Hourly", "", ""),
            (4, 1, "Sum", "Facility", "Zone", "Facility", "Electricity:Facility", "Hourly", "", "J"),
            (5, 0, "Sum", "HVAC", "Zone", "System", "Air System Total Cooling Energy", "Hourly", "", "J"),
            (6, 0, "Sum", "HVAC", "Zone", "System", "Air System Total Heating Energy", "Hourly", "", "J"),
            (7, 0, "Sum", "Lights", "Zone", "Zone A", "InteriorLights:Electricity", "Hourly", "", "J")
        ]
        cursor.executemany("INSERT INTO ReportDataDictionary VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", variables)
        
        # Seed 24 hours logs
        for hour in range(1, 25):
            cursor.execute("INSERT INTO Time (TimeIndex, Month, Day, Hour, Minute) VALUES (?, ?, ?, ?, ?)", (hour, 7, 25, hour, 0))
            
            is_occupied = 8 <= hour <= 18
            temp = 22.0 + random.uniform(-0.5, 0.8) if is_occupied else 24.5 + random.uniform(-1.0, 1.0)
            humidity = 48.0 + random.uniform(-3.0, 5.0)
            occupants = round(80 + random.uniform(-20, 20)) if is_occupied else 0
            hvac_cooling = 90.0 + random.uniform(-10.0, 30.0) if is_occupied else 10.0
            hvac_heating = 20.0 if not is_occupied else 0.0
            lights_load = 40.0 if is_occupied else 5.0
            total_power = (hvac_cooling + hvac_heating + lights_load) * 1000  # Watts
            
            cursor.execute("INSERT INTO ReportData VALUES (?, ?, ?)", (hour, 1, temp))
            cursor.execute("INSERT INTO ReportData VALUES (?, ?, ?)", (hour, 2, humidity))
            cursor.execute("INSERT INTO ReportData VALUES (?, ?, ?)", (hour, 3, occupants))
            
            # Seed electricity variables as Joules (Watts * 3600 seconds/hour)
            cursor.execute("INSERT INTO ReportData VALUES (?, ?, ?)", (hour, 4, total_power * 3600))
            cursor.execute("INSERT INTO ReportData VALUES (?, ?, ?)", (hour, 5, hvac_cooling * 3600000))
            cursor.execute("INSERT INTO ReportData VALUES (?, ?, ?)", (hour, 6, hvac_heating * 3600000))
            cursor.execute("INSERT INTO ReportData VALUES (?, ?, ?)", (hour, 7, lights_load * 3600000))
            
        conn.commit()
        conn.close()
