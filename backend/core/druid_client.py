import os
from contextlib import asynccontextmanager
from typing import Optional
from dotenv import load_dotenv

from fastapi import FastAPI, HTTPException
from pydruid.client import PyDruid

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

    yield
    print("Closing Druid client resources.")
    druid_conn.client = None
