from fastapi import FastAPI
from backend.api.routes import router
from backend.api.kpi_routes import router as kpi_router
from backend.api.schema import schema
from backend.core.druid_client import lifespan
from strawberry.fastapi import GraphQLRouter

# Create the FastAPI app
app = FastAPI(
    lifespan=lifespan,
    title="High-Performance Dashboard API",
    description="An API for serving analytics data from Apache Druid using FastAPI, Polars, and GraphQL.",
    version="1.0.0",
)

# Include the regular API routes
app.include_router(router)
app.include_router(kpi_router)

# Create and include the GraphQL router
graphql_app = GraphQLRouter(schema, graphql_ide="apollo-sandbox")
app.include_router(graphql_app, prefix="/graphql")


@app.get("/")
async def health_check():
    """Root health check endpoint."""
    return {"status": "ok"}
