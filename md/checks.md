# Integration & API Consistency Checklist

---

## 1. API Documentation Standardization

- [ ] Standardize all API documentation to follow the GraphQL schema and codegen output.
- [ ] Add sample requests/responses for every query, including error cases.

## 2. Naming Conventions & Schema Alignment

- [ ] Ensure backend returns camelCase fields for all GraphQL endpoints.
- [ ] Use only camelCase in all TypeScript types and GraphQL queries on the frontend.

## 3. Response Envelope Consistency

- [ ] Standardize all API responses to use the envelope:
  ```json
  { "data": ..., "error": ..., "metadata": ... }
  ```
- [ ] Always include the `error` field, even if null.

## 4. Type Generation & Automation

- [ ] Use codegen to generate TypeScript types from the GraphQL schema.
- [ ] Remove all manual type definitions that do not match the schema.

## 5. Integration Testing & Error Handling

- [ ] Add integration tests to catch mismatches between backend and frontend early.
- [ ] Ensure all errors are returned in the envelope format and displayed user-friendly in the frontend.

## 6. Documentation & Communication

- [ ] Document all queries and types in a single source of truth (GraphQL schema and codegen output).
- [ ] Communicate any changes in schema or contract to both frontend and backend teams.

---

_Check off each item as you complete it to ensure robust, maintainable integration._

**Note:**
- All contracts are enforced via codegen and mapping docs. Keep this file in sync with [backend_report.md], [frontend_report.md], and [api.md].
