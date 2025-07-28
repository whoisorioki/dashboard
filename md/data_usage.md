# Data Usage Audit: Dashboard, Sales, and Branches Pages

This document details which data fields are used for each KPI, chart, and table in the main analytics pages. It clarifies the distinction between **Net Sales** (totalSales) and **Gross Revenue** (totalRevenue), and maps each frontend element to its backend/query data source.

---

## 1. Dashboard Page

| Element                            | Data Field(s) Used                                                 | Notes                                                                          |
| ---------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| **KPI: Total Sales**               | `totalSales` (sum of `monthlySalesGrowth.totalSales`)              | **Net Sales**: Calculated as the sum of total sales from monthly sales growth. |
| **KPI: Sales Growth (YoY)**        | `monthlySalesGrowth.totalSales`                                    | Calculated as % change between first and last month in the period.             |
| **KPI: Avg Deal Size**             | `revenueSummary.totalRevenue` / `revenueSummary.totalTransactions` | Uses **Gross Revenue** divided by transaction count.                           |
| **KPI: Target Attainment**         | `targetAttainment.attainmentPercentage`                            | % of sales target achieved.                                                    |
| **Chart: Quota Attainment Gauge**  | `targetAttainment`                                                 | Visualizes attainment percentage.                                              |
| **Chart: Monthly Sales Trend**     | `monthlySalesGrowth`                                               | Plots `totalSales` over time.                                                  |
| **Chart: Product Performance**     | `productPerformance`                                               | Plots product sales.                                                           |
| **Chart: Branch Product Heatmap**  | `branchProductHeatmap`                                             | Heatmap of sales by branch/product.                                            |
| **Table: Top Customers**           | `topCustomers`                                                     | Shows customer name, sales amount, gross profit.                               |
| **Table: Margin Trends**           | `marginTrends`                                                     | Shows margin % by month.                                                       |
| **Table: Profitability by Branch** | `profitabilityByDimension` (dimension: Branch)                     | Shows branch, gross profit, gross margin.                                      |
| **Table: Returns Analysis**        | `returnsAnalysis`                                                  | Shows return reasons and counts.                                               |

---

## 2. Sales Page

| Element                               | Data Field(s) Used                  | Notes                                                  |
| ------------------------------------- | ----------------------------------- | ------------------------------------------------------ |
| **KPI: Total Revenue**                | `revenueSummary.totalRevenue`       | **Gross Revenue**: All sales before returns/discounts. |
| **KPI: Total Transactions**           | `revenueSummary.totalTransactions`  | Number of sales transactions.                          |
| **KPI: Avg Transaction**              | `revenueSummary.averageTransaction` | Average value per transaction.                         |
| **KPI: Active Employees**             | `revenueSummary.uniqueEmployees`    | Number of unique sales employees.                      |
| **Chart: Monthly Sales Trend**        | `monthlySalesGrowth`                | Plots `totalSales` over time.                          |
| **Table: Top Performers**             | `salesPerformance`                  | Top 5 by `totalSales`.                                 |
| **Table: Sales Employee Performance** | `salesPerformance`                  | Table of sales metrics per employee.                   |
| **Table: Salesperson Product Mix**    | `salespersonProductMix`             | Table of salesperson, product line, avg profit margin. |

---

## 3. Branches Page

| Element                                  | Data Field(s) Used                          | Notes                                                                              |
| ---------------------------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------- |
| **KPI: Total Sales**                     | sum of `branchPerformance.totalSales`       | **Net Sales**: Sum across all branches.                                            |
| **KPI: Total Transactions**              | sum of `branchPerformance.transactionCount` | Sum across all branches.                                                           |
| **KPI: Unique Customers**                | sum of `branchPerformance.uniqueCustomers`  | Sum across all branches.                                                           |
| **KPI: Products Sold**                   | sum of `branchPerformance.uniqueProducts`   | Sum across all branches.                                                           |
| **Table: Branch Performance Overview**   | `branchPerformance`                         | Table of sales, transactions, avg sale, customers, growth, performance per branch. |
| **Chart: Product Performance by Branch** | `branchPerformance` (mapped to heatmapData) | Heatmap of sales by branch.                                                        |
| **Table: Top Performing Branches**       | `branchPerformance`                         | Top 5 by `totalSales`.                                                             |
| **Table: Branch Growth Summary**         | `branchGrowth` and `branchPerformance`      | Shows growth % and product count per branch.                                       |

---

## 4. Field Definitions

- **Net Sales (`totalSales`)**: Sales after returns/discounts, used for KPIs labeled "Total Sales".
- **Gross Revenue (`totalRevenue`)**: All sales before returns/discounts, used for KPIs labeled "Total Revenue".
- **totalTransactions**: Number of sales transactions.
- **averageTransaction**: Average value per transaction.
- **uniqueEmployees**: Number of unique sales employees.
- **uniqueCustomers**: Number of unique customers served.
- **uniqueProducts**: Number of unique products sold.
- **grossProfit**: Profit after cost of goods sold.
- **grossMargin**: Gross profit as a percentage of sales.

---

## 5. Notes & Recommendations

- **Label Consistency**: Ensure that "Total Sales" always refers to Net Sales and "Total Revenue" to Gross Revenue in all KPIs and tooltips.
- **Backend Alignment**: All frontend KPIs and charts should use the correct field as per backend definitions and business logic.
- **Future Improvements**: Consider adding explicit tooltips or info icons to clarify the source and meaning of each KPI for end users. 