import pandas as pd
from pydruid.client import PyDruid
from pydruid.utils.postaggregator import Postaggregator
from pydruid.utils.aggregators import count, doublesum, longsum
from pydruid.utils.filters import Dimension

# Druid connection details
DRUID_BROKER_HOST = "localhost"
DRUID_BROKER_PORT = 8888
DRUID_DATASOURCE = "sales_analytics"

# Read the data from the CSV file
df = pd.read_csv("../../sales_data.csv")

# Convert the '__time' column to datetime objects
df["__time"] = pd.to_datetime(df["__time"])

# Create a PyDruid client
client = PyDruid(f"http://{DRUID_BROKER_HOST}:{DRUID_BROKER_PORT}", "druid/v2")

# Ingest the data into Druid
client.ingest_dataframe(
    df,
    datasource_name=DRUID_DATASOURCE,
    granularity_spec={
        "type": "uniform",
        "segmentGranularity": "day",
        "queryGranularity": "none",
        "intervals": ["1900-01-01/2100-01-01"],
    },
    dimensions=[
        "ProductLine",
        "ItemGroup",
        "Branch",
        "SalesPerson",
        "AcctName",
        "ItemName",
        "CardName",
    ],
    metrics={
        "grossRevenue": doublesum("grossRevenue"),
        "returnsValue": doublesum("returnsValue"),
        "unitsSold": doublesum("unitsSold"),
        "unitsReturned": doublesum("unitsReturned"),
        "totalCost": doublesum("totalCost"),
        "lineItemCount": longsum("lineItemCount"),
    },
)

print(f"Data ingested into the '{DRUID_DATASOURCE}' datasource successfully.")
