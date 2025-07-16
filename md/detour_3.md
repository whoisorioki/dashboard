# Architectural Refactoring Checklist: Python/TypeScript GraphQL Stack

## Executive Summary
This checklist operationalizes the recommendations from the architectural review, focusing on eliminating naming convention friction, removing technical debt, and automating type safety across the stack.

---

## Backend (Python, Strawberry-GraphQL)
- [ ] **Audit Schema Configuration**
  - [ ] Ensure `strawberry.Schema` is instantiated with `auto_camel_case=True` (or default, do not set to False).
  - [ ] Remove any custom config that disables automatic camelCase conversion.
- [ ] **Refactor All GraphQL Types and Resolvers**
  - [ ] Use idiomatic `snake_case` for all field names in `@strawberry.type` and `@strawberry.input` classes.
  - [ ] Use `snake_case` for all resolver and mutation function names and their arguments.
  - [ ] Remove any manual camelCase or aliasing for simple case conversion.
  - [ ] Use explicit aliasing (`strawberry.field(name=...)`) only for true exceptions (e.g., legacy/DB compatibility).
- [ ] **Type Hints and Schema Integrity**
  - [ ] Ensure all fields and resolver return values are correctly type-hinted.
  - [ ] Use `Optional` for nullable fields and correct collection types.

---

## Frontend (TypeScript, GraphQL)
- [ ] **Refactor GraphQL Operations**
  - [ ] Use `camelCase` for all field names and arguments in GraphQL queries/mutations.
  - [ ] Ensure all variable names in operation strings and variables objects are camelCase.
- [ ] **Refactor TypeScript Types**
  - [ ] Remove all manually written types/interfaces that use snake_case for API data.
  - [ ] Use only camelCase property names in any remaining custom types.
- [ ] **Eliminate Redundant Logic**
  - [ ] Remove all client-side utilities or libraries that convert between snake_case and camelCase (e.g., `js-convert-case`).
  - [ ] Remove any code that transforms API response keys for case conversion.

---

## Automation & Type Safety
- [ ] **Integrate GraphQL Code Generator**
  - [ ] Configure codegen to point to the backend's GraphQL endpoint.
  - [ ] Generate TypeScript types and hooks directly from the schema.
  - [ ] Ensure all generated types/hooks use camelCase and match the schema contract.
  - [ ] Remove all manual type definitions for API data.
- [ ] **CI/CD Enforcement**
  - [ ] Add codegen to the CI pipeline to catch breaking schema changes early.
  - [ ] Fail builds if codegen output is out of sync with the backend schema.

---

## General/Documentation
- [ ] **Document the Naming Convention Policy**
  - [ ] Add a section to the developer docs explaining the snake_case (backend) ↔ camelCase (GraphQL/TypeScript) contract.
  - [ ] Provide a "Rosetta Stone" table mapping Python fields to GraphQL and TypeScript usage.
- [ ] **Review and Remove Technical Debt**
  - [ ] Audit the codebase for any remaining workarounds or legacy code related to naming conversion and remove them.

---

**By following this checklist, your team will achieve a robust, idiomatic, and maintainable GraphQL stack with perfect type safety and zero naming friction.** 