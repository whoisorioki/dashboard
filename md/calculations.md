# Druid Data Columns

| Column Name   | Data Type | Description                                                                                        |
| ------------- | --------- | -------------------------------------------------------------------------------------------------- |
| __time        | TIMESTAMP | Primary timestamp for every row in Druid, used for time-based partitioning and filtering.          |
| ProductLine   | STRING    | High-level product brand or category. Cleaned to 'Unknown' if NULL or 'SELECT'.                    |
| ItemGroup     | STRING    | Specific product group or sub-category. Cleaned to 'Unknown' if NULL.                              |
| Branch        | STRING    | Store or branch location where the transaction occurred.                                           |
| SalesPerson   | STRING    | Name of the sales employee or sales channel responsible for the transaction.                       |
| AcctName      | STRING    | Account name of the customer.                                                                      |
| ItemName      | STRING    | Specific name of the product involved in the transaction.                                          |
| CardName      | STRING    | Customer's name, used for analyzing sales by individual customer.                                  |
| grossRevenue  | DOUBLE    | Total sales value (sum of SalesAmount from 'AR Invoice' only).                                     |
| returnsValue  | DOUBLE    | Total value of returned items (sum of SalesAmount from 'AR Credit Note', negative for returns).    |
| unitsSold     | DOUBLE    | Total quantity of items sold (sum of SalesQty from 'AR Invoice').                                  |
| unitsReturned | DOUBLE    | Total quantity of items returned (sum of SalesQty from 'AR Credit Note').                          |
| totalCost     | DOUBLE    | Total cost of goods sold (sum of CostOfSales).                                                     |
| lineItemCount | LONG      | Count of original transaction rows from the PostgreSQL Sales table aggregated into each Druid row. |

---

# KPI Calculations and Definitions

| Metric Name                  | Formula / Definition                                     | Description                                    |
| ---------------------------- | -------------------------------------------------------- | ---------------------------------------------- |
| **Gross Revenue**            | `sum(grossRevenue)`                                      | Total sales value from AR Invoice              |
| **Net Sales**                | `sum(grossRevenue) + sum(returnsValue)`                  | Gross revenue minus returns                    |
| **Gross Profit**             | `sum(grossRevenue) - sum(totalCost)`                     | Profit before expenses                         |
| **Margin**                   | `(Gross Profit) / (Gross Revenue)`                       | Profit as a % of revenue                       |
| **Net Units Sold**           | `sum(unitsSold) + sum(unitsReturned)`                    | Total items sold minus returns                 |
| **Total Transactions**       | `sum(lineItemCount)`                                     | Number of sales transactions                   |
| **Average Transaction Size** | `Gross Revenue / Total Transactions`                     | Mean value per transaction                     |
| **Returns**                  | `sum(returnsValue)`                                      | Total value of returned items (negative value) |
| **Loss-Making Sales**        | `count where Gross Profit < 0`                           | Number of transactions with negative profit    |
| **Discount Rate**            | `1 - (SalesAmount / (UnitPrice * SalesQty))` (OLTP only) | Proportion of discount given per transaction   |

---

## Metrics Not Calculable with Current Data

| Metric Name                | Why Not Calculable?                                                                                                   |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Net Profit**             | Requires operating expenses, taxes, interest, and other non-COGS expenses, which are not present in the current data. |
| **EBITDA/EBIT/Net Income** | Require expense, tax, and interest data not available in the Druid sales dataset.                                     |

**Note:**
- The `netProfit` field in the API is always `0.0` because it is not calculated or available in the backend. This is a placeholder for future data expansion.
- According to business standards ([Investopedia - Net Profit](https://www.investopedia.com/terms/n/netincome.asp)), Net Profit = Revenue - Cost of Goods Sold - Operating Expenses - Interest - Taxes - Other Expenses. Your current data only covers revenue and COGS.

---

## Example Utility Functions (Python/Polars)

```python
def sum_gross_revenue(df):
    return float(df.lazy().select(pl.sum("grossRevenue")).collect().item())

def sum_net_sales(df):
    return float(df.lazy().select(pl.sum("grossRevenue") + pl.sum("returnsValue")).collect().item())

def calc_gross_profit(df):
    return float(df.lazy().select(pl.sum("grossRevenue") - pl.sum("totalCost")).collect().item())

def calc_margin(df):
    gross_revenue = sum_gross_revenue(df)
    gross_profit = calc_gross_profit(df)
    return (gross_profit / gross_revenue) if gross_revenue else 0.0

def sum_net_units_sold(df):
    return float(df.lazy().select(pl.sum("unitsSold") + pl.sum("unitsReturned")).collect().item())

def sum_line_item_count(df):
    return float(df.lazy().select(pl.sum("lineItemCount")).collect().item())

def sum_returns_value(df):
    return float(df.lazy().select(pl.sum("returnsValue")).collect().item())
```

---

## Business Definitions
- **Gross Revenue**: Total value of all sales (after discounts, before returns).
- **Net Sales**: Gross revenue minus the value of returns (credit notes).
- **Gross Profit**: Revenue minus cost of goods sold.
- **Margin**: Gross profit as a percentage of gross revenue.
- **Net Units Sold**: Total quantity sold minus quantity returned.
- **Total Transactions**: Number of sales transactions (uses sum of lineItemCount for accuracy).
- **Average Transaction Size**: Mean value per transaction.
- **Returns**: Total value of returned items (should be negative, uses returnsValue).
- **Loss-Making Sales**: Transactions where gross profit is negative.
- **Discount Rate**: Proportion of discount given per transaction (OLTP only).
- **Net Profit**: Not available with current data. See above for business definition and requirements.