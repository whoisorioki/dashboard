#!/usr/bin/env python3
"""
Schema Validation Script

This script validates that all data models, types, and interfaces
are aligned with the exact Druid schema:

- __time (transaction timestamp)
- itemcode (product code)
- dscription (item description)
- ocrname (customer/location)
- sales_employee (salesperson/channel)
- item_group_name (product category)
- product_line (brand)
- qty (quantity, float but represents integer)
- line_total (total value for line item)
"""

import polars as pl
from backend.services.sales_data import fetch_sales_data
from backend.services import kpi_service
from backend.api.schema import SalesReportItem


def validate_druid_schema():
    """Validate that our data structures match the Druid schema exactly."""

    print("🔍 Validating Druid Schema Compliance...")
    print("=" * 50)

    # Expected Druid columns
    expected_columns = [
        "__time",
        "itemcode",
        "dscription",
        "ocrname",
        "sales_employee",
        "item_group_name",
        "product_line",
        "qty",
        "line_total",
    ]

    print("✅ Expected Druid Schema Columns:")
    for col in expected_columns:
        print(f"   - {col}")

    print(
        "\n🏗️  Testing Data Frame Creation..."
    )  # Create test DataFrame with exact schema
    test_data = {
        "__time": ["2024-01-01T10:00:00Z", "2024-01-01T11:00:00Z"],
        "itemcode": ["3W6D000214", "APEV5001"],
        "dscription": ["PIAGGIO APE DIESEL", "BRIDGE PLATE"],
        "ocrname": ["Mombasa trading", "Nairobi trading"],
        "sales_employee": ["John Mwangi", "Mary Wanjiku"],
        "item_group_name": ["Units", "Parts"],
        "product_line": ["Piaggio", "Piaggio"],
        "qty": [1.0, 2.0],
        "line_total": [450000.0, 1500.0],
    }

    df = pl.DataFrame(test_data)

    # Convert __time to proper datetime format (as it would be processed in sales_data.py)
    df = df.with_columns(
        pl.col("__time").str.to_datetime().dt.replace_time_zone(None).alias("__time")
    )

    print(f"✅ Created test DataFrame with shape: {df.shape}")
    print(f"✅ Columns: {df.columns}")

    # Validate all expected columns are present
    missing_cols = set(expected_columns) - set(df.columns)
    extra_cols = set(df.columns) - set(expected_columns)

    if missing_cols:
        print(f"❌ Missing columns: {missing_cols}")
        return False

    if extra_cols:
        print(f"⚠️  Extra columns: {extra_cols}")

    print("✅ All required columns present!")

    # Test KPI functions with correct schema
    print("\n🧮 Testing KPI Functions...")

    try:
        # Test monthly sales growth
        growth_result = kpi_service.calculate_monthly_sales_growth(df)
        print(f"✅ Monthly sales growth: {growth_result.shape}")

        # Test target attainment
        target_result = kpi_service.calculate_sales_target_attainment(df, 500000.0)
        print(f"✅ Target attainment: {target_result}")

        # Test product performance
        product_result = kpi_service.get_product_performance(df, 5)
        print(
            f"✅ Product performance: {len(product_result['top_performers'])} top performers"
        )

        # Test heatmap data
        heatmap_result = kpi_service.create_branch_product_heatmap_data(df)
        print(f"✅ Heatmap data: {heatmap_result.shape}")

    except Exception as e:
        print(f"❌ KPI function error: {e}")
        return False

    # Test GraphQL schema
    print("\n📋 Testing GraphQL Schema...")

    try:
        test_row = df.to_dicts()[0]
        # Convert datetime back to string for GraphQL compatibility
        if "__time" in test_row and test_row["__time"] is not None:
            test_row["__time"] = str(test_row["__time"])

        sales_item = SalesReportItem(
            time=test_row.get("__time", ""),
            itemcode=test_row.get("itemcode", ""),
            dscription=test_row.get("dscription"),
            ocrname=test_row.get("ocrname"),
            sales_employee=test_row.get("sales_employee"),
            item_group_name=test_row.get("item_group_name"),
            product_line=test_row.get("product_line"),
            qty=float(test_row.get("qty", 0.0)),
            line_total=float(test_row.get("line_total", 0.0)),
        )
        print(f"✅ GraphQL SalesReportItem created successfully")
        print(f"   - Time: {sales_item.time}")
        print(f"   - Item: {sales_item.itemcode} - {sales_item.dscription}")
        print(f"   - Customer: {sales_item.ocrname}")
        print(f"   - Employee: {sales_item.sales_employee}")
        print(f"   - Group: {sales_item.item_group_name}")
        print(f"   - Line: {sales_item.product_line}")
        print(f"   - Qty: {sales_item.qty}")
        print(f"   - Total: {sales_item.line_total}")

    except Exception as e:
        print(f"❌ GraphQL schema error: {e}")
        return False

    print("\n🎉 Schema Validation Complete!")
    print("✅ All data models are aligned with the Druid schema")
    return True


if __name__ == "__main__":
    validate_druid_schema()
