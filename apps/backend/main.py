from fastapi import FastAPI

app = FastAPI(
    title="EcoLoop API",
    version="1.0.0"
)

@app.get("/")
def root():
    return {"status": "running"}

@app.get("/health")
def health():
    return {"health": "ok"}
