import polars as pl
import asyncio
from datetime import datetime, timedelta
import random
from backend.core.druid_client import druid_conn, DRUID_DATASOURCE
from starlette.concurrency import run_in_threadpool
from typing import Optional, List, Dict, Any
from fastapi import HTTPException
import requests
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# --- MOCK SALES DATA (Druid schema) ---
def generate_large_mock_sales_data(num_rows=120000):
    import datetime
    import faker
    fake = faker.Faker()
    # Kenyan branches (realistic)
    branches = [
        "Nairobi CBD", "Westlands", "Mombasa Island", "Kisumu Central", "Eldoret Town", "Thika Road", "Machakos", "Meru", "Nakuru", "Kitale", "Kakamega", "Nyeri", "Embu", "Kericho", "Naivasha", "Garissa", "Isiolo", "Bungoma", "Voi", "Malindi"
    ]
    # Product lines and items (Kenyan context)
    product_lines = [
        "Motorcycles", "Spare Parts", "Electronics", "Agri Equipment", "Solar Products", "Tyres", "Batteries"
    ]
    item_groups = ["A", "B", "C", "D"]
    # Kenyan sales people names
    sales_people = [
        "John Mwangi", "Mary Wanjiku", "Peter Otieno", "Grace Njeri", "Samuel Kiptoo", "Janet Achieng", "Brian Ouma", "Diana Chebet", "Kevin Mutua", "Alice Atieno", "George Kariuki", "Esther Muthoni", "Paul Njoroge", "Lucy Wambui", "David Kimani", "Sarah Akinyi"
    ]
    # Kenyan company names
    acct_names = [
        "Safaricom Ltd", "Equity Bank", "KCB Group", "Brookside Dairies", "Bidco Africa", "Kenya Airways", "Naivas Supermarket", "Java House", "Kenya Power", "Nation Media Group", "Twiga Foods", "Jumia Kenya", "Chandaria Industries", "Kenya Tea Packers", "Kenpoly Manufacturers", "Mumias Sugar"
    ]
    # Product items (Kenyan context)
    item_names = [
        "Bajaj Boxer 150cc", "TVS HLX 125", "Hero Dawn 150", "Yamaha Crux Rev", "Piaggio Ape Xtra", "Motorcycle Tyre 3.00-17", "Yuasa Battery 12V", "NGK Spark Plug", "Tractor Plough", "Solar Home Kit", "LED Floodlight", "Maize Sheller", "Water Pump", "Motorcycle Chain", "Helmet", "Reflector Jacket"
    ]
    # Payment methods
    card_names = ["Mpesa", "Airtel Money", "Cash", "Visa", "Mastercard"]
    # Date range: 2023-01-01 to today
    start_date = datetime.date(2023, 1, 1)
    end_date = datetime.date.today()
    days_range = (end_date - start_date).days
    data = []
    for i in range(num_rows):
        dt = start_date + timedelta(days=random.randint(0, days_range))
        time_str = dt.strftime("%Y-%m-%dT%H:%M:%SZ")
        branch = random.choice(branches)
        product_line = random.choice(product_lines)
        item_group = random.choice(item_groups)
        sales_person = random.choice(sales_people)
        acct_name = random.choice(acct_names)
        item_name = random.choice(item_names)
        card_name = random.choices(card_names, weights=[0.55, 0.10, 0.20, 0.10, 0.05])[0]  # Mpesa most common
        # Realistic KSh values
        gross_revenue = round(random.uniform(2000, 250000), 2)
        # 10% chance of return
        returns_value = round(gross_revenue * random.uniform(0.05, 0.5), 2) if random.random() < 0.10 else 0.0
        units_sold = random.randint(1, 10) if product_line != "Agri Equipment" else random.randint(1, 2)
        units_returned = random.randint(1, min(3, units_sold)) if returns_value > 0 else 0
        total_cost = round(gross_revenue * random.uniform(0.60, 0.90), 2)
        line_item_count = random.randint(1, 3)
        data.append({
            "__time": time_str,
            "ProductLine": product_line,
            "ItemGroup": item_group,
            "Branch": branch,
            "SalesPerson": sales_person,
            "AcctName": acct_name,
            "ItemName": item_name,
            "CardName": card_name,
            "grossRevenue": gross_revenue,
            "returnsValue": returns_value,
            "unitsSold": units_sold,
            "unitsReturned": units_returned,
            "totalCost": total_cost,
            "lineItemCount": line_item_count,
        })
    return data

mock_sales_data = generate_large_mock_sales_data(120000)


async def fetch_sales_data(
    start_date: str,
    end_date: str,
    item_names: Optional[List[str]] = None,
    sales_persons: Optional[List[str]] = None,
    branch_names: Optional[List[str]] = None,
    use_mock_data: bool = False,
) -> pl.DataFrame:
    """
    Asynchronously fetches sales data from Druid and returns it as a Polars DataFrame.
    If use_mock_data is True, returns mock_sales_data as a Polars DataFrame.
    """
    if use_mock_data:
        # Filter mock data by date and optional filters
        import datetime
        def in_range(row):
            t = datetime.datetime.fromisoformat(row["__time"].replace("Z", "+00:00")) if "__time" in row else None
            return t and start_date <= t.strftime("%Y-%m-%d") <= end_date
        filtered = [row for row in mock_sales_data if in_range(row)]
        if item_names:
            filtered = [row for row in filtered if row["ItemName"] in item_names]
        if sales_persons:
            filtered = [row for row in filtered if row["SalesPerson"] in sales_persons]
        if branch_names:
            filtered = [row for row in filtered if row["Branch"] in branch_names]
        df = pl.from_dicts(filtered)
        if "__time" in df.columns:
            df = df.with_columns([
                pl.col("__time").str.replace("Z$", "").str.strptime(pl.Datetime, strict=False, format=None).alias("__time")
            ])
        return df

    def _build_filter() -> Optional[Dict[str, Any]]:
        """Helper function to build Druid filter based on provided parameters"""
        filters = []

        # Add time interval filter
        filters.append(
            {
                "type": "interval",
                "dimension": "__time",
                "intervals": [f"{start_date}T00:00:00.000Z/{end_date}T23:59:59.999Z"],
            }
        )

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

        if not filters:
            return None
        if len(filters) == 1:
            return filters[0]

        # Combine multiple filters with an 'and' condition
        return {"type": "and", "fields": filters}

    def _query_druid() -> List[Dict[str, Any]]:
        """Execute the synchronous Druid query using direct HTTP requests"""
        try:
            druid_filter = _build_filter()

            # Build Druid scan query - request all columns to see what's available
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

            # Add filter if provided
            if druid_filter:
                query["filter"] = druid_filter

            # Execute HTTP request to Druid
            url = "http://localhost:8888/druid/v2/"
            headers = {"Content-Type": "application/json"}
            response = requests.post(url, json=query, headers=headers, timeout=30)

            if response.status_code != 200:
                raise Exception(
                    f"Druid query failed with status {response.status_code}: {response.text}"
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

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error connecting to Druid: {str(e)}. Please check the Druid cluster status.",
            )

    # Execute the synchronous druid call in a thread pool
    sales_data_dicts = await run_in_threadpool(_query_druid)

    if not sales_data_dicts:
        # Return empty DataFrame instead of raising 404
        empty_df = pl.DataFrame(
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
        return empty_df

    # Construct raw Polars DataFrame from the list of dictionaries
    raw_sales_df = pl.from_dicts(sales_data_dicts)

    logger.info(
        f"Raw data retrieved from Druid: {raw_sales_df.shape[0]} rows, {raw_sales_df.shape[1]} columns"
    )

    # Data is now cleaned in Druid. No further cleaning applied.
    return raw_sales_df


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
            url = "http://localhost:8888/druid/v2/"
            headers = {"Content-Type": "application/json"}
            response = requests.post(url, json=query, headers=headers, timeout=30)

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
    raw_sales_df = pl.from_dicts(sales_data_dicts)

    logger.info(
        f"Raw data retrieved from Druid: {raw_sales_df.shape[0]} rows, {raw_sales_df.shape[1]} columns"
    )

    return raw_sales_df


def get_employee_quotas() -> pl.DataFrame:
    # TODO: Replace with real quota data source
    return pl.DataFrame({
        "SalesPerson": ["Alice", "Bob", "Charlie", "Diana"],
        "quota": [1000000, 1200000, 900000, 1100000]
    })

def get_mock_employee_quotas() -> pl.DataFrame:
    return pl.DataFrame({
        "SalesPerson": ["Alice", "Bob", "Charlie", "Diana"],
        "quota": [1000000, 1200000, 900000, 1100000]
    })

def get_mock_sales_data(start_date: str, end_date: str) -> pl.DataFrame:
    import datetime
    def in_range(row):
        t = datetime.datetime.fromisoformat(row["__time"].replace("Z", "+00:00")) if "__time" in row else None
        return t and start_date <= t.strftime("%Y-%m-%d") <= end_date
    filtered = [row for row in mock_sales_data if in_range(row)]
    df = pl.from_dicts(filtered)
    if "__time" in df.columns:
        df = df.with_columns([
            pl.col("__time").str.replace("Z$", "").str.strptime(pl.Datetime, strict=False, format=None).alias("__time")
        ])
    return df
