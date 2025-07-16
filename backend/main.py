from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from backend.api.routes import router
from backend.api.kpi_routes import router as kpi_router
from backend.core.druid_client import lifespan
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
    title="Kenyan Sales Analytics Dashboard API",
    description="""
    A high-performance analytics API for Kenyan businesses, serving sales data from Apache Druid using FastAPI and Polars.
    
    ## Features
    - **Sales Analytics**: Comprehensive sales performance metrics and KPIs
    - **Branch Performance**: Multi-branch analysis and comparison
    - **Product Analytics**: Product performance and profitability insights
    - **Real-time Data**: Live data from Apache Druid with fallback to mock data
    - **Multi-dimensional Filtering**: Filter by date ranges, branches, products, and sales personnel
    
    ## Authentication
    Currently open for development. Production deployment should include authentication.
    
    ## Data Sources
    - Primary: Apache Druid for real-time analytics
    - Fallback: Mock data when Druid is unavailable
    - All monetary values are in Kenyan Shillings (KES)
    
    ## API Structure
    - `/api/kpis/*` - Key Performance Indicators and analytics endpoints
    - `/api/sales` - Raw sales data with filtering
    - `/health*` - System health and connectivity checks
    """,
    version="1.0.0",
    debug=DEBUG,
    openapi_tags=[
        {
            "name": "kpis",
            "description": "Key Performance Indicators and analytics endpoints for sales, branches, and products"
        },
        {
            "name": "sales",
            "description": "Raw sales data and transaction information"
        },
        {
            "name": "health",
            "description": "System health checks and connectivity monitoring"
        }
    ]
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
            "http://localhost:5175",  # Added for your current frontend
            "http://127.0.0.1:5175",  # Added for your current frontend
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


@app.get("/")
async def health_check():
    """Root health check endpoint."""
    return {"status": "ok"}
