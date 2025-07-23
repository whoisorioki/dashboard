# Data Loading, Caching & Persistence Implementation Checklist

This checklist operationalizes the hybrid, multi-layered caching and persistence strategy for the Sales Analytics Dashboard, as described in the architectural blueprint. It covers both frontend (React Query + localStorage) and backend (FastAPI + Redis), including cache invalidation, async best practices, and monitoring. All frontend data loading is now via React Query and generated GraphQL hooks, with REST and Recharts deprecated. All contracts are enforced via codegen and mapping docs.

---

## 1. Frontend: Client-Side Persistence with React Query

- [ ] **Install Required Packages**

  - `@tanstack/react-query-persist-client`
  - `@tanstack/query-sync-storage-persister`

- [ ] **Configure QueryClient for Persistence**

  - Set `cacheTime` and `maxAge` to 24 hours (or as needed)
  - Set `staleTime` to 5–15 minutes for balanced freshness
  - Set `networkMode` to `'offlineFirst'`

- [ ] **Create and Export a LocalStorage Persister**

  - Use `createSyncStoragePersister` targeting `window.localStorage`

- [ ] **Wrap App with PersistQueryClientProvider**

  - Ensure cache is rehydrated before queries run
  - Resume paused mutations after hydration

- [ ] **Update Custom Hooks**

  - Expose and handle `fetchStatus === 'paused'` for offline mode
  - Show subtle offline indicators in the UI

- [ ] **Implement Cache Invalidation on Data Version Change**
  - Poll GraphQL health/data-version query every 5 minutes
  - If `lastIngestionTime` changes, call `queryClient.invalidateQueries()`
  - (Optional) Prepare for future WebSocket-based invalidation

---

## 2. Backend: Server-Side Caching with FastAPI + Redis

- [ ] **Install and Configure Redis**

  - Ensure Redis is running and accessible to FastAPI

- [ ] **Install fastapi-redis-cache**

  - Use for async, decorator-based caching

- [ ] **Initialize Redis Cache on Startup**

  - Set a unique prefix (e.g., `sales-analytics-cache`)
  - Ignore FastAPI-specific objects in cache key generation

- [ ] **Apply @cache Decorator to Endpoints**

  - Tier 1: Long-lived metadata (e.g., `branchList`) — 24h TTL
  - Tier 2: Core analytics (e.g., `monthlySalesGrowth`) — 1h TTL
  - Tier 3: Real-time/ad-hoc — no cache

- [ ] **Ensure All Endpoints Are Fully Async**

  - Use `async def` for all path operations
  - Use async Druid client (e.g., `AsyncPyDruid`)
  - Use Polars `collect_async()` for heavy data processing

- [ ] **Implement Automated Cache Invalidation**
  - Create a background service (e.g., with `repeat_every`)
  - Poll Druid Overlord API for new ingestion tasks
  - On new ingestion, purge relevant Redis keys (by prefix/pattern)
  - Update `lastIngestionTime` in Redis or memory
  - Expose GraphQL health/data-version query returning `lastIngestionTime`

---

## 3. Monitoring & Observability

- [ ] **Monitor Redis Cache Performance**

  - Track cache hit ratio, memory usage, evictions, latency
  - Export metrics to Prometheus/Grafana

- [ ] **Monitor Client-Perceived Cache Performance**

  - Capture `X-API-Cache` response header in frontend APM/RUM
  - Analyze hit/miss ratios for API calls

- [ ] **Monitor Druid Ingestion Health**
  - Track ingestion job count, row count, errors
  - Alert on ingestion failures or delays

---

## 4. Testing & Validation

- [ ] **Test Client-Side Cache**

  - Verify data is persisted and rehydrated across reloads/sessions
  - Test offline mode and UI indicators

- [ ] **Test Server-Side Cache**

  - Verify Redis cache is populated and used (check `X-API-Cache` header)
  - Test cache invalidation after Druid ingestion

- [ ] **Test End-to-End Data Freshness**

  - Ingest new data into Druid, ensure both caches are invalidated and fresh data is loaded

- [ ] **Document All Configuration and Operational Steps**
  - Update project docs for setup, troubleshooting, and best practices

---

**Note:**
- All contracts are enforced via codegen and mapping docs. Keep this file in sync with [backend_report.md], [frontend_report.md], and [api.md].
