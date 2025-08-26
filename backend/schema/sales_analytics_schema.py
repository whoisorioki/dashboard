"""
Pandera schema validation for sales analytics data.
This module defines strict schemas for data validation to ensure data quality.
"""

import pandera as pa
from pandera.typing import Series
from typing import Optional
import polars as pl


class SalesAnalyticsSchema(pa.SchemaModel):
    """Schema for sales analytics data from Druid."""
    
    __time: Series[pl.Datetime] = pa.Field(
        description="Transaction timestamp",
        nullable=False
    )
    ProductLine: Series[str] = pa.Field(
        description="Product line/category",
        nullable=True
    )
    ItemGroup: Series[str] = pa.Field(
        description="Product group",
        nullable=True
    )
    Branch: Series[str] = pa.Field(
        description="Branch/location",
        nullable=True
    )
    SalesPerson: Series[str] = pa.Field(
        description="Salesperson name",
        nullable=True
    )
    AcctName: Series[str] = pa.Field(
        description="Account/customer name",
        nullable=True
    )
    ItemName: Series[str] = pa.Field(
        description="Product/item name",
        nullable=True
    )
    CardName: Series[str] = pa.Field(
        description="Customer card name",
        nullable=True
    )
    grossRevenue: Series[float] = pa.Field(
        description="Gross revenue in Kenyan Shillings",
        nullable=True,
        ge=0.0  # Revenue should be non-negative
    )
    returnsValue: Series[float] = pa.Field(
        description="Value of returns in Kenyan Shillings (negative values for returns)",
        nullable=True
        # Note: Returns should be negative to reduce revenue in calculations
    )
    unitsSold: Series[float] = pa.Field(
        description="Units sold",
        nullable=True,
        ge=0.0  # Units should be non-negative
    )
    unitsReturned: Series[float] = pa.Field(
        description="Units returned",
        nullable=True,
        ge=0.0  # Units should be non-negative
    )
    totalCost: Series[float] = pa.Field(
        description="Total cost in Kenyan Shillings",
        nullable=True,
        ge=0.0  # Cost should be non-negative
    )
    lineItemCount: Series[int] = pa.Field(
        description="Line item count",
        nullable=True,
        ge=0  # Count should be non-negative
    )


class RevenueSummarySchema(pa.SchemaModel):
    """Schema for revenue summary data."""
    
    total_revenue: Series[float] = pa.Field(
        description="Total revenue in KES",
        nullable=True,
        ge=0.0
    )
    gross_profit: Series[float] = pa.Field(
        description="Gross profit in KES",
        nullable=True
    )
    line_item_count: Series[int] = pa.Field(
        description="Total line item count",
        nullable=True,
        ge=0
    )
    net_sales: Series[float] = pa.Field(
        description="Net sales in KES",
        nullable=True
    )
    returns_value: Series[float] = pa.Field(
        description="Returns value in KES (negative values for returns)",
        nullable=True
        # Note: Returns should be negative to reduce revenue in calculations
    )
    total_transactions: Series[int] = pa.Field(
        description="Total transaction count",
        nullable=True,
        ge=0
    )
    average_transaction: Series[float] = pa.Field(
        description="Average transaction value in KES",
        nullable=True
    )
    unique_products: Series[int] = pa.Field(
        description="Unique product count",
        nullable=True,
        ge=0
    )
    unique_branches: Series[int] = pa.Field(
        description="Unique branch count",
        nullable=True,
        ge=0
    )
    unique_employees: Series[int] = pa.Field(
        description="Unique employee count",
        nullable=True,
        ge=0
    )
    net_units_sold: Series[float] = pa.Field(
        description="Net units sold",
        nullable=True
    )


class MonthlySalesGrowthSchema(pa.SchemaModel):
    """Schema for monthly sales growth data."""
    
    date: Series[str] = pa.Field(
        description="Date in YYYY-MM format",
        nullable=False
    )
    total_sales: Series[float] = pa.Field(
        description="Total sales for the month in KES",
        nullable=True,
        ge=0.0
    )
    gross_profit: Series[float] = pa.Field(
        description="Gross profit for the month in KES",
        nullable=True
    )


class ProductPerformanceSchema(pa.SchemaModel):
    """Schema for product performance data."""
    
    product: Series[str] = pa.Field(
        description="Product name",
        nullable=False
    )
    sales: Series[float] = pa.Field(
        description="Total sales in KES",
        nullable=True,
        ge=0.0
    )


class BranchPerformanceSchema(pa.SchemaModel):
    """Schema for branch performance data."""
    
    branch: Series[str] = pa.Field(
        description="Branch name",
        nullable=False
    )
    total_sales: Series[float] = pa.Field(
        description="Total sales in KES",
        nullable=True,
        ge=0.0
    )
    total_qty: Series[float] = pa.Field(
        description="Total quantity sold",
        nullable=True,
        ge=0.0
    )
    transaction_count: Series[int] = pa.Field(
        description="Transaction count",
        nullable=True,
        ge=0
    )
    average_price: Series[float] = pa.Field(
        description="Average price in KES",
        nullable=True
    )


def validate_sales_data(df: pl.DataFrame) -> pl.DataFrame:
    """
    Validate sales data using Pandera schema.
    
    Args:
        df: Polars DataFrame with sales data
        
    Returns:
        Validated DataFrame
        
    Raises:
        pa.errors.SchemaError: If data doesn't match schema
    """
    try:
        # Convert Polars DataFrame to pandas for Pandera validation
        pandas_df = df.to_pandas()
        
        # Validate using Pandera schema
        validated_df = SalesAnalyticsSchema.validate(pandas_df)
        
        # Convert back to Polars
        return pl.from_pandas(validated_df)
        
    except pa.errors.SchemaError as e:
        raise ValueError(f"Data validation failed: {e}")
    except Exception as e:
        raise ValueError(f"Validation error: {e}")


def validate_revenue_summary(df: pl.DataFrame) -> pl.DataFrame:
    """Validate revenue summary data."""
    try:
        pandas_df = df.to_pandas()
        validated_df = RevenueSummarySchema.validate(pandas_df)
        return pl.from_pandas(validated_df)
    except pa.errors.SchemaError as e:
        raise ValueError(f"Revenue summary validation failed: {e}")


def validate_monthly_sales_growth(df: pl.DataFrame) -> pl.DataFrame:
    """Validate monthly sales growth data."""
    try:
        pandas_df = df.to_pandas()
        validated_df = MonthlySalesGrowthSchema.validate(pandas_df)
        return pl.from_pandas(validated_df)
    except pa.errors.SchemaError as e:
        raise ValueError(f"Monthly sales growth validation failed: {e}")


def validate_product_performance(df: pl.DataFrame) -> pl.DataFrame:
    """Validate product performance data."""
    try:
        pandas_df = df.to_pandas()
        validated_df = ProductPerformanceSchema.validate(pandas_df)
        return pl.from_pandas(validated_df)
    except pa.errors.SchemaError as e:
        raise ValueError(f"Product performance validation failed: {e}")


def validate_branch_performance(df: pl.DataFrame) -> pl.DataFrame:
    """Validate branch performance data."""
    try:
        pandas_df = df.to_pandas()
        validated_df = BranchPerformanceSchema.validate(pandas_df)
        return pl.from_pandas(validated_df)
    except pa.errors.SchemaError as e:
        raise ValueError(f"Branch performance validation failed: {e}") 