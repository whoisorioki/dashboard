# Project Status & Outstanding Gaps

This document summarizes the current gaps and incomplete items in the Sales Analytics Dashboard project, based on the requirements in the README.md and the documentation in @/md. The immediate priority is to ensure the dashboard is fully working; the following items are for future improvement and completion.

---

## Outstanding Gaps & Incomplete Items

1. **Advanced Analytics Features (Phase 1 Business Questions)**

   - Salesperson Leaderboard (rank by SalesAmount and GrossProfit) not fully implemented.
   - Product Line Profitability (GrossProfit by ProductLine and ItemName) missing or incomplete.
   - Salesperson Product Mix & Margin (average profit margin per rep) not present.
   - Top Customer Analysis (profile by SalesAmount and GrossProfit) not fully built.

2. **GraphQL-First Data Fetching**

   - All dashboard components now use GraphQL queries and codegen hooks; REST is deprecated.
   - Batching of dashboard data in a single GraphQL query is in progress for some pages.

3. **Migration to Nivo/ECharts**

   - Several chart components are still being migrated from Recharts. Migration to Nivo/ECharts is in progress.

4. **Role-Based Access Control (RBAC) & Authentication**

   - No RBAC or authentication/authorization implemented in frontend or backend.

5. **Observability, Monitoring, and Automation**

   - No integration with external monitoring tools (Prometheus, Grafana, Sentry, etc.).
   - Ingestion job tracking and Druid health monitoring are not fully automated or persistent.
   - CI/CD enforcement of codegen/type safety and automated integration tests are not fully in place.

6. **Documentation Gaps**

   - Some README sections (screenshots, user guides, business case summary) are placeholders.
   - Developer documentation for naming conventions, type generation, and Rosetta Stone mapping is missing.

7. **Final Audit & Cleanup**

   - Redundant or unused queries/fields in backend/frontend need a final audit and cleanup.
   - Legacy or placeholder code (old hooks, unused types) may still exist.
   - Error/loading state standardization for edge cases could be improved.

8. **UI/UX Enhancements**

   - Role-specific dashboard views and advanced interactivity (drill-downs, cross-filtering) not implemented.
   - Accessibility improvements (WCAG compliance, ARIA labels, keyboard navigation) may need review.

9. **Ingestion Pipeline Automation**

   - Ingestion pipeline automation and monitoring for production robustness is not complete.

10. **Phase 2 (CRM Data Integration)**
    - Phase 2 (business case for CRM/inquiry data) is not started, as expected.

---

**Note:**
- All contracts are enforced via codegen and mapping docs. Keep this file in sync with [backend_report.md], [frontend_report.md], and [api.md].
- The immediate goal is to have a fully working dashboard. Address these gaps after confirming core functionality and stability.
