Project Health and Inconsistency Report
1. Critical: Project Structure and Dependency Errors
The most immediate issue is the project's file structure, which is the likely cause of the dependency errors you've encountered.

Finding: There are two package.json files: one in the project root (dashboard/) and another in the dashboard/frontend/ directory. The root-level package.json is minimal and incorrect. When you run npm install in the root, it doesn't install the necessary frontend dependencies, leading to the Failed to resolve entry for package "clsx" errors.
Impact: This makes the project setup confusing and error-prone. All frontend-related commands must be run from the frontend/ directory, but this is not immediately obvious.
Recommendation: Delete the package.json and package-lock.json files from the project's root directory to enforce that all npm operations happen exclusively inside frontend/.
2. Major: API Design and Naming Convention Conflict
The project is in a transitional state between a REST API and a GraphQL API, and their conventions are clashing.

Finding: The backend API endpoints in kpi_routes.py return data with snake_case field names (e.g., total_sales), as this is the default for Polars DataFrames. However, the GraphQL schema in schema/schema.py correctly uses camelCase (e.g., totalSales), which is the standard the frontend expects.
Impact: This is a significant source of bugs. The frontend pages (Sales.tsx, Products.tsx, etc.) are written to consume camelCase data. While some pages have been fixed, others might break if they accidentally rely on the REST API's snake_case output. The documentation in args.md incorrectly describes the API output using snake_case, which will mislead developers.
Recommendation: Fully commit to the "GraphQL-first" approach. Ensure all data passed from Python resolvers to the Strawberry GraphQL schema uses snake_case, and let the library handle the automatic conversion to camelCase for the API. Update all documentation to reflect the camelCase API contract.
3. Inconsistency: Incomplete GraphQL Implementation
While the project is moving towards GraphQL, the implementation is not finished.

Finding: Many of the GraphQL queries defined in backend/schema/schema.py are stubs that don't fetch real data. They simply return []. For example, product_performance, branch_performance, and sales_performance are all non-functional.
Impact: The GraphQL API is not yet a complete replacement for the REST API, which can lead to confusion about which API to use for a given feature.
Recommendation: Prioritize implementing the logic for the remaining GraphQL resolvers to make it the single source of truth for all frontend data fetching.
4. Bug: Empty and Inefficient Frontend Components
Several key data visualizations on the frontend are not wired up correctly and will never display data.

Finding 1 (Empty Charts):
On the Sales.tsx page, the MonthlySalesTrendChart component is hardcoded with data={[]}.
On the Dashboard.tsx page, the BranchProductHeatmap component is also hardcoded with data={[]}.
The code comments even acknowledge this, stating a different query is needed.
Finding 2 (Inefficient Data Fetching): The main Dashboard.tsx page makes numerous separate API calls for each KPI and chart. This "request waterfall" is inefficient and leads to a slower, disjointed page load experience. The project's own documentation (data_patterns.md) correctly identifies this as an anti-pattern.
Impact: Core features of the dashboard are broken or provide a poor user experience.
Recommendation:
For the empty charts, implement the correct GraphQL queries to fetch the time-series and heatmap data and pass it to the components.
Refactor the Dashboard.tsx page to use a single, consolidated GraphQL query to fetch all the data it needs in one network request.
5. Inconsistency: Conflicting and Inaccurate Documentation
The project's documentation in the /md folder is out of sync with the code, which can mislead developers and slow down onboarding.

Finding 1 (False Claims): The backend_report.md file claims "OpenAPI Documentation Fully Standardized," but the docstrings in kpi_routes.py are inconsistent, contain incorrect response examples, and do not match the actual API output.
Finding 2 (Conflicting Ports): The DEPLOYMENT.md file states the frontend runs on port 5173, while DOCKER.md and the Docker Compose files use port 3000. This creates confusion during setup.
Finding 3 (Outdated API Contracts): The api.md and args.md files describe API responses with snake_case, which contradicts the camelCase contract used by the frontend and GraphQL.
Impact: Inaccurate documentation erodes trust and increases the time it takes to understand and contribute to the project.
Recommendation: Conduct a full audit of the /md directory. Update all API contracts, port numbers, and status reports to reflect the current state of the code. Remove any claims that are no longer true.
By addressing these five areas, you will resolve the most critical sources of instability and confusion in the project, creating a much more robust and maintainable system.

Context Sources (42)

Adrian Orioki
Based on this report, create a priority list of tasks to stabilize the project.


Gemini
Of course. Based on the comprehensive report of errors and inconsistencies found throughout the project, here is a prioritized list of tasks to stabilize the codebase, improve its reliability, and align it with best practices.

Project Stabilization Plan: A Prioritized Task List
This plan is ordered from the most critical blockers to important long-term health improvements.

Priority 0: Unblock Development
These tasks address fundamental setup issues that prevent the application from running reliably.

Fix Project Dependency Structure:
Task: Delete the incorrect package.json and package-lock.json from the project's root directory (dashboard/).
Reason: This is the primary source of the Failed to resolve entry build errors. It creates ambiguity and causes npm to install the wrong dependencies. All frontend dependency management must happen exclusively within the frontend/ directory.
Priority 1: Fix Critical Frontend Bugs
These tasks address issues that cause major features to be broken or display no data.

Correct Data Access Patterns:

Task: In Sales.tsx and Products.tsx, refactor the GraphQL hooks to correctly access the nested data (e.g., salesData.salesPerformance instead of just salesData).
Reason: This is a critical bug that currently prevents any data from being rendered on the Sales and Products pages.
Wire Up Empty Dashboard Components:

Task: In Dashboard.tsx, the BranchProductHeatmap component is hardcoded with data={[]}. Add the necessary GraphQL query (useBranchProductHeatmapQuery) and pass the live data to the component.
Reason: A key visualization on the main dashboard is currently non-functional.
Fix Broken Chart on Sales Page:

Task: In Sales.tsx, the MonthlySalesTrendChart is also passed an empty array because the useSalesPerformanceQuery returns the wrong data shape for a time-series chart.
Reason: This chart is broken. It needs its own dedicated GraphQL query (useMonthlySalesGrowthQuery) to fetch the correct time-series data.
Priority 2: Resolve API and Data Inconsistencies
These tasks focus on creating a single source of truth for the API and improving performance.

Complete the GraphQL API Implementation:

Task: The GraphQL schema in backend/schema/schema.py has several resolvers that are stubbed and return []. Implement the real data-fetching logic for these resolvers (e.g., product_performance, branch_performance).
Reason: To make the GraphQL API the complete and reliable data source for the frontend, eliminating the need to mix and match with the legacy REST API.
Eliminate Inefficient Data Fetching:

Task: Refactor the Dashboard.tsx page to replace its multiple, individual API calls with a single, consolidated GraphQL query that fetches all necessary data at once.
Reason: This will fix the "request waterfall" anti-pattern, significantly improving the dashboard's load time and user experience.
Priority 3: Documentation and Configuration Cleanup
These tasks improve developer experience and ensure the project is maintainable.

Synchronize All Documentation:

Task: Audit all files in the /md directory. Update API contracts in api.md and args.md to reflect the camelCase GraphQL standard. Correct the conflicting port numbers between DEPLOYMENT.md (5173) and DOCKER.md (3000).
Reason: Inaccurate documentation wastes developer time and leads to confusion and bugs.
Fix Docker Configuration:

Task: In docker-compose.yml, resolve the port conflict where both druid-router and druid-broker are mapped to 8888. In docker-compose.dev.yml, change DRUID_BROKER_HOST from localhost to host.docker.internal to allow the container to connect to the host machine.
Reason: The Docker setup is currently broken and will fail in specific configurations.
By following this prioritized plan, you can systematically address the most critical issues first, leading to a stable, reliable, and maintainable application.

