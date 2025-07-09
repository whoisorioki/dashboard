from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from backend.api.routes import router
from backend.api.kpi_routes import router as kpi_router
from backend.api.auth_routes import router as auth_router
from backend.api.data_quality_routes import router as data_quality_router
from backend.api.schema import schema
from backend.core.druid_client import lifespan
from strawberry.fastapi import GraphQLRouter

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
    title="High-Performance Dashboard API",
    description="An API for serving analytics data from Apache Druid using FastAPI, Polars, and GraphQL.",
    version="1.0.0",
    debug=DEBUG,
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
app.include_router(auth_router)
app.include_router(data_quality_router)

# Create and include the GraphQL router
graphql_app = GraphQLRouter(schema, graphql_ide="apollo-sandbox")
app.include_router(graphql_app, prefix="/graphql")


@app.get("/")
async def health_check():
    """Root health check endpoint."""
    return {"status": "ok"}
