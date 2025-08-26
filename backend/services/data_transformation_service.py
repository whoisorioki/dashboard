import polars as pl
import pandas as pd
import numpy as np
import logging
import random
import time
import os
from datetime import datetime
from faker import Faker
from typing import Optional

# --- Configuration & Setup ---
logging.basicConfig(
    level=logging.INFO, 
    format='%(asctime)s - %(levelname)s - [%(funcName)s] - %(message)s'
)
fake = Faker()

class DataTransformationService:
    """Service for transforming raw CSV data into the correct format for Druid ingestion."""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
    
    def generate_card_name_series(self, series: pl.Series) -> pl.Series:
        """Generates realistic CardNames based on the SalesPerson's name."""
        return series.map_elements(
            lambda name: fake.name() if isinstance(name, str) and 'walk in' in name.lower()
            else f"{fake.company()} {random.choice(['Ltd', 'Enterprises', 'Spares', 'Solutions'])}",
            return_dtype=pl.String
        )
    
    def validate_transformed_data(self, df: pl.DataFrame) -> bool:
        """Checks the final Polars DataFrame for quality and consistency according to Druid schema."""
        self.logger.info("--- Starting Druid Schema Validation Report ---")
        issues_found = 0

        # 1. Schema Compliance Check
        expected_columns = [
            '__time', 'ProductLine', 'ItemGroup', 'Branch', 'SalesPerson', 
            'AcctName', 'ItemName', 'CardName', 'grossRevenue', 'returnsValue', 
            'totalCost', 'unitsSold', 'unitsReturned', 'lineItemCount'
        ]
        
        actual_columns = df.columns
        missing_columns = set(expected_columns) - set(actual_columns)
        extra_columns = set(actual_columns) - set(expected_columns)
        
        if missing_columns:
            self.logger.error(f"❌ Missing required columns: {missing_columns}")
            issues_found += 1
        if extra_columns:
            self.logger.warning(f"⚠️ Extra columns found: {extra_columns}")
        
        if not missing_columns:
            self.logger.info("✅ Schema Compliance: All required columns present")

        # 2. Data Type Validation
        self.logger.info("🔍 Validating data types...")
        
        # Check __time format (should be ISO string)
        time_sample = df.select(pl.col('__time')).head(1).item()
        if not isinstance(time_sample, str) or 'T' not in time_sample:
            self.logger.error("❌ __time column is not in ISO format")
            issues_found += 1
        else:
            self.logger.info("✅ __time format: ISO timestamp string")
        
        # Check numeric columns
        numeric_columns = ['grossRevenue', 'returnsValue', 'totalCost', 'unitsSold', 'unitsReturned', 'lineItemCount']
        for col in numeric_columns:
            if col in df.columns:
                sample_val = df.select(pl.col(col)).head(1).item()
                if not isinstance(sample_val, (int, float)):
                    self.logger.error(f"❌ {col} is not numeric: {type(sample_val)}")
                    issues_found += 1
                else:
                    self.logger.info(f"✅ {col}: {type(sample_val).__name__}")

        # 3. Null Value Check
        null_count = df.null_count().select(pl.sum_horizontal(pl.all())).item()
        if null_count > 0:
            self.logger.warning(f"⚠️ NULL values found: {null_count}")
            self.logger.warning(f"NULL breakdown:\n{df.null_count()}")
        else:
            self.logger.info("✅ Null Value Check: Passed. No null values found.")

        # 4. Business Logic Validation
        # Check that grossRevenue and returnsValue are mutually exclusive
        invalid_rows = df.filter((pl.col('grossRevenue') > 0) & (pl.col('returnsValue') > 0))
        if invalid_rows.height > 0:
            self.logger.warning(f"⚠️ Found {invalid_rows.height} rows with both grossRevenue and returnsValue")
            issues_found += 1
        else:
            self.logger.info("✅ Business Logic: Sales and returns are mutually exclusive")

        # 5. Time Range Check
        time_col = df.select(pl.col('__time').str.to_datetime())
        min_date = time_col.select(pl.min('__time')).item()
        max_date = time_col.select(pl.max('__time')).item()
        self.logger.info(f"📅 Time Range: {min_date} to {max_date}")
        
        if max_date > datetime.now().replace(tzinfo=max_date.tzinfo):
            self.logger.warning("⚠️ Future dates found in data")
            issues_found += 1
        else:
            self.logger.info("✅ Time Range Check: Passed. No future dates.")

        # 6. Data Volume Check
        self.logger.info(f"📊 Total Rows: {df.height}")
        self.logger.info(f"📊 Total Columns: {df.width}")

        self.logger.info("--- Druid Schema Validation Report Complete ---")
        if issues_found == 0:
            self.logger.info("🎉 Success! All Druid schema validation checks passed.")
        else:
            self.logger.error(f"❌ Found {issues_found} validation issue(s). Please review the logs.")
        
        return issues_found == 0
    
    def clean_csv_file(self, source_file: str) -> str:
        """
        Pre-cleans the CSV file to fix embedded comma issues before transformation.
        This is a critical step to ensure proper parsing.
        """
        self.logger.info(f"🧹 Pre-cleaning CSV file: {source_file}")
        
        # Create cleaned file path
        base_name = os.path.splitext(source_file)[0]
        cleaned_file = f"{base_name}_cleaned.csv"
        
        try:
            with open(source_file, 'r', encoding='latin1') as infile, \
                 open(cleaned_file, 'w', encoding='utf-8', newline='') as outfile:
                
                # Read line by line to handle complex CSV structure
                for line_num, line in enumerate(infile, 1):
                    if line_num == 1:
                        # Write header as-is
                        outfile.write(line)
                        continue
                    
                    # Clean the line by properly handling quoted fields
                    cleaned_line = self._clean_csv_line(line)
                    outfile.write(cleaned_line)
            
            self.logger.info(f"✅ CSV cleaned and saved to: {cleaned_file}")
            return cleaned_file
            
        except Exception as e:
            self.logger.error(f"❌ Failed to clean CSV: {e}")
            raise

    def _clean_csv_line(self, line: str) -> str:
        """
        Cleans a single CSV line by properly handling quoted fields with embedded commas.
        """
        # Remove any trailing whitespace
        line = line.strip()
        
        # If line is empty, return as-is
        if not line:
            return line + '\n'
        
        # Use a more robust approach: split by comma but respect quoted fields
        fields = []
        current_field = ""
        in_quotes = False
        quote_count = 0
        i = 0
        
        while i < len(line):
            char = line[i]
            
            if char == '"':
                quote_count += 1
                if quote_count % 2 == 1:  # Odd number of quotes
                    in_quotes = True
                else:  # Even number of quotes
                    in_quotes = False
                current_field += char
                i += 1
            elif char == ',' and not in_quotes:
                # End of field
                fields.append(current_field.strip())
                current_field = ""
                i += 1
            else:
                # Regular character
                current_field += char
                i += 1
        
        # Add the last field
        fields.append(current_field.strip())
        
        # Ensure we have exactly 9 fields (the expected column count)
        expected_fields = 9
        if len(fields) > expected_fields:
            # If we have too many fields, merge the extra ones into the last field
            while len(fields) > expected_fields:
                fields[-2] = fields[-2] + "," + fields[-1]
                fields.pop()
        elif len(fields) < expected_fields:
            # If we have too few fields, pad with empty strings
            while len(fields) < expected_fields:
                fields.append("")
        
        # Clean each field
        cleaned_fields = []
        for field in fields:
            # Remove surrounding quotes if they exist
            if field.startswith('"') and field.endswith('"'):
                field = field[1:-1]
            
            # Clean the field content
            cleaned_field = field.replace('\n', ' ').replace('\r', ' ').strip()
            cleaned_fields.append(cleaned_field)
        
        # Join fields back together
        return ','.join(cleaned_fields) + '\n'

    def read_source_file(self, source_file: str) -> pl.LazyFrame:
        """Reads the source CSV robustly using Polars' native CSV parser."""
        self.logger.info(f"🚀 Reading source file with robust Polars parsing: {source_file}")
        
        if not os.path.exists(source_file):
            raise FileNotFoundError(f"Source file not found: {source_file}")
        
        try:
            # Use robust Polars CSV reading - no pre-cleaning needed!
            df = pl.read_csv(
                source_file,
                separator=',',
                quote_char='"',
                has_header=True,
                ignore_errors=True,  # Skip malformed rows gracefully
                infer_schema_length=10000,  # Better schema detection
                encoding='utf8-lossy'  # Handle encoding issues
            )
            
            self.logger.info(f"✅ Successfully loaded {df.height} rows with {df.width} columns.")
            self.logger.info(f"📊 Columns: {list(df.columns)}")
            
            # Verify data quality by checking first row
            if df.height > 0:
                first_row = df.head(1)
                self.logger.info("🔍 First row sample:")
                for col in df.columns:
                    sample_val = first_row.select(pl.col(col)).item()
                    self.logger.info(f"  {col}: {type(sample_val).__name__} = '{sample_val}'")
            
            # Convert to LazyFrame for efficient processing
            lazy_df = df.lazy()
            return lazy_df
            
        except Exception as e:
            self.logger.error(f"❌ Robust Polars CSV reading failed: {e}")
            raise
    
    def apply_transformations(self, lazy_df: pl.LazyFrame) -> pl.LazyFrame:
        """Applies all cleaning, generation, and business logic to the LazyFrame."""
        self.logger.info("Applying transformation plan...")
        n_rows = lazy_df.select(pl.len()).collect().item()
        
        column_rename_map = {col: col.strip() for col in lazy_df.collect_schema().names()}

        transformed_lazy_df = (
            lazy_df
            .rename(column_rename_map)
            .with_columns(
                # Clean and coerce types according to Druid schema
                pl.col('OcrName').fill_null('Unknown').alias('Branch'),
                pl.col('Product Line').fill_null('Unknown').str.replace_all('SELECT', 'Unknown'),
                pl.col('Sales Employee').fill_null('Unknown'),
                pl.col('Item Group Name').fill_null('Unknown').alias('ItemGroup'),
                pl.col('Dscription').fill_null('Unknown').str.replace_all('"', '').str.strip_chars().alias('ItemName'),
                
                # Clean numeric fields - remove commas and convert to proper types
                pl.col('Line Total').str.replace_all(',', '').cast(pl.Float64, strict=False).fill_null(0.0),
                pl.col('Qty').cast(pl.Float64, strict=False).fill_null(0.0),
                
                # Generate AcctName based on business logic
                pl.Series("AcctName", np.random.choice(['Cash sales', 'Credit sales'], size=n_rows, p=[0.85, 0.15])),
                
                # Generate CardName for customer identification
                pl.col('Sales Employee').map_elements(
                    lambda name: fake.name() if isinstance(name, str) and 'walk in' in name.lower()
                    else f"{fake.company()} {random.choice(['Ltd', 'Enterprises', 'Spares', 'Solutions'])}",
                    return_dtype=pl.String
                ).alias('CardName')
            )
            .with_columns(
                # FIXED: Explicit date format specification to prevent DD/MM vs MM/DD confusion
                __time=pl.col("DocDate").str.to_datetime(format="%d/%m/%Y"),
            )
            # FIX: Filter out any records with a date in the future to correct the time range.
            .filter(pl.col("__time") <= datetime.now())
            .with_columns(
                # Determine document type based on Line Total sign
                DocType=pl.when(pl.col('Line Total') < 0).then(pl.lit('AR Credit Note')).otherwise(pl.lit('AR Invoice')),
            )
            .with_columns(
                # Financial calculations aligned with Druid schema metrics
                grossRevenue=pl.when(pl.col('DocType') == 'AR Invoice').then(pl.col('Line Total')).otherwise(0.0),
                returnsValue=pl.when(pl.col('DocType') == 'AR Credit Note').then(pl.col('Line Total')).otherwise(0.0),
                unitsSold=pl.when(pl.col('DocType') == 'AR Invoice').then(pl.col('Qty').abs()).otherwise(0.0),
                unitsReturned=pl.when(pl.col('DocType') == 'AR Credit Note').then(pl.col('Qty')).otherwise(0.0),
            )
            .with_columns(
                # Calculate totalCost as 70-80% of Line Total (simulated cost of goods sold)
                totalCost=(pl.col('Line Total').abs() * 0.75).round(2).fill_null(0.0)
            )
            .with_columns(
                # Each row represents one line item
                lineItemCount=pl.lit(1, dtype=pl.Int64)
            )
            # Convert __time to the final string format AFTER filtering
            .with_columns(
                __time=pl.col("__time").dt.strftime('%Y-%m-%dT00:00:00.000Z')
            )
            # Sort by date for proper time-series ordering
            .sort("__time")
            .select([
                '__time',
                'Branch',
                pl.col('Product Line').alias('ProductLine'),
                pl.col('Sales Employee').alias('SalesPerson'),
                'ItemGroup',
                'AcctName', 
                'ItemName', 
                'CardName', 
                'grossRevenue', 
                'lineItemCount',
                'returnsValue', 
                'totalCost', 
                'unitsReturned', 
                'unitsSold'
            ])
        )
        self.logger.info("Transformation plan created successfully.")
        return transformed_lazy_df
    
    def transform_data(self, source_file: str, output_file: str) -> bool:
        """
        Main function to orchestrate the data transformation pipeline.
        Returns True if successful, False otherwise.
        """
        total_start_time = time.time()
        try:
            # Step 1: Read the data
            step_start_time = time.time()
            initial_lazy_df = self.read_source_file(source_file)
            self.logger.info(f"Step 1 (Read) completed in {time.time() - step_start_time:.2f} seconds.")
            
            # Step 2: Apply all transformations
            step_start_time = time.time()
            transformed_lazy_df = self.apply_transformations(initial_lazy_df)
            self.logger.info(f"Step 2 (Plan) completed in {time.time() - step_start_time:.2f} seconds.")
            
            # Step 3: Execute the plan
            step_start_time = time.time()
            self.logger.info("Executing transformation plan...")
            final_df = transformed_lazy_df.collect()
            self.logger.info(f"Step 3 (Execute) completed in {time.time() - step_start_time:.2f} seconds.")
            
            # Step 4: Validate the final data
            step_start_time = time.time()
            validation_passed = self.validate_transformed_data(final_df)
            self.logger.info(f"Step 4 (Validate) completed in {time.time() - step_start_time:.2f} seconds.")
            
            if validation_passed:
                # Step 5: Write to CSV if validation passes
                step_start_time = time.time()
                self.logger.info(f"Writing transformed data to '{output_file}'...")
                final_df.write_csv(output_file)
                self.logger.info(f"Step 5 (Write) completed in {time.time() - step_start_time:.2f} seconds.")
                self.logger.info("🎉 Data transformation completed successfully!")
                return True
            else:
                self.logger.error("❌ Data transformation failed validation. Output file not written.")
                return False

        except FileNotFoundError:
            self.logger.error(f"Error: The file '{source_file}' was not found.")
            return False
        except Exception as e:
            self.logger.error(f"An unexpected error occurred during the process: {e}", exc_info=True)
            return False
        finally:
            total_end_time = time.time()
            self.logger.info(f"Total transformation time: {total_end_time - total_start_time:.2f} seconds.")
    
    def get_data_range_info(self, csv_file: str) -> Optional[dict]:
        """Get information about the data range in a CSV file."""
        try:
            df = pl.read_csv(csv_file)
            if '__time' not in df.columns:
                return None
            
            # Parse the time column
            time_col = df.select(pl.col('__time').str.to_datetime())
            min_date = time_col.select(pl.min('__time')).item()
            max_date = time_col.select(pl.max('__time')).item()
            
            return {
                'min_date': min_date,
                'max_date': max_date,
                'total_days': (max_date - min_date).days,
                'total_months': ((max_date.year - min_date.year) * 12 + max_date.month - min_date.month),
                'row_count': len(df)
            }
        except Exception as e:
            self.logger.error(f"Error getting data range info: {e}")
            return None

# Convenience function for direct usage
def transform_sales_data(source_file: str, output_file: str) -> bool:
    """Convenience function to transform sales data."""
    service = DataTransformationService()
    return service.transform_data(source_file, output_file)

if __name__ == "__main__":
    # Example usage
    SOURCE_CSV_FILE = 'Data-Set_V2.csv'
    OUTPUT_CSV_FILE = 'sales_analytics_fixed.csv'
    
    success = transform_sales_data(SOURCE_CSV_FILE, OUTPUT_CSV_FILE)
    if success:
        print("✅ Data transformation completed successfully!")
        
        # Show data range info
        service = DataTransformationService()
        range_info = service.get_data_range_info(OUTPUT_CSV_FILE)
        if range_info:
            print(f"📊 Data Range: {range_info['min_date']} to {range_info['max_date']}")
            print(f"📅 Total Span: {range_info['total_months']} months ({range_info['total_days']} days)")
            print(f"📈 Total Rows: {range_info['row_count']:,}")
    else:
        print("❌ Data transformation failed!")
