import os
import requests
from contextlib import asynccontextmanager
from typing import Optional, Dict, Any
from dotenv import load_dotenv
import logging

from fastapi import FastAPI, HTTPException, Request, Response
from pydruid.client import PyDruid
from fastapi_redis_cache import FastApiRedisCache

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Assume Druid is running on localhost. Use environment variables in production.
DRUID_BROKER_HOST = os.getenv("DRUID_BROKER_HOST", "localhost")
DRUID_BROKER_PORT = int(os.getenv("DRUID_BROKER_PORT", 8888))
DRUID_DATASOURCE = os.getenv("DRUID_DATASOURCE", "sales_analytics")

# Import mock data configuration
from config.mock_data_config import USE_MOCK_DATA, FORCE_MOCK_DATA, MOCK_DATA_FALLBACK

class DataAvailabilityStatus:
    """Enum-like class for data availability status"""
    REAL_DATA_AVAILABLE = "real_data_available"
    MOCK_DATA_FALLBACK = "mock_data_fallback"
    FORCED_MOCK_DATA = "forced_mock_data"
    NO_DATA_AVAILABLE = "no_data_available"

class DruidConnection:
    """A singleton-like class to hold the Druid client instance."""

    client: Optional[PyDruid] = None
    _connection_status: str = DataAvailabilityStatus.NO_DATA_AVAILABLE
    _last_health_check: float = 0
    _health_check_interval: int = 300  # 5 minutes

    def is_connected(self) -> bool:
        """Check if the Druid client is connected and responsive."""
        if self.client is None:
            return False

        import time
        import requests
        import json

        for attempt in range(3):
            try:
                # Use coordinator status endpoint which we know works reliably
                url = "http://coordinator:8081/status"
                logger.info(f"Testing Druid connection with URL: {url} (Attempt {attempt + 1})")
                response = requests.get(url, timeout=10)
                logger.info(f"Druid connection test response: {response.status_code}")
                if response.status_code == 200:
                    logger.info("Druid connection test successful")
                    return True
            except Exception as e:
                logger.error(f"Druid connection test failed: {e}")

            if attempt < 2:
                logger.info("Retrying in 5 seconds...")
                time.sleep(5)

        return False

    def get_available_datasources(self) -> list:
        """Get list of available datasources dynamically from Druid."""
        if self.client is None:
            return []

        try:
            import requests

            # Try multiple endpoints to get datasources
            endpoints = [
                "http://coordinator:8081/druid/coordinator/v1/datasources",  # Try coordinator first
                "http://broker:8082/druid/v2/datasources",  # Try broker directly
                f"http://{DRUID_BROKER_HOST}:{DRUID_BROKER_PORT}/druid/v2/datasources",  # Fallback to env vars
            ]
            
            for endpoint in endpoints:
                try:
                    response = requests.get(endpoint, timeout=5)
                    if response.status_code == 200:
                        datasources = response.json()
                        if datasources and len(datasources) > 0:
                            logger.info(f"Found datasources from {endpoint}: {datasources}")
                            return datasources
                except Exception as e:
                    logger.debug(f"Failed to get datasources from {endpoint}: {e}")
                    continue
            
            # If no datasources found via API, try to get from ingestion tasks
            task_datasources = self._get_datasources_from_tasks()
            if task_datasources:
                logger.info(f"Found datasources from tasks: {task_datasources}")
                return task_datasources
                
            logger.warning("No datasources found in Druid")
            return []
        except Exception as e:
            logger.error(f"Failed to get datasources: {e}")
            return []

    def get_most_recent_datasource(self) -> Optional[str]:
        """Get the most recent datasource based on ingestion task creation time."""
        try:
            import requests
            
            # Get all ingestion tasks
            url = "http://coordinator:8081/druid/indexer/v1/tasks"
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                tasks = response.json()
                if not tasks:
                    return None
                
                # Filter for successful tasks and sort by creation time
                successful_tasks = [
                    task for task in tasks 
                    if task.get("status") == "SUCCESS" and task.get("dataSource")
                ]
                
                if not successful_tasks:
                    return None
                
                # Sort by creation time (most recent first)
                sorted_tasks = sorted(
                    successful_tasks, 
                    key=lambda x: x.get("createdTime", ""), 
                    reverse=True
                )
                
                most_recent = sorted_tasks[0]
                datasource = most_recent.get("dataSource")
                created_time = most_recent.get("createdTime", "Unknown")
                
                logger.info(f"Most recent datasource: {datasource} (created: {created_time})")
                return datasource
            
            return None
        except Exception as e:
            logger.error(f"Error getting most recent datasource: {e}")
            return None

    def _get_datasources_from_tasks(self) -> list:
        """Get datasource names from ingestion tasks."""
        try:
            import requests
            
            url = "http://coordinator:8081/druid/indexer/v1/tasks"
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                tasks = response.json()
                if not tasks:
                    return []
                
                # Extract unique datasource names from successful tasks
                datasources = set()
                for task in tasks:
                    if task.get("status") == "SUCCESS" and task.get("dataSource"):
                        datasources.add(task["dataSource"])
                
                return list(datasources)
            
            return []
        except Exception as e:
            logger.error(f"Error getting datasources from tasks: {e}")
            return []

    def check_data_availability(self) -> str:
        """
        Check data availability and return appropriate status.
        This method determines whether to use real data, mock data, or fallback.
        """
        import time
        
        # If forced mock data is enabled, return immediately
        if FORCE_MOCK_DATA:
            self._connection_status = DataAvailabilityStatus.FORCED_MOCK_DATA
            logger.info("Using forced mock data mode")
            return self._connection_status

        # If mock data is explicitly enabled, use it
        if USE_MOCK_DATA:
            self._connection_status = DataAvailabilityStatus.FORCED_MOCK_DATA
            logger.info("Using explicit mock data mode")
            return self._connection_status

        # Check if we need to perform a health check
        current_time = time.time()
        if current_time - self._last_health_check < self._health_check_interval:
            return self._connection_status

        # Perform health check
        self._last_health_check = current_time
        
        if self.is_connected():
            # Check if there's actual data in the datasource
            if self._has_data_in_datasource():
                self._connection_status = DataAvailabilityStatus.REAL_DATA_AVAILABLE
                logger.info("Real data is available")
                return self._connection_status
            else:
                logger.warning("Druid is connected but no data found in datasource")
                if MOCK_DATA_FALLBACK:
                    self._connection_status = DataAvailabilityStatus.MOCK_DATA_FALLBACK
                    logger.info("Falling back to mock data due to empty datasource")
                    return self._connection_status
                else:
                    self._connection_status = DataAvailabilityStatus.NO_DATA_AVAILABLE
                    logger.error("No data available and fallback is disabled")
                    return self._connection_status
        else:
            logger.warning("Druid connection failed")
            if MOCK_DATA_FALLBACK:
                self._connection_status = DataAvailabilityStatus.MOCK_DATA_FALLBACK
                logger.info("Falling back to mock data due to connection failure")
                return self._connection_status
            else:
                self._connection_status = DataAvailabilityStatus.NO_DATA_AVAILABLE
                logger.error("No data available and fallback is disabled")
                return self._connection_status

    def _has_data_in_datasource(self) -> bool:
        """Check if there's actual data in the datasource"""
        try:
            import requests
            
            # Get the most recent datasource dynamically
            most_recent_datasource = self.get_most_recent_datasource()
            if not most_recent_datasource:
                logger.warning("No datasource available for data check")
                return False
            
            url = f"http://{DRUID_BROKER_HOST}:{DRUID_BROKER_PORT}/druid/v2/"
            headers = {"Content-Type": "application/json"}
            
            # Try a simpler query first - just check if datasource exists and has any data
            query = {
                "queryType": "timeseries",
                "dataSource": most_recent_datasource,
                "intervals": ["1900-01-01/2100-01-01"],
                "granularity": "all",
                "aggregations": [
                    {"type": "count", "name": "count"}
                ]
            }
            
            response = requests.post(url, json=query, headers=headers, timeout=10)
            if response.status_code == 200:
                result = response.json()
                if result and len(result) > 0:
                    count = result[0].get("result", {}).get("count", 0)
                    return count > 0
            
            # Fallback: try scan query
            scan_query = {
                "queryType": "scan",
                "dataSource": most_recent_datasource,
                "intervals": ["1900-01-01/2100-01-01"],
                "columns": ["__time"],
                "resultFormat": "compactedList",
                "limit": 1
            }
            
            response = requests.post(url, json=scan_query, headers=headers, timeout=10)
            if response.status_code == 200:
                result = response.json()
                if result and len(result) > 0 and "events" in result[0]:
                    return len(result[0]["events"]) > 0
            
            return False
        except Exception as e:
            logger.error(f"Error checking datasource for data: {e}")
            return False

    def get_connection_status(self) -> Dict[str, Any]:
        """Get comprehensive connection status information"""
        status = self.check_data_availability()
        
        return {
            "status": status,
            "druid_connected": self.is_connected(),
            "datasources": self.get_available_datasources(),
            "config": {
                "use_mock_data": USE_MOCK_DATA,
                "force_mock_data": FORCE_MOCK_DATA,
                "mock_data_fallback": MOCK_DATA_FALLBACK,
                "druid_host": DRUID_BROKER_HOST,
                "druid_port": DRUID_BROKER_PORT,
                "datasource": DRUID_DATASOURCE
            }
        }

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

        # Skip connection test when forcing mock data
        if FORCE_MOCK_DATA:
            print("Skipping Druid connection test - using forced mock data")
        else:
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
        """Convert Unix timestamp to ISO 8601 string"""
        if timestamp_value is None:
            return None

        try:
            # Handle string timestamps
            if isinstance(timestamp_value, str):
                timestamp_value = int(timestamp_value)

            # Convert to seconds by dividing appropriately
            # Unix epoch starts at 1970-01-01
            # Valid dates should be between 1970 and 2100
            if timestamp_value > 4102444800000000:  # > year 2100 in microseconds
                # Timestamp in microseconds, convert to seconds
                timestamp_value = timestamp_value // 1000000
            elif timestamp_value > 4102444800000:  # > year 2100 in milliseconds
                # Timestamp in milliseconds, convert to seconds
                timestamp_value = timestamp_value // 1000
            elif timestamp_value > 4102444800:  # > year 2100 in seconds
                # Timestamp already in seconds
                pass
            else:
                # Timestamp is too small, likely invalid
                raise ValueError(f"Timestamp {timestamp_value} is too small to be valid")

            # Convert to datetime and format as ISO string
            dt = datetime.fromtimestamp(timestamp_value)
            result = dt.isoformat() + "Z"
            return result
        except (ValueError, TypeError) as e:
            print(f"Error converting timestamp {timestamp_value}: {e}")
            # Return a default date instead of None
            return "2024-01-01T00:00:00.000Z"

    # Use SalesAnalytics datasource directly since we know it exists and has data
    datasource_name = "SalesAnalytics"
    print(f"Querying data range from datasource: {datasource_name}")

    # Try to connect to the router service which we know is accessible
    url = "http://router:8888/druid/v2/"
    headers = {"Content-Type": "application/json"}

    # Earliest date
    query = {
        "queryType": "scan",
        "dataSource": datasource_name,
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
            "dataSource": datasource_name,
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

        # Ensure we have valid dates
        if not earliest_date or earliest_date == "1970-01-01T03:00:00Z":
            earliest_date = "2024-01-01T00:00:00.000Z"
        if not latest_date or latest_date == "1970-01-01T03:00:00Z":
            latest_date = "2024-12-31T23:59:59.999Z"
            
        return {
            "earliest_date": earliest_date,
            "latest_date": latest_date,
            "total_records": total_records,
        }
    except Exception as e:
        print(f"Error getting data range from Druid: {e}")
        return {
            "earliest_date": "2024-01-01T00:00:00.000Z",
            "latest_date": "2024-12-31T23:59:59.999Z",
            "total_records": 0,
        }


def get_druid_health() -> dict:
    """Get Druid health status"""
    try:
        # Use the global druid_conn instance that has the client initialized
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
        # Use the global druid_conn instance that has the client initialized
        datasources = druid_conn.get_available_datasources()
        return {
            "datasources": datasources,
        }
    except Exception as e:
        return {
            "datasources": [],
        }
