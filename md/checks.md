# Integration & API Consistency Checklist

---

## 1. API Documentation Standardization

- [ ] Standardize all API documentation to follow the "Monthly Sales Growth" format:
  - Endpoint/Query
  - Arguments
  - Returns/Schema
  - Sample Request/Response
  - Error Envelope
  - Filters
  - TypeScript/GraphQL Mapping
- [ ] Add sample requests/responses for every endpoint, including error cases.

## 2. Naming Conventions & Schema Alignment

- [ ] Ensure backend returns camelCase fields for all GraphQL endpoints.
- [ ] For REST endpoints, either:
  - Return camelCase fields, or
  - Document the mapping and ensure the frontend maps fields correctly.
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

- [ ] Document all endpoints and types in a single source of truth.
- [ ] Communicate any changes in schema or contract to both frontend and backend teams.

---

_Check off each item as you complete it to ensure robust, maintainable integration._
