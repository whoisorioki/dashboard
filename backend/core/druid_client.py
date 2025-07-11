import os
from contextlib import asynccontextmanager
from typing import Optional
from dotenv import load_dotenv
from supabase import create_client, Client
from fastapi import FastAPI, HTTPException
from pydruid.client import PyDruid
from backend.core import clients

# Load environment variables from .env file
load_dotenv()

# Assume Druid is running on localhost. Use environment variables in production.
DRUID_BROKER_HOST = os.getenv("DRUID_BROKER_HOST", "localhost")
DRUID_BROKER_PORT = int(os.getenv("DRUID_BROKER_PORT", 8888))
# Update this to match your actual datasource name
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

        for attempt in range(3):
            try:
                # Check for the presence of the Druid router status endpoint
                url = f"http://{DRUID_BROKER_HOST}:{DRUID_BROKER_PORT}/status"
                response = requests.get(url, timeout=10)
                if response.status_code == 200:
                    return True
            except requests.RequestException:
                # Silently ignore connection errors and retry
                pass

            if attempt < 2:
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
    FastAPI lifespan manager to initialize and close external connections.
    This ensures clients are created once at startup.
    """
    print("Initializing services...")
    supabase_initialized = False
    druid_initialized = False

    # Initialize Supabase client
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
    if SUPABASE_URL and SUPABASE_SERVICE_KEY:
        try:
            clients.supabase_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
            supabase_initialized = True
        except Exception as e:
            print(f"Error: Failed to initialize Supabase client: {e}")

    # Initialize Druid client
    try:
        druid_conn.client = PyDruid(
            url=f"http://{DRUID_BROKER_HOST}:{DRUID_BROKER_PORT}", endpoint="druid/v2"
        )
        if druid_conn.is_connected():
            druid_initialized = True
    except Exception as e:
        print(f"Error initializing Druid client: {e}")

    # Print consolidated status message
    if supabase_initialized and druid_initialized:
        print(
            f"Services initiated successfully at http://{DRUID_BROKER_HOST}:{DRUID_BROKER_PORT}"
        )
    else:
        if not supabase_initialized:
            print("Error: Supabase client failed to initialize.")
        if not druid_initialized:
            print("Error: Druid connection failed.")

    yield

    # Clean up resources
    print("Closing service connections.")
    clients.supabase_client = None
    druid_conn.client = None
