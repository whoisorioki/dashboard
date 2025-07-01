from fastapi import FastAPI

app = FastAPI(
    title="High-Performance Dashboard API",
    description="API for serving analytics data from Apache Druid.",
    version="1.0.0",
)


@app.get("/")
async def health_check():
    return {"status": "ok"}
