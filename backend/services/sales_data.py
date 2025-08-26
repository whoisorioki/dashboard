import os
import polars as pl
import asyncio
from datetime import datetime, timedelta
from core.druid_client import druid_conn, DRUID_DATASOURCE, DataAvailabilityStatus, get_primary_datasource_name
from starlette.concurrency import run_in_threadpool
from typing import Optional, List, Dict, Any
from fastapi import HTTPException
import requests
import json
import logging
import time
from services.mock_data_service import mock_data_fetcher

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def _get_validate_sales_data():
    """Lazy import to avoid circular dependency."""
    try:
        from schema.sales_analytics_schema import validate_sales_data
        return validate_sales_data
    except ImportError:
        logger.warning("Could not import validate_sales_data due to circular dependency. Skipping validation.")
        return None


async def create_dynamic_lazyframe_schema(file_path: str) -> pl.LazyFrame:
    """
    Create a dynamic LazyFrame schema that automatically adapts to any CSV structure.
    Uses LazyFrames for optimal performance and memory efficiency.
    """
    try:
        # Read CSV with LazyFrame for memory efficiency
        lazy_df = pl.scan_csv(file_path)
        
        # Get column info without loading data
        schema = lazy_df.schema
        
        print(f"🔍 Dynamic LazyFrame schema detection:")
        print(f"   Columns: {list(schema.keys())}")
        print(f"   Types: {list(schema.values())}")
        
        # Automatically detect and convert numeric columns
        numeric_columns = []
        dimension_columns = []
        
        for col_name, col_type in schema.items():
            if col_name == "__time":
                continue
                
            # Check if column is numeric based on type
            if col_type in [pl.Float64, pl.Float32, pl.Int64, pl.Int32, pl.Int16, pl.Int8]:
                numeric_columns.append(col_name)
            else:
                dimension_columns.append(col_name)
        
        print(f"   Numeric columns (metrics): {numeric_columns}")
        print(f"   Dimension columns: {dimension_columns}")
        
        # Apply type conversions dynamically using LazyFrame
        converted_df = lazy_df.with_columns([
            pl.col(col).cast(pl.Float64, strict=False).fill_null(0.0)
            for col in numeric_columns
        ])
        
        return converted_df
        
    except Exception as e:
        print(f"Error in dynamic schema detection: {e}")
        # Fallback to basic CSV scan
        return pl.scan_csv(file_path)

async def fetch_sales_data_with_dynamic_schema(
    start_date: str,
    end_date: str,
    item_names: Optional[List[str]] = None,
    sales_persons: Optional[List[str]] = None,
    branch_names: Optional[List[str]] = None,
    item_groups: Optional[List[str]] = None,
) -> pl.LazyFrame:
    """
    Fetch sales data using dynamic LazyFrame schema that adapts to any data structure.
    """
    # Check data availability status
    data_status = druid_conn.check_data_availability()
    
    # If mock data fallback is needed, use mock data
    if data_status == DataAvailabilityStatus.MOCK_DATA_FALLBACK:
        logger.info(f"Using mock data (status: {data_status})")
        return mock_data_fetcher.fetch_mock_data(
            start_date=start_date,
            end_date=end_date,
            item_names=item_names,
            sales_persons=sales_persons,
            branch_names=branch_names,
            item_groups=item_groups
        )
    
    # If no data available and fallback is disabled, raise exception
    if data_status == DataAvailabilityStatus.NO_DATA_AVAILABLE:
        logger.error("No data available and fallback is disabled")
        raise HTTPException(status_code=503, detail="Data source unavailable and fallback disabled")
    
    # Proceed with real data fetching using dynamic schema
    logger.info("Fetching real data from Druid with dynamic schema")
    return await _fetch_real_data_dynamic(
        start_date=start_date,
        end_date=end_date,
        item_names=item_names,
        sales_persons=sales_persons,
        branch_names=branch_names,
        item_groups=item_groups
    )

async def _fetch_real_data_dynamic(
    start_date: str,
    end_date: str,
    item_names: Optional[List[str]] = None,
    sales_persons: Optional[List[str]] = None,
    branch_names: Optional[List[str]] = None,
    item_groups: Optional[List[str]] = None,
) -> pl.LazyFrame:
    """
    Fetch real data from Druid using dynamic LazyFrame approach.
    """
    def _query_druid_dynamic() -> List[Dict[str, Any]]:
        try:
            # Get the actual datasource name dynamically
            datasource_name = get_primary_datasource_name()
            if not datasource_name:
                datasource_name = "SalesAnalytics"
            
            # Build dynamic query that adapts to available columns
            query = {
                "queryType": "scan",
                "dataSource": datasource_name,
                "intervals": [f"{start_date}/{end_date}"],
                "resultFormat": "compactedList",
            }
            
            # Dynamically add filters based on what's available
            filters = []
            filters.append({
                "type": "interval",
                "dimension": "__time",
                "intervals": [f"{start_date}T00:00:00.000Z/{end_date}T23:59:59.999Z"],
            })
            
            # Add optional filters dynamically
            if item_names:
                filters.append({"type": "in", "dimension": "ItemName", "values": item_names})
            if sales_persons:
                filters.append({"type": "in", "dimension": "SalesPerson", "values": sales_persons})
            if branch_names:
                filters.append({"type": "in", "dimension": "Branch", "values": branch_names})
            if item_groups:
                filters.append({"type": "in", "dimension": "ItemGroup", "values": item_groups})
            
            if filters:
                query["filter"] = {"type": "and", "fields": filters} if len(filters) > 1 else filters[0]
            
            # Execute query
            url = f"{os.getenv('DRUID_URL', 'http://router:8888')}/druid/v2/"
            headers = {"Content-Type": "application/json"}
            
            response = requests.post(url, json=query, headers=headers, timeout=30)
            if response.status_code != 200:
                raise Exception(f"Druid query failed: {response.status_code}")
            
            result = response.json()
            events = []
            
            # Parse results dynamically
            for segment in result:
                if "events" in segment and "columns" in segment:
                    columns = segment["columns"]
                    for event_row in segment["events"]:
                        event_dict = {}
                        for i, column in enumerate(columns):
                            if i < len(event_row):
                                event_dict[column] = event_row[i]
                        events.append(event_dict)
            
            return events
            
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error connecting to Druid: {str(e)}"
            )
    
    # Execute query in thread pool
    sales_data_dicts = await run_in_threadpool(_query_druid_dynamic)
    
    if not sales_data_dicts:
        return pl.LazyFrame()
    
    # Create LazyFrame from results
    raw_sales_df = pl.LazyFrame(sales_data_dicts)
    
    # Apply dynamic type conversion using LazyFrame operations
    converted_df = raw_sales_df.with_columns([
        pl.col(col).cast(pl.Float64, strict=False).fill_null(0.0)
        for col in raw_sales_df.columns
        if col != "__time" and col in ["grossRevenue", "returnsValue", "totalCost", "unitsSold", "unitsReturned", "lineItemCount"]
    ])
    
    return converted_df


# Backward compatibility alias
async def fetch_sales_data(
    start_date: str,
    end_date: str,
    item_names: Optional[List[str]] = None,
    sales_persons: Optional[List[str]] = None,
    branch_names: Optional[List[str]] = None,
    item_groups: Optional[List[str]] = None,
) -> pl.LazyFrame:
    """
    Backward compatibility alias for fetch_sales_data_with_dynamic_schema.
    """
    return await fetch_sales_data_with_dynamic_schema(
        start_date=start_date,
        end_date=end_date,
        item_names=item_names,
        sales_persons=sales_persons,
        branch_names=branch_names,
        item_groups=item_groups
    )


async def fetch_raw_sales_data(
    start_date: str,
    end_date: str,
    item_names: Optional[List[str]] = None,
    sales_persons: Optional[List[str]] = None,
    branch_names: Optional[List[str]] = None,
) -> pl.DataFrame:
    """
    Fetches raw sales data from Druid without applying any cleaning.

    Args:
        start_date: Start date in ISO format
        end_date: End date in ISO format
        item_names: Optional list of item names to filter by
        sales_persons: Optional list of sales persons to filter by
        branch_names: Optional list of branch names to filter by

    Returns:
        pl.DataFrame: A Polars DataFrame containing the raw filtered sales data
    """

    def _query_druid() -> List[Dict[str, Any]]:
        """Execute the synchronous Druid query using direct HTTP requests"""
        try:
            # Build Druid scan query
            query = {
                "queryType": "scan",
                "dataSource": "sales_analytics",
                "intervals": [f"{start_date}/{end_date}"],
                "columns": [
                    "__time",
                    "ProductLine",
                    "ItemGroup",
                    "Branch",
                    "SalesPerson",
                    "AcctName",
                    "ItemName",
                    "CardName",
                    "grossRevenue",
                    "returnsValue",
                    "unitsSold",
                    "unitsReturned",
                    "totalCost",
                    "lineItemCount",
                ],
                "resultFormat": "compactedList",
            }

            # Add filters if provided
            filters = []
            if item_names:
                filters.append(
                    {"type": "in", "dimension": "ItemName", "values": item_names}
                )
            if sales_persons:
                filters.append(
                    {"type": "in", "dimension": "SalesPerson", "values": sales_persons}
                )
            if branch_names:
                filters.append(
                    {"type": "in", "dimension": "Branch", "values": branch_names}
                )

            if filters:
                query["filter"] = (
                    {"type": "and", "fields": filters}
                    if len(filters) > 1
                    else filters[0]
                )

            # Execute HTTP request to Druid
            url = f"{os.getenv('DRUID_URL', 'http://router:8888')}/druid/v2/"
            headers = {"Content-Type": "application/json"}
            import time

            print(f"Sending Druid query to {url}:")
            print(query)
            start_time = time.time()
            response = requests.post(url, json=query, headers=headers, timeout=30)
            elapsed = time.time() - start_time
            print(
                f"Druid response status: {response.status_code}, time: {elapsed:.2f}s"
            )

            if response.status_code != 200:
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to fetch raw sales data: Druid query failed with status {response.status_code}: {response.text}",
                )

            result = response.json()

            # Parse the compactedList format
            events = []
            for segment in result:
                if "events" in segment and "columns" in segment:
                    columns = segment["columns"]
                    for event_row in segment["events"]:
                        # Convert array to dictionary
                        event_dict = {}
                        for i, column in enumerate(columns):
                            if i < len(event_row):
                                event_dict[column] = event_row[i]
                        events.append(event_dict)

            return events

        except HTTPException as e:
            raise e
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error connecting to Druid: {str(e)}. Please check the Druid cluster status.",
            )

    # Execute the synchronous druid call in a thread pool
    sales_data_dicts = await run_in_threadpool(_query_druid)

    if not sales_data_dicts:
        return pl.DataFrame(
            schema={
                "__time": pl.Datetime,
                "ProductLine": pl.Utf8,
                "ItemGroup": pl.Utf8,
                "Branch": pl.Utf8,
                "SalesPerson": pl.Utf8,
                "AcctName": pl.Utf8,
                "ItemName": pl.Utf8,
                "CardName": pl.Utf8,
                "grossRevenue": pl.Float64,
                "returnsValue": pl.Float64,
                "unitsSold": pl.Float64,
                "unitsReturned": pl.Float64,
                "totalCost": pl.Float64,
                "lineItemCount": pl.Int64,
            }
        )

    # Construct raw Polars DataFrame from the list of dictionaries
    raw_sales_df = pl.LazyFrame(sales_data_dicts)

    logger.info(
        f"Raw data retrieved from Druid: {len(sales_data_dicts)} rows, {len(sales_data_dicts[0]) if sales_data_dicts else 0} columns"
    )

    # Convert numeric columns to proper types to prevent calculation errors
    raw_sales_df = raw_sales_df.with_columns([
        pl.col("grossRevenue").cast(pl.Float64, strict=False).fill_null(0.0),
        pl.col("returnsValue").cast(pl.Float64, strict=False).fill_null(0.0),
        pl.col("totalCost").cast(pl.Float64, strict=False).fill_null(0.0),
        pl.col("unitsSold").cast(pl.Float64, strict=False).fill_null(0.0),
        pl.col("unitsReturned").cast(pl.Float64, strict=False).fill_null(0.0),
        pl.col("lineItemCount").cast(pl.Int64, strict=False).fill_null(0)
    ])

    return raw_sales_df.collect()


# Removed duplicate get_data_range_from_druid function - using the one from core.druid_client.py instead


def get_employee_quotas(start_date: str, end_date: str) -> pl.DataFrame:
    """
    Calculates the quota for all employees as the median of total sales for all employees during the specified time period.
    Returns a DataFrame with columns: SalesPerson, quota
    """

    async def _get():
        df = await fetch_sales_data_with_dynamic_schema(start_date, end_date)
        # Collect the LazyFrame to check if it's empty and get column information
        df_collected = df.collect()
        if (
            df_collected.is_empty()
            or "SalesPerson" not in df_collected.columns
            or "grossRevenue" not in df_collected.columns
        ):
            return pl.DataFrame({"SalesPerson": [], "quota": []})
        # Calculate total sales per employee using lazy evaluation
        sales_per_employee = (
            df
            .group_by("SalesPerson")
            .agg([(pl.sum("grossRevenue") + pl.sum("returnsValue")).alias("total_sales")])
            .collect()
        )
        if sales_per_employee.is_empty():
            return pl.DataFrame({"SalesPerson": [], "quota": []})
        median_quota = sales_per_employee["total_sales"].median()
        return pl.DataFrame(
            {
                "salesPerson": sales_per_employee["SalesPerson"].to_list(),
                "quota": [median_quota] * sales_per_employee.height,
            }
        )

    return asyncio.run(_get())
