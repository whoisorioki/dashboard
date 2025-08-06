from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from api.routes import router
from api.kpi_routes import router as kpi_router
from core.druid_client import lifespan, druid_conn
from schema import schema
import strawberry.fastapi
from schema import Query
import strawberry
from fastapi import FastAPI
from strawberry.fastapi import GraphQLRouter
from fastapi import Request, Response
from fastapi_redis_cache import FastApiRedisCache

# import sentry_sdk

# sentry_sdk.init(
#     dsn="https://7865b46a8fb332db1a1b0514048d7d21@o4509650140659712.ingest.us.sentry.io/4509650170806272",
#     send_default_pii=True,
# )
# Sentry is disabled for development/testing

# Example: Capturing exceptions
# try:
#     # code that may throw
# except Exception as e:
#     sentry_sdk.capture_exception(e)

# Load environment variables
load_dotenv()

# Get configuration from environment variables
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", "8000"))
ENV = os.getenv("ENV", "development")
DEBUG = os.getenv("DEBUG", "true").lower() == "true"

# Create the FastAPI app
app = FastAPI(
    lifespan=lifespan,
    title="Sales Analytics Dashboard API",
    description="""
    A high-performance analytics API for CARGEN, serving sales data from Apache Druid using FastAPI and Polars.
    """,
    version="1.0.0",
    debug=DEBUG,
    openapi_tags=[
        {
            "name": "kpis",
            "description": "Key Performance Indicators and analytics endpoints for sales, branches, and products",
        },
        {"name": "sales", "description": "Raw sales data and transaction information"},
        {
            "name": "health",
            "description": "System health checks and connectivity monitoring",
        },
    ],
)

# Configure CORS origins based on environment
allowed_origins = [FRONTEND_URL]
if ENV == "development":
    # Allow additional origins in development
    allowed_origins.extend(
        [
            "http://localhost:3000",  # Common React dev port
            "http://localhost:5173",  # Vite default port
            "http://localhost:5174",  # Vite alternative port
            "http://127.0.0.1:5173",
            "http://127.0.0.1:5174",
            "http://localhost:5175",
            "http://127.0.0.1:5175",
        ]
    )

# Add CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the regular API routes
app.include_router(router)
app.include_router(kpi_router)

# Add the Strawberry GraphQL router
graphql_app = strawberry.fastapi.GraphQLRouter(schema)
app.include_router(graphql_app, prefix="/graphql")


@app.get("/")
async def health_check():
    """Root health check endpoint."""
    return {"status": "ok"}
