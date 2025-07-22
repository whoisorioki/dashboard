# Copilot AI Coding Agent Instructions for Sales Analytics Dashboard

## Project Overview

- Full-stack analytics platform for Kenyan businesses: React (frontend), FastAPI (backend), Apache Druid (analytics DB).
- Real-time and mock data support; robust error handling and observability.

## Architecture & Key Patterns

- **Frontend:**
  - React 18 + TypeScript, Material-UI, Recharts, React Query, Vite.
  - Data fetched via custom hooks (`useApi`, `useDynamicApi`).
  - State managed with React Context; global filters for date, branch, product.
  - Unified error/loading/empty states; all monetary values in KSh (en-KE locale).
  - Each dashboard component maps to a specific API endpoint and TypeScript interface.
- **Backend:**
  - FastAPI (Python), Polars (dataframes), Pandera (validation), Apache Druid (analytics).
  - All API responses use a standard envelope: `{ data, error, metadata: { requestId } }`.
  - Global exception handlers, logging, request ID tracing, and health endpoints.
  - Automatic fallback to realistic mock data if Druid is unavailable.
  - Retry logic for Druid queries (exponential backoff, up to 3 attempts).
- **Analytics DB:**
  - Apache Druid stores all analytics data; backend queries Druid or falls back to mock data.
  - Data ingestion via backend scripts from CSV.

## Developer Workflows

- **Quick Start (Windows):**
  - `./start-backend.ps1` (backend)
  - `./start-frontend.ps1` (frontend)
- **Manual Start:**
  - Backend: `cd backend && uvicorn main:app --host 0.0.0.0 --port 8000 --reload`
  - Frontend: `cd frontend && npm run dev`
- **Docker Compose:**
  - `docker compose up -d` (full stack)
- **Config:**
  - Frontend API URL: `frontend/.env`
  - Backend Druid config: `backend/.env` or `druid/environment`
- **Testing:**
  - Test with both real and mock data (toggle in UI).
  - Add new KPIs by updating `backend/api/kpi_routes.py` and corresponding frontend hooks/components.

## Project-Specific Conventions

- **API Envelope:** All endpoints return `{ data, error, metadata: { requestId } }`.
- **Error Handling:** Unified error/empty/loading states; request IDs for traceability.
- **Naming:**
  - Backend: snake_case (Python)
  - Frontend: camelCase (TypeScript, GraphQL)
- **Type Safety:** TypeScript types generated from GraphQL schema; keep contracts in sync.
- **Observability:** Health endpoints (`/api/health`, `/api/health/druid`), logs, request tracing.
- **Mock Data:** Fallback and toggling supported; edit `backend/services/sales_data.py` for mock data.

## Integration Points

- **Frontend–Backend:** API endpoints mapped to dashboard components; contracts documented in `frontend/queries/` and backend `api/`.
- **Analytics:** Backend queries Druid; fallback to mock data if Druid is down.
- **Data Pipeline:** CSV → Druid → Backend (Polars) → API → Frontend (React).

## References

- See `README.md` for full architecture, workflows, and troubleshooting.
- For business context and analytics goals, see `.cursor/rules/business-challenge.mdc`.

---

If unsure about a pattern, prefer existing examples in `backend/api/`, `frontend/src/components/`, and `frontend/queries/`.
