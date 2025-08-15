"""
Centralized Mock Data Service for Sales Analytics Dashboard

This service provides a centralized fallback mechanism when real data is unavailable.
All mock data is generated to match the exact schema and format of real data.
"""

import random
import polars as pl
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class MockDataFetcher:
    """Centralized mock data fetcher that mimics real data structure"""
    
    def __init__(self):
        # Mock data constants - realistic Kenyan business data based on original data patterns
        self.BRANCHES = [
            "Nairobi Central", "Mombasa Branch", "Kisumu Branch", 
            "Nakuru Branch", "Eldoret Branch", "Thika Branch",
            "Kakamega Branch", "Nyeri Branch", "Machakos Branch", "Kisii Branch"
        ]
        
        # Based on original data patterns - more realistic product lines
        self.PRODUCT_LINES = [
            "Automotive Parts", "Electronics", "Construction Materials",
            "Agricultural Equipment", "Industrial Supplies", "Consumer Goods",
            "Medical Equipment", "Office Supplies", "Sports Equipment", "Home Appliances"
        ]
        
        # More specific item groups based on real business patterns
        self.ITEM_GROUPS = [
            "Engine Parts", "Brake Systems", "Electrical Components", "Suspension",
            "Building Materials", "Farming Tools", "Safety Equipment", "Plumbing",
            "Home Appliances", "Office Supplies", "Medical Equipment", "Sports Gear",
            "Electronics", "Automotive Accessories", "Industrial Tools", "HVAC Systems"
        ]
        
        # Realistic Kenyan names based on common patterns
        self.SALES_PERSONS = [
            "John Kamau", "Mary Wanjiku", "Peter Odhiambo", "Sarah Akinyi",
            "David Mwangi", "Grace Njeri", "James Ochieng", "Faith Atieno",
            "Michael Kiprop", "Lucy Chebet", "Robert Njoroge", "Ann Wambui",
            "Joseph Kiprotich", "Jane Muthoni", "Paul Otieno", "Esther Nyambura"
        ]
        
        # Realistic Kenyan business names
        self.CUSTOMERS = [
            "ABC Motors Ltd", "XYZ Electronics", "BuildRight Construction",
            "FarmFresh Ltd", "Industrial Solutions", "HomeMart Stores",
            "OfficeMax Kenya", "MediCare Supplies", "SportsZone", "TechHub Kenya",
            "Kenya Auto Parts", "Mombasa Hardware", "Kisumu Traders", "Nakuru Motors",
            "Eldoret Construction", "Thika Industrial", "Kakamega Supplies", "Nyeri Medical"
        ]
        
        # More realistic product names based on actual business patterns
        self.PRODUCTS = [
            "Engine Oil Filter", "Brake Pads Set", "Battery 12V 60Ah", "Cement 50kg Bag",
            "Steel Beams 6m", "Tractor Oil Filter", "Safety Helmet", "Refrigerator 300L",
            "Printer Cartridge HP", "X-Ray Machine", "Football Size 5", "Laptop Dell",
            "Tire 205/55R16", "Welding Machine", "Water Pump 1HP", "Generator 5KVA",
            "Air Conditioner 1.5HP", "Drill Machine", "Cement Mixer", "Tractor Parts Kit"
        ]

    def fetch_mock_data(
        self,
        start_date: str,
        end_date: str,
        item_names: Optional[List[str]] = None,
        sales_persons: Optional[List[str]] = None,
        branch_names: Optional[List[str]] = None,
        item_groups: Optional[List[str]] = None,
        num_transactions: int = 1000
    ) -> pl.LazyFrame:
        """
        Fetch mock data in the exact same format as real data.
        This method mimics the fetch_sales_data function signature and return type.
        
        Args:
            start_date: Start date in YYYY-MM-DD format
            end_date: End date in YYYY-MM-DD format
            item_names: Optional list of item names to filter by
            sales_persons: Optional list of sales persons to filter by
            branch_names: Optional list of branch names to filter by
            item_groups: Optional list of item groups to filter by
            num_transactions: Number of transactions to generate
            
        Returns:
            Polars LazyFrame with mock data in the same format as real data
        """
        try:
            logger.info(f"Generating mock data from {start_date} to {end_date}")
            
            # Generate base transaction data
            df = self._generate_transactions(start_date, end_date, num_transactions)
            
            # Apply filters if specified (mimic real data filtering)
            if branch_names:
                df = df.filter(pl.col("Branch").is_in(branch_names))
                logger.info(f"Filtered by branches: {branch_names}")
                
            if item_groups:
                df = df.filter(pl.col("ItemGroup").is_in(item_groups))
                logger.info(f"Filtered by item groups: {item_groups}")
                
            if sales_persons:
                df = df.filter(pl.col("SalesPerson").is_in(sales_persons))
                logger.info(f"Filtered by sales persons: {sales_persons}")
                
            if item_names:
                df = df.filter(pl.col("ItemName").is_in(item_names))
                logger.info(f"Filtered by item names: {item_names}")
            
            # Convert to LazyFrame to match real data return type
            lazy_df = df.lazy()
            
            logger.info(f"Generated {len(df)} mock transactions")
            return lazy_df
            
        except Exception as e:
            logger.error(f"Error generating mock data: {e}")
            return pl.DataFrame().lazy()

    def _generate_transactions(self, start_date: str, end_date: str, num_transactions: int) -> pl.DataFrame:
        """Generate realistic transaction data based on original data patterns"""
        try:
            start_dt = datetime.fromisoformat(start_date)
            end_dt = datetime.fromisoformat(end_date)
            
            # Generate random dates within the range with realistic distribution
            date_range = (end_dt - start_dt).days
            random_days = [random.randint(0, date_range) for _ in range(num_transactions)]
            transaction_dates = [start_dt + timedelta(days=days) for days in random_days]
            
            # Generate mock data with realistic business patterns
            data = []
            for i in range(num_transactions):
                # Random selections with weighted distribution
                branch = random.choice(self.BRANCHES)
                product_line = random.choice(self.PRODUCT_LINES)
                item_group = random.choice(self.ITEM_GROUPS)
                sales_person = random.choice(self.SALES_PERSONS)
                customer = random.choice(self.CUSTOMERS)
                product = random.choice(self.PRODUCTS)
                
                # Realistic pricing based on product type and Kenyan market
                if "Automotive" in product_line:
                    base_price = random.uniform(2000, 15000)  # Auto parts are expensive
                elif "Electronics" in product_line:
                    base_price = random.uniform(5000, 50000)  # Electronics vary widely
                elif "Construction" in product_line:
                    base_price = random.uniform(500, 8000)    # Construction materials
                elif "Medical" in product_line:
                    base_price = random.uniform(10000, 100000) # Medical equipment expensive
                else:
                    base_price = random.uniform(500, 10000)   # General range
                
                # Realistic quantities based on product type
                if "Cement" in product or "Steel" in product:
                    units_sold = random.randint(10, 100)  # Bulk materials
                elif "Electronics" in product_line:
                    units_sold = random.randint(1, 5)     # Electronics usually 1-5
                elif "Automotive" in product_line:
                    units_sold = random.randint(1, 10)    # Auto parts 1-10
                else:
                    units_sold = random.randint(1, 20)    # General range
                
                gross_revenue = base_price * units_sold
                
                # Realistic cost ratios based on industry
                if "Electronics" in product_line:
                    cost_ratio = random.uniform(0.7, 0.9)  # Electronics have higher margins
                elif "Automotive" in product_line:
                    cost_ratio = random.uniform(0.6, 0.8)  # Auto parts moderate margins
                elif "Construction" in product_line:
                    cost_ratio = random.uniform(0.5, 0.7)  # Construction materials lower margins
                else:
                    cost_ratio = random.uniform(0.6, 0.8)  # General range
                
                total_cost = gross_revenue * cost_ratio
                
                # Realistic returns patterns (5-15% of transactions have returns)
                has_returns = random.random() < 0.12  # 12% return rate
                returns_value = 0.0
                units_returned = 0
                
                if has_returns:
                    # Returns are usually partial and negative
                    return_ratio = random.uniform(0.1, 0.5)  # 10-50% of transaction
                    returns_value = -gross_revenue * return_ratio
                    units_returned = random.randint(1, min(units_sold, 3))  # Max 3 units returned
                
                # Realistic line item count (1-5 items per transaction)
                line_item_count = random.randint(1, 5)
                
                data.append({
                    "__time": transaction_dates[i],
                    "ProductLine": product_line,
                    "ItemGroup": item_group,
                    "Branch": branch,
                    "SalesPerson": sales_person,
                    "AcctName": customer,
                    "ItemName": product,
                    "CardName": customer,
                    "grossRevenue": round(gross_revenue, 2),
                    "returnsValue": round(returns_value, 2),
                    "unitsSold": units_sold,
                    "unitsReturned": units_returned,
                    "totalCost": round(total_cost, 2),
                    "lineItemCount": line_item_count
                })
            
            # Create DataFrame
            df = pl.DataFrame(data)
            return df
            
        except Exception as e:
            logger.error(f"Error generating transactions: {e}")
            return pl.DataFrame()

    def get_mock_data_range(self) -> Dict[str, Any]:
        """Get mock data range information (mimics get_data_range_from_druid)"""
        try:
            # Generate some sample data to get realistic date range
            df = self._generate_transactions("2024-01-01", "2024-12-31", 100)
            
            if df.is_empty():
                return {
                    "earliest_date": "2024-01-01T00:00:00.000Z",
                    "latest_date": "2024-12-31T00:00:00.000Z",
                    "total_records": 0
                }
            
            # Get min and max dates
            earliest_date = df["__time"].min()
            latest_date = df["__time"].max()
            total_records = len(df)
            
            # Convert to ISO format strings with proper type checking
            try:
                earliest_str = earliest_date.strftime("%Y-%m-%dT%H:%M:%S.000Z") if isinstance(earliest_date, datetime) else "2024-01-01T00:00:00.000Z"
                latest_str = latest_date.strftime("%Y-%m-%dT%H:%M:%S.000Z") if isinstance(latest_date, datetime) else "2024-12-31T00:00:00.000Z"
            except (AttributeError, TypeError):
                earliest_str = "2024-01-01T00:00:00.000Z"
                latest_str = "2024-12-31T00:00:00.000Z"
            
            return {
                "earliest_date": earliest_str,
                "latest_date": latest_str,
                "total_records": total_records
            }
            
        except Exception as e:
            logger.error(f"Error getting mock data range: {e}")
            return {
                "earliest_date": "2024-01-01T00:00:00.000Z",
                "latest_date": "2024-12-31T00:00:00.000Z",
                "total_records": 0
            }

# Global instance for centralized access
mock_data_fetcher = MockDataFetcher()
