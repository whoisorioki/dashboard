import os
import requests
from dotenv import load_dotenv
import json

# Load environment variables from backend/.env
dotenv_path = os.path.join(os.path.dirname(__file__), "backend", ".env")
load_dotenv(dotenv_path=dotenv_path)

# API base URL
BASE_URL = "http://localhost:8000/api/kpis"


def test_endpoint(endpoint, params=None):
    """Tests a single endpoint and prints the response."""
    try:
        response = requests.get(f"{BASE_URL}{endpoint}", params=params)
        print(f"--- Testing Endpoint: {endpoint} ---")
        print(f"Status Code: {response.status_code}")
        try:
            print("Response JSON:")
            print(json.dumps(response.json(), indent=2))
        except json.JSONDecodeError:
            print("Response Text:")
            print(response.text)
        print("-" * (len(endpoint) + 22))
        print()
    except requests.exceptions.RequestException as e:
        print(f"Error testing endpoint {endpoint}: {e}")


def get_druid_data_range():
    """Queries Druid's system table to find the actual date range of the data."""
    druid_sql_url = "http://localhost:8888/druid/v2/sql"
    query = {
        "query": 'SELECT MIN("__time") AS min_time, MAX("__time") AS max_time FROM "sales_analytics"'
    }
    headers = {"Content-Type": "application/json"}
    try:
        response = requests.post(druid_sql_url, json=query, headers=headers)
        if response.status_code == 200:
            data = response.json()
            if data:
                print("--- Druid Data Range ---")
                print(f"Min Time: {data[0]['min_time']}")
                print(f"Max Time: {data[0]['max_time']}")
                print("------------------------")
                print()
        else:
            print(
                f"Error querying Druid data range. Status: {response.status_code}, Response: {response.text}"
            )
    except requests.exceptions.RequestException as e:
        print(f"Error connecting to Druid for data range check: {e}")


def main():
    get_druid_data_range()

    # Define common parameters
    params = {
        "start_date": "2023-01-01",
        "end_date": "2025-12-31",
    }

    # Test all endpoints
    test_endpoint("/monthly-sales-growth", params)
    test_endpoint("/sales-target-attainment", {**params, "target": 50000000})
    test_endpoint("/product-performance", {**params, "n": 5})
    test_endpoint("/branch-product-heatmap", params)
    test_endpoint("/employee-performance", params)
    test_endpoint("/profit-summary", params)
    test_endpoint("/margin-trends", params)
    test_endpoint("/profitability-by-dimension", {**params, "dimension": "ProductLine"})
    test_endpoint("/top-customers", {**params, "n": 10})


if __name__ == "__main__":
    main()
