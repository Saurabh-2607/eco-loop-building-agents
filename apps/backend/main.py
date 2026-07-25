import sys
import os

# Insert apps/backend into path for package resolution
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from app.api.router import api_router

app = FastAPI(
    title="EcoLoop API",
    version="1.0.0"
)

# Include sub-routers directly
app.include_router(api_router)

@app.get("/")
def root():
    return {"status": "running"}

@app.get("/health")
def health():
    return {"status": "healthy"}
