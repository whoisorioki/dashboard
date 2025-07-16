# Phase 1 Implementation Checklist: Maximizing Current Sales Data

This checklist guides the implementation of Phase 1 of the Kenyan Sales Analytics Dashboard, focusing exclusively on extracting maximum value from the existing Sales table. It is designed to ensure actionable, business-critical insights are delivered before any CRM/inquiry data is introduced.

---

## 1. Data Modeling & Backend Preparation
- [ ] Review and document the Sales table schema (fields: SalesPerson, SalesAmount, GrossProfit, ProductLine, ItemName, AcctName, etc.).
- [ ] Ensure the data pipeline from Druid to backend is robust and all required fields are available.
- [ ] Implement or validate Druid ingestion spec for the `sales_analytics` datasource.

## 2. Backend API Design (FastAPI)
- [ ] Design GraphQL endpoints for:
    - [ ] Salesperson leaderboard (by SalesAmount and GrossProfit)
    - [ ] Product and product line profitability (GrossProfit by ProductLine and ItemName)
    - [ ] Salesperson product mix and average profit margin (GrossProfit / SalesAmount per rep)
    - [ ] Top customers (by SalesAmount and GrossProfit)
- [ ] Ensure endpoints accept filters: date range, branch, product line, etc.
- [ ] Implement aggregation logic in backend or Druid queries as needed.
- [ ] Add global error handling and validation for all endpoints.

## 3. Frontend Integration (React)
- [ ] Create or update custom hooks for each new/updated endpoint.
- [ ] Build the following dashboard components:
    - [ ] Salesperson Leaderboard (rank by SalesAmount and GrossProfit)
    - [ ] Product/Product Line Profitability Chart/Table
    - [ ] Salesperson Product Mix & Margin Table/View
    - [ ] Top Customer Analysis Table
- [ ] Integrate global filters (date range, branch, product line) into all components.
- [ ] Ensure all values are displayed in Kenyan Shillings (KES) and use consistent formatting.

## 4. UI/UX & Dashboard Layout
- [ ] Use consistent MUI containers, cards, and tables for all components.
- [ ] Add info tooltips to explain each metric and chart.
- [ ] Ensure responsive design and accessibility.
- [ ] Place the most critical insights (e.g., most profitable salespeople/products) in the top-left quadrant of the dashboard.

## 5. Validation & Quality Assurance
- [ ] Cross-check all aggregations and calculations for accuracy.
- [ ] Validate that all dashboard questions from Phase 1 are answered:
    - [ ] Who are our most profitable salespeople?
    - [ ] What are our most profitable products/product lines?
    - [ ] Which salespeople are best at selling high-margin products?
    - [ ] What is the profile of our most valuable customers?
- [ ] Test with real and mock data for edge cases.
- [ ] Review for duplicate or redundant components/queries.

## 6. Documentation & Handover
- [ ] Document all endpoints, data models, and dashboard features.
- [ ] Provide a user guide for interpreting each dashboard view.
- [ ] Prepare a summary report to present Phase 1 findings and highlight gaps that only CRM/inquiry data can fill (for business case).

---

**Note:** Do not implement or expose any Phase 2 (CRM/inquiry/win rate) features at this stage. Focus exclusively on maximizing the value of the current Sales table data. 