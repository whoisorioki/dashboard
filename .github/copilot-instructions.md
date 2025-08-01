AI Coding Agent Instructions for Sales Analytics Dashboard

## Project Overview

- Full-stack analytics platform for Kenyan businesses: React (frontend), FastAPI (backend), Apache Druid (analytics DB).
- Real-time and mock data support; robust error handling and observability.
- **Status:** Core functionality complete with working health monitoring, geographic profitability visualization, and comprehensive GraphQL API.

## Architecture & Key Patterns

- **Frontend:**
  - React 18 + TypeScript, Material-UI, Recharts, React Query, Vite.
  - Data fetched via GraphQL endpoints using generated TypeScript types.
  - State managed with React Context; global filters for date, branch, product.
  - Unified `ChartCard` component wrapper for consistent UI/UX across all dashboard components.
  - All monetary values formatted in KSh (en-KE locale) with proper margin calculations.
  - Geographic visualization using Nivo ResponsiveChoropleth for Kenya county-level data.
- **Backend:**
  - FastAPI (Python) with GraphQL (Strawberry), Polars (dataframes), Apache Druid (analytics).
  - Complete GraphQL schema with health monitoring endpoints (`systemHealth`, `druidHealth`, `druidDatasources`).
  - Global exception handlers, logging, request ID tracing, and comprehensive health endpoints.
  - Automatic fallback to realistic mock data if Druid is unavailable.
  - Retry logic for Druid queries (exponential backoff, up to 3 attempts).
  - **Import Strategy:** Uses `sys.path` manipulation to treat backend directory as package root.
- **Analytics DB:**
  - Apache Druid stores all analytics data; backend queries Druid with graceful fallback to mock data.
  - Data ingestion via backend scripts from CSV.
  - Health monitoring confirms Druid connectivity and available datasources.

## Developer Workflows

- **Quick Start (Windows):** ✅ **Recommended**
  - `./start-backend.ps1` (backend on :8000)
  - `./start-frontend.ps1` (frontend on :5173 or :5174)
- **Manual Start:**
  - Backend: `cd backend && uvicorn main:app --host 0.0.0.0 --port 8000 --reload`
  - Frontend: `cd frontend && npm run dev`
- **Docker Compose:**
  - `docker compose up -d` (full stack)
- **Config:**
  - Frontend API URL: `frontend/.env` 
  - Backend Druid config: `backend/.env` or `druid/environment`
  - Backend uses `.venv` virtual environment for Python dependencies
- **Development:**
  - Test with both real Druid data and mock data (toggle available in UI).
  - All GraphQL types auto-generated from schema; run codegen after schema changes.
  - Health monitoring available at `/alerts` page for system status.

## Project-Specific Conventions

- **GraphQL Schema:** Complete schema with all required fields for frontend queries.
  - Health monitoring: `systemHealth`, `druidHealth`, `druidDatasources`
  - Analytics: `marginTrends`, `profitabilityByDimension`, `dashboardData`
  - All resolvers include proper error handling and fallback responses.
- **Error Handling:** Unified error/empty/loading states with ChartCard wrapper; request IDs for traceability.
- **Component Standards:** All dashboard components use `ChartCard` wrapper for consistent spacing and styling.
- **Naming:**
  - Backend: snake_case (Python), GraphQL field names use camelCase
  - Frontend: camelCase (TypeScript, GraphQL)
- **Type Safety:** TypeScript types generated from GraphQL schema; contracts stay in sync automatically.
- **Data Calculations:** Gross margin = (Revenue - Cost) / Revenue; all financial metrics use proper calculations.
- **Observability:** Complete health monitoring system with real-time status checks, logs, and request tracing.
- **Mock Data:** Intelligent fallback system; edit `backend/services/sales_data.py` for mock data scenarios.

## Integration Points

- **Frontend–Backend:** GraphQL endpoints with auto-generated TypeScript types; comprehensive query coverage.
- **Health Monitoring:** Real-time system status via GraphQL queries (`systemHealth`, `druidHealth`, `druidDatasources`).
- **Analytics:** Backend queries Druid with graceful fallback to mock data; margin calculations verified accurate.
- **Geographic Data:** Kenya county-level profitability visualization with proper data aggregation.
- **Data Pipeline:** CSV → Druid → Backend (Polars) → GraphQL → Frontend (React).

## Current Status & Verified Features

✅ **Working Components:**
- Complete GraphQL schema with all required fields
- Health monitoring system (Backend API, Druid Database, Data Sources)
- Geographic profitability mapping with county-level data
- Standardized ChartCard component across all dashboards
- Proper gross margin calculations and financial metrics
- Backend import system using sys.path configuration

✅ **Development Environment:**
- Backend running on :8000 with Druid connectivity
- Frontend running on :5173/:5174 with working GraphQL queries
- No GraphQL field errors; all queries resolving successfully
- Health endpoints providing real-time system status

## References

- See `README.md` for full architecture, workflows, and troubleshooting.
- For business context and analytics goals, see `.cursor/rules/business-challenge.mdc`.
- System health monitoring available at `/alerts` page in the application.

---

**Development Notes:**
- Use existing patterns in `backend/schema/schema.py` for GraphQL resolvers
- Follow ChartCard wrapper pattern in `frontend/src/components/` for new dashboard components  
- All GraphQL types are complete and working; avoid modifying schema unless adding new features
- Backend import issues resolved using sys.path manipulation in main.py
