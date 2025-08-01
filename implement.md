# Project Stabilization & Implementation Checklist

This document serves as the primary implementation plan, translating the findings from recent audit reports into a prioritized and actionable checklist. It is the single source of truth for tracking remaining tasks.

## Priority 0: Immediate Critical Fixes ✅ COMPLETE

These tasks addressed fundamental issues preventing the application from working correctly.

| Epic | Task | Status |
| :--- | :--- | :--- |
| **Infrastructure** | Resolve Docker port conflict where both `druid-router` and `druid-broker` were mapped to `8888` in `docker-compose.yml`. | `✅ Complete` |
| | In `docker-compose.dev.yml`, change `DRUID_BROKER_HOST` from `localhost` to `host.docker.internal` for container-to-host communication. | `✅ Complete` |
| **Geographic Data** | Update `frontend/src/assets/kenya.geojson` with precise coordinates for Kitengela branch and add missing Bungoma branch. | `✅ Complete` |
| **Missing Components** | Wire up the `BranchProductHeatmap` component in `Dashboard.tsx` with live GraphQL query and proper component import. | `✅ Complete` |
| **KPI Improvements** | Replace 'Avg Deal Size' with 'Average Profit per Transaction' in Dashboard KPI cards for better business insight. | `✅ Complete` |

---

## Priority 1: Fix Critical Frontend & Backend Bugs

These tasks address issues that cause major features to be broken or display no data.

| Epic | Task | Status |
| :--- | :--- | :--- |
| **Frontend Data Fetching** | In `Sales.tsx` and `Products.tsx`, refactor the GraphQL hooks to correctly access nested data structures (e.g., `salesData.salesPerformance`). | `✅ Complete` |
| | Wire up the `BranchProductHeatmap` component in `Dashboard.tsx` with a live GraphQL query instead of the hardcoded `data={[]}`. | `✅ Complete` |
| | Implement a dedicated `useMonthlySalesGrowthQuery` for the `MonthlySalesTrendChart` in `Sales.tsx` to fix the broken chart. | `✅ Complete` |

---

## Priority 2: Resolve API & Data Inconsistencies

These tasks focus on creating a single source of truth for the API, improving performance, and standardizing data contracts.

| Epic | Task | Status |
| :--- | :--- | :--- |
| **GraphQL API Implementation** | Implement real data-fetching logic for all stubbed GraphQL resolvers (e.g., `product_performance`, `branch_performance`). | `To Do` |
| | Refactor `Dashboard.tsx` to use a single, consolidated GraphQL query to eliminate the "request waterfall" and improve load times. | `To Do` |
| **Naming Conventions** | Ensure all Python resolvers use `snake_case` and rely on Strawberry's `auto_camel_case` feature for the API contract. | `To Do` |

---

## Priority 3: Documentation & Configuration Cleanup

These tasks improve developer experience and ensure the project is maintainable and easy to set up.

| Epic | Task | Status |
| :--- | :--- | :--- |
| **Documentation** | Audit and synchronize all `/md` documentation. Update API contracts (`api.md`, `args.md`) to reflect the `camelCase` GraphQL standard. | `To Do` |
| | Correct conflicting port numbers between `DEPLOYMENT.md` (5173) and `DOCKER.md`/`docker-compose.yml` (3000). | `To Do` |
| **Docker Configuration** | Resolve the port conflict where both `druid-router` and `druid-broker` are mapped to `8888` in `docker-compose.yml`. | `✅ Complete` |
| | In `docker-compose.dev.yml`, change `DRUID_BROKER_HOST` from `localhost` to `host.docker.internal` for container-to-host communication. | `✅ Complete` |

---

## Priority 4: Long-Term Health & Feature Completeness

These items can be addressed after the higher-priority tasks are complete. They focus on completing Phase 1 features and hardening the platform.

| Epic | Task | Status |
| :--- | :--- | :--- |
| **Advanced Analytics (Phase 1)** | Implement UI and backend logic for the Salesperson Leaderboard (by SalesAmount & GrossProfit). | `Backlog` |
| | Implement UI and backend logic for Product/Product Line Profitability analysis. | `Backlog` |
| | Implement UI and backend logic for Salesperson Product Mix & Margin analysis. | `Backlog` |
| | Implement UI and backend logic for Top Customer Analysis. | `Backlog` |
| **UI/UX** | Complete the migration of all remaining Recharts components to Apache ECharts for performance and consistency. | `Backlog` |
| **Observability & Automation** | Implement persistent, automated tracking for Druid ingestion jobs and health status. | `Backlog` |
| | Integrate structured logging (e.g., `structlog`) with a unique `request_id` for end-to-end traceability. | `Backlog` |
| **CI/CD** | Add GraphQL Code Generator to the CI pipeline to enforce type safety and catch breaking schema changes automatically. | `Backlog` |