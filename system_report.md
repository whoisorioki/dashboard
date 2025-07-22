 # System Inconsistency Report
 
 ## Executive Summary
 
 This report details inconsistencies found across the frontend and backend of the dashboard application. No markdown files were provided for analysis; this report is based on a thorough review of the provided `.tsx`, `.py`, and `.ts` source code files.
 
 The most critical issue is that the **frontend GraphQL type definitions are severely outdated** compared to the backend schema. This discrepancy leads to type errors, potential runtime bugs, and prevents the frontend from utilizing all available data from the API.
 
 Additionally, there are architectural inconsistencies, specifically the mixed use of REST and GraphQL for data fetching, and the presence of a seemingly legacy REST API alongside a more modern GraphQL API.
 
 ## 1. Critical: Outdated GraphQL Type Definitions
 
 The file `frontend/src/types/graphql.ts`, which is generated from the backend schema, is out of sync with `backend/schema/schema.py`. This is the root cause of several bugs and inconsistencies.
 
 ### Mismatched Fields:
 
 -   **`MonthlySalesGrowth`**: The frontend type expects `sales: number` while the backend provides `totalSales` and `grossProfit`. This directly impacts the "Sales Analytics Dashboard".
-   **`ProductAnalytics`**: The frontend type is missing `grossProfit` and `margin`, which are available in the backend and required by the "Product Analytics" page.
-   **`SalesPerformance`**: The frontend type is missing `grossProfit` and `avgMargin`, which are available in the backend and required by the "Sales Performance" page.
 
 ### Impact:
 
 -   **Type-Safety Failure**: TypeScript cannot correctly check the data shapes, defeating its purpose.
 -   **Bugs**: Components like `Dashboard.tsx` attempt to access non-existent fields (e.g., `totalSales` on an object typed to have `sales`), leading to errors.
 -   **Incomplete UI**: Pages like "Products" and "Sales" cannot display profitability metrics (`grossProfit`, `margin`) even though the backend provides them.
 
 ### Recommendation:
 
 The GraphQL types and query hooks **must be regenerated** using your GraphQL Code Generator setup. The changes below illustrate the corrections needed in `frontend/src/types/graphql.ts`.
 
 ## 2. Architectural Inconsistency: REST vs. GraphQL
 
 The application uses two different data-fetching strategies.
 
 -   **GraphQL**: Most pages (`Dashboard`, `Products`, `Sales`, `Branches`) use `react-query` with GraphQL hooks, which is a consistent and modern pattern.
 -   **REST**: The `ProfitabilityAnalysis.tsx` page appears to call a REST endpoint (`/kpis/margin-trends`) directly.
 
 The backend contains two corresponding APIs:
 
 -   `backend/schema/schema.py` (GraphQL)
 -   `backend/api/kpi_routes.py` (REST)
 
 These two APIs have overlapping functionality (e.g., both can provide margin trends). This duality increases maintenance overhead and can confuse developers.
 
 ### Recommendation:
 
 Standardize on a single data-fetching strategy. Since the application is heavily invested in GraphQL, the `ProfitabilityAnalysis.tsx` page should be refactored to use a GraphQL query hook. The REST API in `kpi_routes.py` should be evaluated for deprecation to simplify the architecture.
 
 ## 3. Outdated Code and Comments
 
 Some comments and `TODO`s in the code are no longer relevant.
 
 -   In `Dashboard.tsx`, a `TODO` comment states: `// TODO: Update backend to include totalTransactions in revenue summary`. However, the backend schema already provides this field. This comment is outdated and should be removed.
 
 ### Recommendation:
 
 Periodically review and remove outdated comments and `TODO`s to keep the codebase clean and accurate.
 
 ## 4. Proposed Code Changes
 
 The following diffs address the most critical issues identified in this report. Applying them will synchronize the frontend types with the backend, fix related bugs, and align the architecture.

