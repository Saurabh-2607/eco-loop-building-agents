import os
from app.core.config import settings

# Base folder mapping from workspace root
WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", ".."))

# Resolve absolute target directories paths
SIMULATION_DIR = os.path.join(WORKSPACE_ROOT, "simulation")
DEFAULT_IDF_PATH = os.path.join(SIMULATION_DIR, "idf", "office.idf")
DEFAULT_EPW_PATH = os.path.join(SIMULATION_DIR, "weather", "india.epw")
OUTPUT_BASE_DIR = os.path.join(SIMULATION_DIR, "outputs")
LOGS_BASE_DIR = os.path.join(SIMULATION_DIR, "logs")

# Binary runtime mapping
ENERGYPLUS_BIN = "energyplus"  # Default name mapped in execution environment PATH
