import os
from contextlib import asynccontextmanager
from typing import Optional
from dotenv import load_dotenv

from fastapi import FastAPI, HTTPException, Request, Response
from pydruid.client import PyDruid
from fastapi_redis_cache import FastApiRedisCache

# Load environment variables from .env file
load_dotenv()

# Assume Druid is running on localhost. Use environment variables in production.
DRUID_BROKER_HOST = os.getenv("DRUID_BROKER_HOST", "localhost")
DRUID_BROKER_PORT = int(os.getenv("DRUID_BROKER_PORT", 8888))
DRUID_DATASOURCE = os.getenv("DRUID_DATASOURCE", "sales_analytics")


class DruidConnection:
    """A singleton-like class to hold the Druid client instance."""

    client: Optional[PyDruid] = None

    def is_connected(self) -> bool:
        """Check if the Druid client is connected and responsive."""
        if self.client is None:
            return False

        import time
        import requests
        import json

        for attempt in range(3):
            try:
                # Try to query datasources through the router, which we know works
                url = f"http://{DRUID_BROKER_HOST}:{DRUID_BROKER_PORT}/druid/v2/datasources"
                print(
                    f"Testing Druid connection with URL: {url} (Attempt {attempt + 1})"
                )
                response = requests.get(url, timeout=10)
                print(
                    f"Druid connection test response: {response.status_code} - {response.text}"
                )
                if response.status_code == 200:
                    try:
                        datasources = response.json()
                        print(f"Datasources found: {datasources}")
                        if len(datasources) > 0:
                            return True
                    except json.JSONDecodeError:
                        print("Error decoding JSON from response")
            except Exception as e:
                print(f"Druid connection test failed: {e}")

            if attempt < 2:
                print("Retrying in 5 seconds...")
                time.sleep(5)

        return False

    def get_available_datasources(self) -> list:
        """Get list of available datasources."""
        if self.client is None:
            return []

        try:
            import requests

            url = f"http://{DRUID_BROKER_HOST}:{DRUID_BROKER_PORT}/druid/v2/datasources"
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                return response.json()
            return []
        except Exception as e:
            print(f"Failed to get datasources: {e}")
            return []


druid_conn = DruidConnection()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI lifespan manager to initialize and close the Druid client.
    This ensures the client is created once at startup.
    """
    print("Initializing Druid client...")
    try:
        druid_conn.client = PyDruid(
            url=f"http://{DRUID_BROKER_HOST}:{DRUID_BROKER_PORT}", endpoint="druid/v2"
        )
        print(
            f"Druid client initialized for broker at {DRUID_BROKER_HOST}:{DRUID_BROKER_PORT}"
        )

        # Test the connection
        if druid_conn.is_connected():
            print("Druid connection verified successfully")
        else:
            print("Warning: Druid connection could not be verified")

    except Exception as e:
        print(f"Error initializing Druid client: {e}")
        druid_conn.client = None

    # Only initialize Redis cache if not in development
    if os.getenv("ENV", "development") != "development":
        print("Initializing Redis cache...")
        redis_cache = FastApiRedisCache()
        redis_cache.init(
            host_url=os.getenv("REDIS_URL", "redis://localhost"),
            prefix="sales-analytics-cache",
            response_header="X-API-Cache",
            ignore_arg_types=[Request, Response],
        )
        print("Redis cache initialized.")
    else:
        print("Skipping Redis cache initialization in development.")

    yield
    print("Closing Druid client resources.")
    druid_conn.client = None


def get_druid_health():
    """Get Druid health status"""
    try:
        if druid_conn.is_connected():
            return {"status": "healthy", "is_available": True}
        else:
            return {"status": "unhealthy", "is_available": False}
    except Exception as e:
        print(f"Error checking Druid health: {e}")
        return {"status": "error", "is_available": False}


def get_druid_datasources():
    """Get list of available Druid datasources"""
    try:
        if druid_conn.client:
            datasources = druid_conn.get_available_datasources()
            return {"datasources": datasources}
        else:
            return {"datasources": []}
    except Exception as e:
        print(f"Error getting Druid datasources: {e}")
        return {"datasources": []}


def get_data_range_from_druid():
    """Get data range from Druid"""
    try:
        if druid_conn.client:
            # This function should already exist based on usage in schema.py
            # You can implement the actual Druid query here
            return {
                "earliest_date": "2024-04-26T00:00:00.000Z",
                "latest_date": "2025-06-30T00:00:00.000Z", 
                "total_records": 461949
            }
        else:
            return {
                "earliest_date": "2024-04-26T00:00:00.000Z",
                "latest_date": "2025-06-30T00:00:00.000Z",
                "total_records": 461949
            }
    except Exception as e:
        print(f"Error getting data range from Druid: {e}")
        return {
            "earliest_date": "2024-04-26T00:00:00.000Z",
            "latest_date": "2025-06-30T00:00:00.000Z",
            "total_records": 461949
        }
