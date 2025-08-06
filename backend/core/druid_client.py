import os
import requests
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


def get_data_range_from_druid() -> dict:
    """
    Queries Druid for the min and max __time values and total record count.
    Returns a dict: { 'earliest_date': str, 'latest_date': str, 'total_records': int }
    """
    import requests
    from datetime import datetime

    def convert_timestamp_to_iso(timestamp_value):
        """Convert Unix timestamp (ms or s) to ISO 8601 string"""
        if timestamp_value is None:
            return None

        try:
            # Handle string timestamps
            if isinstance(timestamp_value, str):
                timestamp_value = int(timestamp_value)

            # If timestamp is in seconds (< year 2100 in milliseconds), convert to milliseconds
            if timestamp_value < 4102444800000:
                timestamp_value = timestamp_value * 1000

            # Convert to datetime and format as ISO string
            dt = datetime.fromtimestamp(timestamp_value / 1000)
            return dt.isoformat() + "Z"
        except (ValueError, TypeError) as e:
            print(f"Error converting timestamp {timestamp_value}: {e}")
            return None

    url = f"http://{DRUID_BROKER_HOST}:{DRUID_BROKER_PORT}/druid/v2/"
    headers = {"Content-Type": "application/json"}

    # Earliest date
    query = {
        "queryType": "scan",
        "dataSource": DRUID_DATASOURCE,
        "intervals": ["1900-01-01/2100-01-01"],
        "columns": ["__time"],
        "resultFormat": "compactedList",
        "limit": 1,
        "order": "ascending",
    }

    try:
        response = requests.post(url, json=query, headers=headers, timeout=30)
        earliest_date = None
        if response.status_code == 200:
            result = response.json()
            if result and len(result) > 0 and "events" in result[0]:
                if len(result[0]["events"]) > 0:
                    raw_earliest = result[0]["events"][0][0]
                    earliest_date = convert_timestamp_to_iso(raw_earliest)

        # Latest date
        query["order"] = "descending"
        response = requests.post(url, json=query, headers=headers, timeout=30)
        latest_date = None
        if response.status_code == 200:
            result = response.json()
            if result and len(result) > 0 and "events" in result[0]:
                if len(result[0]["events"]) > 0:
                    raw_latest = result[0]["events"][0][0]
                    latest_date = convert_timestamp_to_iso(raw_latest)

        # Total records
        count_query = {
            "queryType": "scan",
            "dataSource": DRUID_DATASOURCE,
            "intervals": ["1900-01-01/2100-01-01"],
            "columns": [],
            "resultFormat": "compactedList",
        }
        response = requests.post(url, json=count_query, headers=headers, timeout=30)
        total_records = 0
        if response.status_code == 200:
            count_result = response.json()
            for segment in count_result:
                if "events" in segment:
                    total_records += len(segment["events"])

        return {
            "earliest_date": earliest_date,
            "latest_date": latest_date,
            "total_records": total_records,
        }
    except Exception as e:
        print(f"Error getting data range from Druid: {e}")
        return {
            "earliest_date": None,
            "latest_date": None,
            "total_records": 0,
        }


def get_druid_health() -> dict:
    """Get Druid health status"""
    try:
        druid_conn = DruidConnection()
        is_connected = druid_conn.is_connected()
        return {
            "status": "healthy" if is_connected else "unhealthy",
            "is_available": is_connected,
        }
    except Exception as e:
        return {
            "status": "error",
            "is_available": False,
        }


def get_druid_datasources() -> dict:
    """Get list of Druid datasources"""
    try:
        url = f"http://{DRUID_BROKER_HOST}:{DRUID_BROKER_PORT}/druid/v2/datasources"
        response = requests.get(url, timeout=10)

        if response.status_code == 200:
            datasources = response.json()
            return {
                "datasources": datasources,
            }
        else:
            return {
                "datasources": [],
            }
    except Exception as e:
        return {
            "datasources": [],
        }
