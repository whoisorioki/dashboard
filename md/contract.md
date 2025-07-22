> **Note:** This file should be renamed from `contarct.md` to `implementation-checklist.md` to better reflect its purpose.

---

# 📝 Implementation Checklist & Roadmap

This document serves as the primary implementation plan, translating the project's strategic goals into a prioritized and actionable checklist.

---

## ✅ Phase 1: Core Analytics & Platform Stability (High Priority)

These items are essential for delivering the "State of the Business" dashboard as defined in Phase 1 of the project roadmap.

| Epic | Task | Status |
| :--- | :--- | :--- |
| **Data Integrity & Performance** | Implement null checks and fallbacks in Pandera validation (e.g., `grossProfit = 0` if `totalCost` is missing). | `To Do` |
| | Pre-calculate `effectiveMargin` in the Druid ingestion pipeline to accelerate queries. | `To Do` |
| | Add a composite index on `(Branch, __time)` in Druid for heatmap performance. | `To Do` |
| | Update/expand API endpoints as per PRD (e.g., `profitDrivers`, `health/druid`). | `To Do` |
| | Add/validate derived metrics in GraphQL schema (e.g., `avgMargin`, `discountPct`, `dealHealthIndex`). | `To Do` |
| **Core Filtering & Navigation** | Add a MUI `DateRangePicker` to all analytics pages. | `To Do` |
| | Ensure the date range and other filters persist across all dashboard tabs using a shared context. | `To Do` |
| | Style the date picker and filters for both dark and light themes. | `To Do` |
| | Exclude inactive branches (e.g., last activity > 90 days) from branch filter options. | `To Do` |
| **Core KPI Visualization** | Update all number formatting utilities to abbreviate (K, M, B) and consistently use "KSh". | `To Do` |
| | Ensure margin displays as a single decimal percentage (e.g., 21.4%). | `To Do` |
| | Use “--” as a standard placeholder for all missing/null data points in the UI. | `To Do` |
| | Add trend indicators (arrows, color) and "vs previous period" comparisons to all KPI cards. | `To Do` |
| | Add info icons/tooltips to all KPI cards to explain their calculation. | `To Do` |
| **Key Charting Capabilities** | Transform the sales attainment chart into a more effective bullet chart. | `To Do` |
| | Implement cost breakdown tooltips for low-margin deals in the rep-product matrix. | `To Do` |
| | Add expand/full-screen/modal view to all charts and tables for detailed analysis. | `To Do` |
| | Ensure all charts and tables have robust error handling and display user-friendly error states. | `To Do` |
| **UI/UX Foundation** | Unify card, border, and header styles across all components for a consistent look and feel. | `To Do` |
| | Standardize spacing, alignment, and typography across all analytics pages. | `To Do` |
| | Ensure consistent terminology (e.g., "Gross Profit", "Margin %") in all UI labels and headers. | `To Do` |
| | Implement margin color-coding in branch heatmaps (e.g., red <15%, green >25%). | `To Do` |
| **System Health & Monitoring** | Implement real-time anomaly detection alerts for negative margins. | `To Do` |
| | Expand health checks for Druid and backend, including validation for `totalCost` nulls. | `To Do` |

---

## 🚀 Phase 2: Advanced Features & User Experience (Future)

These items can be addressed after the core Phase 1 deliverables are complete. They focus on enhancing user adoption and providing more tailored analytical experiences.

----
----
| Epic | Task | Status |
| :--- | :--- | :--- |
| **Persona-Driven Features** | Implement persona-specific dashboard views (e.g., Executive, Manager, Sales Rep). | `Backlog` |
| **User Onboarding** | Add an interactive product tour (e.g., using Shepherd.js) with persona-specific paths. | `Backlog` |
| **Workflow Documentation** | Map and document key persona workflows to inform future feature development. | `Backlog` |

