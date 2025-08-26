"""
Standardized metric calculation classes for consistent naming and calculations across the backend.

This module provides standardized classes for:
- RevenueMetrics: Standardized revenue calculations
- MarginMetrics: Standardized margin calculations  
- ProfitMetrics: Standardized profit calculations
- OptimizedAggregations: Optimized aggregation functions
- ErrorHandling: Standardized error handling patterns
"""

import polars as pl
import logging
from typing import List, Dict, Any, Optional, Union, Tuple
from utils.lazyframe_utils import is_lazyframe_empty


class RevenueMetrics:
    """
    Standardized revenue metric definitions:
    
    - totalRevenue: Gross revenue before any deductions (sum(grossRevenue))
    - netSales: Revenue after returns (sum(grossRevenue) + sum(returnsValue))
    - totalSales: Alias for netSales (for backward compatibility)
    """
    
    @staticmethod
    def total_revenue(df: pl.LazyFrame) -> float:
        """
        Gross revenue before any deductions or adjustments.
        
        Args:
            df: Polars LazyFrame with sales data
            
        Returns:
            float: Total gross revenue
            
        Raises:
            ValueError: If required columns are missing
        """
        if is_lazyframe_empty(df):
            return 0.0
        
        # Validate required columns
        if "grossRevenue" not in df.columns:
            raise ValueError("Required column 'grossRevenue' not found in DataFrame")
        
        try:
            result = df.select(pl.sum("grossRevenue")).collect()
            value = float(result.item())
            
            # Validate result
            if not isinstance(value, (int, float)) or value < 0:
                logging.warning(f"Invalid total_revenue result: {value}")
                return 0.0
                
            return value
        except Exception as e:
            logging.error(f"Error calculating total_revenue: {e}")
            return 0.0
    
    @staticmethod
    def net_sales(df: pl.LazyFrame) -> float:
        """
        Revenue after accounting for returns and adjustments.
        
        Args:
            df: Polars LazyFrame with sales data
            
        Returns:
            float: Net sales (gross revenue + returns value)
            
        Raises:
            ValueError: If required columns are missing
        """
        if is_lazyframe_empty(df):
            return 0.0
        
        # Validate required columns
        required_cols = ["grossRevenue", "returnsValue"]
        missing_cols = [col for col in required_cols if col not in df.columns]
        if missing_cols:
            raise ValueError(f"Required columns not found: {missing_cols}")
        
        try:
            result = df.select(pl.sum("grossRevenue") + pl.sum("returnsValue")).collect()
            value = float(result.item())
            
            # Validate result
            if not isinstance(value, (int, float)):
                logging.warning(f"Invalid net_sales result: {value}")
                return 0.0
                
            return value
        except Exception as e:
            logging.error(f"Error calculating net_sales: {e}")
            return 0.0
    
    @staticmethod
    def total_sales(df: pl.LazyFrame) -> float:
        """
        Alias for netSales (for backward compatibility).
        
        Args:
            df: Polars LazyFrame with sales data
            
        Returns:
            float: Total sales (same as net sales)
        """
        return RevenueMetrics.net_sales(df)


class ProfitMetrics:
    """
    Standardized profit calculation methods:
    
    - grossProfit: grossRevenue - totalCost
    """
    
    @staticmethod
    def gross_profit(df: pl.LazyFrame) -> float:
        """
        Gross profit: revenue minus cost of goods sold.
        
        Args:
            df: Polars LazyFrame with sales data
            
        Returns:
            float: Gross profit
            
        Raises:
            ValueError: If required columns are missing
        """
        if is_lazyframe_empty(df):
            return 0.0
        
        # Validate required columns
        required_cols = ["grossRevenue", "totalCost"]
        missing_cols = [col for col in required_cols if col not in df.columns]
        if missing_cols:
            raise ValueError(f"Required columns not found: {missing_cols}")
        
        try:
            result = df.select(pl.sum("grossRevenue") - pl.sum("totalCost")).collect()
            value = float(result.item())
            
            # Validate result
            if not isinstance(value, (int, float)):
                logging.warning(f"Invalid gross_profit result: {value}")
                return 0.0
                
            return value
        except Exception as e:
            logging.error(f"Error calculating gross_profit: {e}")
            return 0.0


class MarginMetrics:
    """
    Standardized margin calculation methods:
    
    - grossMargin: (grossRevenue - totalCost) / grossRevenue
    - marginPct: (grossRevenue - totalCost) / grossRevenue * 100
    """
    
    @staticmethod
    def gross_margin(df: pl.LazyFrame) -> float:
        """
        Gross margin as a decimal (0.0 to 1.0).
        
        Args:
            df: Polars LazyFrame with sales data
            
        Returns:
            float: Gross margin as decimal (0.0 to 1.0)
            
        Raises:
            ValueError: If required columns are missing
        """
        try:
            gross_revenue = RevenueMetrics.total_revenue(df)
            gross_profit = ProfitMetrics.gross_profit(df)
            
            # Validate inputs
            if gross_revenue <= 0:
                logging.warning(f"Invalid gross_revenue for margin calculation: {gross_revenue}")
                return 0.0
            
            margin = gross_profit / gross_revenue
            
            # Validate result
            if not isinstance(margin, (int, float)) or margin < -1.0 or margin > 1.0:
                logging.warning(f"Invalid gross_margin result: {margin}")
                return 0.0
                
            return margin
        except Exception as e:
            logging.error(f"Error calculating gross_margin: {e}")
            return 0.0
    
    @staticmethod
    def margin_pct(df: pl.LazyFrame) -> float:
        """
        Gross margin as a percentage (0.0 to 100.0).
        
        Args:
            df: Polars LazyFrame with sales data
            
        Returns:
            float: Gross margin as percentage (0.0 to 100.0)
        """
        try:
            margin_decimal = MarginMetrics.gross_margin(df)
            margin_pct = margin_decimal * 100
            
            # Validate result
            if not isinstance(margin_pct, (int, float)) or margin_pct < -100.0 or margin_pct > 100.0:
                logging.warning(f"Invalid margin_pct result: {margin_pct}")
                return 0.0
                
            return margin_pct
        except Exception as e:
            logging.error(f"Error calculating margin_pct: {e}")
            return 0.0


class OptimizedAggregations:
    """
    Optimized aggregation functions that combine similar calculations.
    """
    
    @staticmethod
    def revenue_summary_metrics(df: pl.LazyFrame) -> Dict[str, Union[float, int]]:
        """
        Single aggregation for all revenue summary metrics.
        Reduces multiple group_by operations to one.
        
        Args:
            df: Polars LazyFrame with sales data
            
        Returns:
            dict: Dictionary containing all revenue summary metrics
            
        Raises:
            ValueError: If required columns are missing
        """
        if is_lazyframe_empty(df):
            return {
                "total_revenue": 0.0,
                "net_sales": 0.0,
                "gross_profit": 0.0,
                "total_transactions": 0,
                "total_units_sold": 0.0,
                "returns_value": 0.0,
                "unique_products": 0,
                "unique_branches": 0,
                "unique_employees": 0,
            }
        
        # Validate required columns
        required_cols = ["grossRevenue", "returnsValue", "totalCost", "lineItemCount", "unitsSold", "ItemName", "Branch", "SalesPerson"]
        missing_cols = [col for col in required_cols if col not in df.collect_schema().names()]
        if missing_cols:
            logging.warning(f"Missing columns for revenue_summary_metrics: {missing_cols}")
            # Return default values for missing columns
            return {
                "total_revenue": 0.0,
                "net_sales": 0.0,
                "gross_profit": 0.0,
                "total_transactions": 0,
                "total_units_sold": 0.0,
                "returns_value": 0.0,
                "unique_products": 0,
                "unique_branches": 0,
                "unique_employees": 0,
            }
        
        try:
            metrics = (
                df
                .select([
                    pl.sum("grossRevenue").alias("total_revenue"),
                    (pl.sum("grossRevenue") + pl.sum("returnsValue")).alias("net_sales"),
                    (pl.sum("grossRevenue") - pl.sum("totalCost")).alias("gross_profit"),
                    pl.sum("lineItemCount").alias("total_transactions"),
                    pl.sum("unitsSold").alias("total_units_sold"),
                    pl.sum("returnsValue").alias("returns_value"),
                    pl.n_unique("ItemName").alias("unique_products"),
                    pl.n_unique("Branch").alias("unique_branches"),
                    pl.n_unique("SalesPerson").alias("unique_employees"),
                ])
                .collect()
            )
            
            row = metrics.to_dicts()[0]
            
            # Validate and convert results
            result = {
                "total_revenue": float(row["total_revenue"]) if row["total_revenue"] is not None else 0.0,
                "net_sales": float(row["net_sales"]) if row["net_sales"] is not None else 0.0,
                "gross_profit": float(row["gross_profit"]) if row["gross_profit"] is not None else 0.0,
                "total_transactions": int(row["total_transactions"]) if row["total_transactions"] is not None else 0,
                "total_units_sold": float(row["total_units_sold"]) if row["total_units_sold"] is not None else 0.0,
                "returns_value": float(row["returns_value"]) if row["returns_value"] is not None else 0.0,
                "unique_products": int(row["unique_products"]) if row["unique_products"] is not None else 0,
                "unique_branches": int(row["unique_branches"]) if row["unique_branches"] is not None else 0,
                "unique_employees": int(row["unique_employees"]) if row["unique_employees"] is not None else 0,
            }
            
            # Validate results - allow negative values for returns_value
            for key, value in result.items():
                if not isinstance(value, (int, float)):
                    logging.warning(f"Invalid {key} result: {value}")
                    result[key] = 0.0 if isinstance(value, float) else 0
                elif isinstance(value, float):
                    # Allow negative values for returns_value, but validate other metrics
                    if key == "returns_value":
                        if value > 1e12 or value < -1e12:  # Allow negative but limit magnitude
                            logging.warning(f"Invalid {key} result: {value}")
                            result[key] = 0.0
                    else:
                        if value < 0 or value > 1e12:
                            logging.warning(f"Invalid {key} result: {value}")
                            result[key] = 0.0
                    
            return result
        except Exception as e:
            logging.error(f"Error calculating revenue_summary_metrics: {e}")
            return {
                "total_revenue": 0.0,
                "net_sales": 0.0,
                "gross_profit": 0.0,
                "total_transactions": 0,
                "total_units_sold": 0.0,
                "returns_value": 0.0,
                "unique_products": 0,
                "unique_branches": 0,
                "unique_employees": 0,
            }
    
    @staticmethod
    def performance_metrics_by_dimension(
        df: pl.LazyFrame, 
        dimension: str
    ) -> pl.DataFrame:
        """
        Single aggregation for performance metrics by dimension.
        Combines sales, profit, margin, and count metrics.
        
        Args:
            df: Polars LazyFrame with sales data
            dimension: Dimension to group by (e.g., "Branch", "ProductLine")
            
        Returns:
            pl.DataFrame: DataFrame with performance metrics by dimension
            
        Raises:
            ValueError: If required columns are missing or dimension is invalid
        """
        if is_lazyframe_empty(df):
            return pl.DataFrame()
        
        # Validate dimension
        valid_dimensions = ["Branch", "ProductLine", "ItemGroup", "SalesPerson"]
        if dimension not in valid_dimensions:
            raise ValueError(f"Invalid dimension: {dimension}. Must be one of {valid_dimensions}")
        
        # Validate required columns
        required_cols = ["grossRevenue", "returnsValue", "totalCost", "ItemName", "Branch"]
        missing_cols = [col for col in required_cols if col not in df.columns]
        if missing_cols:
            raise ValueError(f"Required columns not found: {missing_cols}")
        
        if dimension not in df.columns:
            raise ValueError(f"Dimension column '{dimension}' not found in DataFrame")
        
        try:
            return (
                df
                .group_by(dimension)
                .agg([
                    (pl.sum("grossRevenue") + pl.sum("returnsValue")).alias("total_sales"),
                    (pl.sum("grossRevenue") - pl.sum("totalCost")).alias("gross_profit"),
                    ((pl.sum("grossRevenue") - pl.sum("totalCost")) / pl.sum("grossRevenue")).alias("gross_margin"),
                    pl.count().alias("transaction_count"),
                    pl.n_unique("ItemName").alias("unique_products"),
                    pl.n_unique("Branch").alias("unique_branches"),
                ])
                .collect()
            )
        except Exception as e:
            logging.error(f"Error calculating performance_metrics_by_dimension: {e}")
            return pl.DataFrame()


class TimeBasedAggregations:
    """
    Optimized time-based aggregation functions.
    """
    
    @staticmethod
    def monthly_metrics(df: pl.LazyFrame) -> pl.DataFrame:
        """
        Single aggregation for all monthly metrics.
        Combines sales, profit, margin, and growth calculations.
        
        Args:
            df: Polars LazyFrame with sales data
            
        Returns:
            pl.DataFrame: DataFrame with monthly metrics
            
        Raises:
            ValueError: If required columns are missing
        """
        if is_lazyframe_empty(df):
            return pl.DataFrame()
        
        # Validate required columns
        required_cols = ["__time", "grossRevenue", "returnsValue", "totalCost"]
        missing_cols = [col for col in required_cols if col not in df.columns]
        if missing_cols:
            raise ValueError(f"Required columns not found: {missing_cols}")
        
        try:
            return (
                df
                .with_columns([
                    pl.col("__time").dt.strftime("%Y-%m").alias("month")
                ])
                .group_by("month")
                .agg([
                    pl.sum("grossRevenue").alias("total_revenue"),
                    (pl.sum("grossRevenue") + pl.sum("returnsValue")).alias("net_sales"),
                    (pl.sum("grossRevenue") - pl.sum("totalCost")).alias("gross_profit"),
                    ((pl.sum("grossRevenue") - pl.sum("totalCost")) / pl.sum("grossRevenue")).alias("gross_margin"),
                    pl.count().alias("transaction_count"),
                ])
                .sort("month")
                .collect()
            )
        except Exception as e:
            logging.error(f"Error calculating monthly_metrics: {e}")
            return pl.DataFrame()


class ErrorHandling:
    """
    Standardized error handling patterns for aggregations.
    """
    
    @staticmethod
    def safe_aggregation(df: pl.LazyFrame, aggregation_func, default_value=None):
        """
        Safe aggregation wrapper with consistent error handling.
        
        Args:
            df: Polars LazyFrame with sales data
            aggregation_func: Function to apply to the DataFrame
            default_value: Default value to return on error
            
        Returns:
            Any: Result of aggregation or default value
        """
        try:
            if is_lazyframe_empty(df):
                return default_value
            return aggregation_func(df)
        except Exception as e:
            logging.error(f"Error in aggregation: {e}")
            return default_value
    
    @staticmethod
    def validate_required_columns(df: pl.LazyFrame, required_columns: List[str]) -> bool:
        """
        Validate that required columns exist in the DataFrame.
        
        Args:
            df: Polars LazyFrame with sales data
            required_columns: List of required column names
            
        Returns:
            bool: True if all required columns exist, False otherwise
        """
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            logging.warning(f"Missing required columns: {missing_columns}")
            return False
        return True


class AggregationDocumentation:
    """
    Comprehensive documentation for all aggregation functions.
    """
    
    @staticmethod
    def get_metric_definitions() -> Dict[str, Dict[str, str]]:
        """
        Return comprehensive metric definitions for documentation.
        
        Returns:
            dict: Dictionary containing metric definitions
        """
        return {
            "totalRevenue": {
                "definition": "Gross revenue before any deductions or adjustments",
                "calculation": "sum(grossRevenue)",
                "data_source": "grossRevenue column",
                "usage": "Primary revenue metric for business performance",
                "frontend_usage": "Dashboard, Sales, Products pages"
            },
            "netSales": {
                "definition": "Revenue after accounting for returns and adjustments",
                "calculation": "sum(grossRevenue) + sum(returnsValue)",
                "data_source": "grossRevenue + returnsValue columns",
                "usage": "More accurate representation of actual sales after returns",
                "frontend_usage": "Available in schema but not displayed in UI"
            },
            "totalSales": {
                "definition": "Alias for netSales (for backward compatibility)",
                "calculation": "sum(grossRevenue) + sum(returnsValue)",
                "data_source": "grossRevenue + returnsValue columns",
                "usage": "Same as netSales, used for backward compatibility",
                "frontend_usage": "Sales performance, product analytics"
            },
            "grossProfit": {
                "definition": "Profit before expenses (revenue minus cost of goods sold)",
                "calculation": "sum(grossRevenue) - sum(totalCost)",
                "data_source": "grossRevenue - totalCost columns",
                "usage": "Key profitability metric",
                "frontend_usage": "Dashboard, Sales, Products pages"
            },
            "grossMargin": {
                "definition": "Gross profit as a percentage of gross revenue",
                "calculation": "(grossRevenue - totalCost) / grossRevenue",
                "data_source": "Derived from grossRevenue and totalCost",
                "usage": "Profitability indicator",
                "frontend_usage": "Product analytics, profitability pages"
            }
        } 