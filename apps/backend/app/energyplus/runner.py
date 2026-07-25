import os
import subprocess
import shutil
import asyncio
import csv
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
        otherwise falls back to simulated output generation.
        Returns the path to the output CSV file.
        """
        os.makedirs(self.output_dir, exist_ok=True)
        csv_output_path = os.path.join(self.output_dir, "eplusout.csv")

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
                return csv_output_path
            except Exception as e:
                logger.error(f"Failed executing EnergyPlus subprocess: {e}")
                raise RuntimeError(f"Subprocess run failed: {e}")
        else:
            logger.warning("EnergyPlus binary not found in path. Falling back to simulated outputs generation.")
            # Simulate processing delay
            await asyncio.sleep(2.0)
            await self._generate_simulated_csv(csv_output_path)
            logger.info("Simulated outputs generation completed.")
            return csv_output_path

    async def _generate_simulated_csv(self, file_path: str):
        """
        Generate mock CSV simulation outputs resembling actual output headers.
        """
        headers = [
            "Date/Time", 
            "Zone Air Temperature [C]", 
            "Zone Air Relative Humidity [%]", 
            "Zone People Occupant Count []", 
            "Facility Total Electric Power [W]",
            "Ideal Loads Air System Sensible Cooling Energy [J]",
            "Lights Electric Power [W]"
        ]
        
        base_time = datetime.utcnow() - timedelta(hours=24)
        
        with open(file_path, mode="w", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(headers)
            
            for hour_step in range(24):
                recorded_at = base_time + timedelta(hours=hour_step)
                # Format: 07/25 01:00:00 (EnergyPlus style datetime)
                dt_str = recorded_at.strftime("%m/%d %H:%M:%S")
                
                is_occupied = 8 <= recorded_at.hour <= 18
                temp = 22.0 + random.uniform(-0.5, 0.8) if is_occupied else 24.5 + random.uniform(-1.0, 1.0)
                humidity = 48.0 + random.uniform(-3.0, 5.0)
                occupants = round(80 + random.uniform(-20, 20)) if is_occupied else 0
                hvac_load = 90.0 + random.uniform(-10.0, 30.0) if is_occupied else 10.0
                lights_load = 40.0 if is_occupied else 5.0
                total_power = (hvac_load + lights_load) * 1000  # Convert kW to Watts
                
                row = [
                    dt_str,
                    round(temp, 2),
                    round(humidity, 2),
                    occupants,
                    round(total_power, 2),
                    round(hvac_load * 3600000, 2),  # Joules
                    round(lights_load * 1000, 2)
                ]
                writer.writerow(row)
