import numpy as np
import pandas as pd
import streamlit as st
import plotly.express as px
from datetime import datetime
import warnings

# Page configuration
st.set_page_config(
    page_title='Sales Analytics Dashboard',
    page_icon=':chart_with_upwards_trend:',
    layout='wide',
    initial_sidebar_state='expanded'
)

# Custom CSS
st.markdown("""
<style>
    body {
        background-color: #F5F5F5 !important;
        color: #333333 !important;
    }
    .main {
        background-color: #F5F5F5 !important;
    }
    .reportview-container .main .block-container {
        padding-top: 2rem;
    }
    .stSelectbox, .stMultiSelect, .stDateInput {
        margin-bottom: 1.5rem;
    }
    .metric-card {
        background-color: #FFFFFF;
        border-radius: 10px;
        padding: 1.5rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
</style>
""", unsafe_allow_html=True)

warnings.filterwarnings('ignore', category=FutureWarning)

import os
from google.cloud import storage
import pandas as pd
from io import StringIO
import streamlit as st

# Load configuration from environment variables (better for security)
PROJECT_ID = os.getenv('GOOGLE_CLOUD_PROJECT', 'sales-dashboard-461208')
BUCKET_NAME = os.getenv('GCS_BUCKET_NAME', 'data-sales-dashboard')
BLOB_NAME = os.getenv('GCS_BLOB_NAME', 'Data-Set (1).csv')

@st.cache_data
def load_data():
    try:
        # Initialize GCS client
        client = storage.Client(project=PROJECT_ID)
        bucket = client.bucket(BUCKET_NAME)
        blob = bucket.blob(BLOB_NAME)

        # Check if the blob exists
        if not blob.exists():
            st.error(f"File {BLOB_NAME} not found in bucket {BUCKET_NAME}.")
            return pd.DataFrame()
        

        # Download the data
        data_bytes = blob.download_as_bytes()
        data = StringIO(data_bytes.decode('utf-8'))

        # Read the CSV data from the in-memory string
        df = pd.read_csv(data, parse_dates=['DocDate'])

        # Process the DataFrame
        month_order = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December']
        df['DocDate'] = pd.to_datetime(df['DocDate'])
        df['Month'] = df['DocDate'].dt.month_name()
        df['Month'] = pd.Categorical(df['Month'], categories=month_order, ordered=True)
        df['Year'] = df['DocDate'].dt.year
        df['Total'] = df['Total'].astype(float)
        return df

    except Exception as e:
        st.error(f"Error loading data from GCS: {str(e)}")
        return pd.DataFrame()

# Load the data
st.write("App started successfully on App Engine.")
df = load_data()
st.write(f"Data loaded: {len(df)} rows")

# Rest of your app logic (KPIs, charts, etc.)...

# Check if the DataFrame is empty (indicating an error)
if df.empty:
    st.stop()

# Sidebar filters
with st.sidebar:
    st.title("Simple Sales Dashboard")

    # Date range filter
    start_date = st.date_input("Start date", df['DocDate'].min())
    end_date = st.date_input("End date", df['DocDate'].max())
    
    # Convert to datetime
    start_date = datetime.combine(start_date, datetime.min.time())
    end_date = datetime.combine(end_date, datetime.max.time())
    
    # Multi-select filters with "Select All" option
    all_branches = list(df['OcrName'].unique())
    all_categories = list(df['Item Group Name'].unique())

    select_all_branches = st.checkbox("Select All Branches", value=True)
    if select_all_branches:
        selected_branches = all_branches
    else:
        selected_branches = st.multiselect(
            "Select Branches:",
            options=all_branches,
            default=[all_branches[0]] if all_branches else []
        )

    select_all_categories = st.checkbox("Select All Product Categories", value=True)
    if select_all_categories:
        selected_categories = all_categories
    else:
        selected_categories = st.multiselect(
            "Select Product Categories:",
            options=all_categories,
            default=[all_categories[0]] if all_categories else []
        )

# Filter data
filtered_df = df[
    (df['OcrName'].isin(selected_branches)) &
    (df['Item Group Name'].isin(selected_categories)) &
    (df['DocDate'] >= start_date) &
    (df['DocDate'] <= end_date)
]

# Create two main columns (middle and right)
main_col, right_col = st.columns([3, 1])

with main_col:
    # KPI Cards
    st.header("Key Performance Indicators")
    col1, col2, col3 = st.columns(3)
    with col1:
        total_sales_millions = filtered_df['Total'].sum() / 1_000_000
        st.metric("Total Sales", f"{total_sales_millions:,.2f} M")
    with col2:
        avg_daily_sales_millions = filtered_df['Total'].mean() / 1_000_000
        st.metric("Average Daily Sales", f"{avg_daily_sales_millions:,.2f} M")
    with col3:
        monthly_sales = filtered_df.groupby('Month', observed=True)['Total'].sum()
        if len(monthly_sales) > 1:
            monthly_growth = monthly_sales.pct_change().iloc[-1] * 100
        else:
            monthly_growth = 0.0
        st.metric("Monthly Growth", f"{monthly_growth:.1f}%")


    # Visualizations
    tab1, tab2, tab3 = st.tabs(["Sales Overview", "Product Analysis", "Employee Performance"])
    

    with tab1:
        # Sales Trend Chart
        st.subheader("Monthly Sales Trend")
        trend_df = filtered_df.groupby(['Year', 'Month'], observed=True)['Total'].sum().reset_index()
        fig = px.line(
            trend_df,
            x='Month',
            y='Total',
            color='Year',
            markers=True,
            title="Monthly Sales Trend"
        )
        st.plotly_chart(fig, use_container_width=True, caption="This chart shows the top 10 employees based on total sales.")
        
        # Branch Comparison
        st.subheader("Branch Performance")
        branch_sales = filtered_df.groupby('OcrName', observed=True)['Total'].sum().reset_index()
        fig = px.bar(
            branch_sales,
            x='OcrName',
            y='Total',
            # color='OcrName',
            text_auto='.2s',
            title="Total Sales by Branch"
        )
        st.plotly_chart(fig, use_container_width=True)

    with tab2:
        # Product Category and Product Line Analysis
        col1, col2 = st.columns(2)
        with col1:
            st.subheader("Product Category Distribution")
            category_sales = filtered_df.groupby('Item Group Name')['Total'].sum().reset_index()
            fig = px.pie(
                category_sales,
                names='Item Group Name',
                values='Total',
                hole=0.4,
                title="Sales by Product Category"
            )
            st.plotly_chart(fig, use_container_width=True)
        
        with col2:
            st.subheader("Product Line Performance")
            product_line_sales = filtered_df.groupby('Product Line')['Total'].sum().reset_index()
            fig = px.bar(
                product_line_sales,
                x='Total',
                y='Product Line',
                orientation='h',
                title="Sales by Product Line"
            )
            st.plotly_chart(fig, use_container_width=True)

    with tab3:
        # Employee Performance
        st.subheader("Top Performing Employees")
        # Get top 10 employees by total sales
        employee_sales = (
            filtered_df.groupby(['Sales Employee', 'OcrName'])['Total']
            .sum()
            .reset_index()
        )
        # Get top 10 employees overall
        top_employees = (
            employee_sales.groupby('Sales Employee')['Total']
            .sum()
            .nlargest(10)
            .index
        )
        # Filter to top 10 and sort for horizontal bar
        employee_sales = employee_sales[employee_sales['Sales Employee'].isin(top_employees)]
        employee_sales = employee_sales.sort_values('Total', ascending=True)

        fig = px.bar(
            employee_sales,
            x='Total',
            y='Sales Employee',
            orientation='h',
            color='OcrName',
            title="Top 10 Sales Employees",
            hover_data=['OcrName', 'Total']
        )
        st.plotly_chart(fig, use_container_width=True)
        
with right_col:
    st.header("Branch & Employee Drilldown")

    # Branch selection
    branch_options = list(filtered_df['OcrName'].unique())
    selected_branch = st.selectbox("Select Branch", branch_options)

    # Filter by selected branch
    branch_df = filtered_df[filtered_df['OcrName'] == selected_branch]

    # Employee selection within branch
    employee_options = list(branch_df['Sales Employee'].unique())
    selected_employee = st.selectbox("Select Sales Employee", employee_options)

    # Find the date with the highest total sales for the selected employee
    emp_sales_by_date = branch_df[branch_df['Sales Employee'] == selected_employee].groupby('DocDate')['Total'].sum()
    if not emp_sales_by_date.empty:
        max_sales_date = emp_sales_by_date.idxmax()
        max_sales_value = emp_sales_by_date.max()
        st.success(
            f"Highest sales for {selected_employee} was on {max_sales_date.date()} with {max_sales_value/1_000_000:,.2f} M"
        )
    else:
        st.info("No sales data available for the selected employee.")

    # Time filters
    years = sorted(branch_df['Year'].unique())
    selected_year = st.selectbox("Select Year", years)

    months = branch_df[branch_df['Year'] == selected_year]['Month'].unique()
    selected_month = st.selectbox("Select Month", months)

    days = branch_df[
        (branch_df['Year'] == selected_year) & 
        (branch_df['Month'] == selected_month)]['DocDate'].dt.day.unique()
    selected_day = st.selectbox("Select Day", sorted(days))

    drilldown_df = branch_df[
        (branch_df['Sales Employee'] == selected_employee) &
        (branch_df['Year'] == selected_year) &
        (branch_df['Month'] == selected_month) &
        (branch_df['DocDate'].dt.day == selected_day)
    ]
    if drilldown_df.empty:
        st.info("No sales data available for the selected filters.")
    else:
        # Display metrics in millions
        sales_millions = drilldown_df['Total'].sum() / 1_000_000
        st.metric(f"Sales by {selected_employee}", f"{sales_millions:,.2f} M")
        st.metric(f"Number of Products Sold", int(drilldown_df['Total'].count()))