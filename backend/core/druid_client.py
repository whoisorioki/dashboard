import os
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI
from pydruid.client import PyDruid

# Assume Druid is running on localhost. Use environment variables in production.
DRUID_BROKER_HOST = os.getenv("DRUID_BROKER_HOST", "localhost")
DRUID_BROKER_PORT = int(os.getenv("DRUID_BROKER_PORT", 8888))
DRUID_DATASOURCE = "sales_data"


class DruidConnection:
    """A singleton-like class to hold the Druid client instance."""

    client: Optional[PyDruid] = None


druid_conn = DruidConnection()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI lifespan manager to initialize and close the Druid client.
    This ensures the client is created once at startup.
    """
    print("Initializing Druid client...")
    druid_conn.client = PyDruid(
        url=f"http://{DRUID_BROKER_HOST}:{DRUID_BROKER_PORT}", endpoint="druid/v2"
    )
    print(
        f"Druid client initialized for broker at {DRUID_BROKER_HOST}:{DRUID_BROKER_PORT}"
    )
    yield
    print("Closing Druid client resources.")
    druid_conn.client = None
