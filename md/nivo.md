Install Nivo and required dependencies in the frontend project.
Implement useNivoTheme hook to map Material-UI theme to Nivo theme.
Refactor Dashboard page (Dashboard.tsx) to follow the three-act narrative structure and use Nivo charts.
Refactor Sales Performance page (Sales.tsx) to use Nivo charts and narrative structure.
Refactor Product Performance page (Products.tsx) to use Nivo Treemap and narrative structure.
Refactor Branch Performance page (Branches.tsx) to use Nivo Choropleth, Bar, and other charts as per blueprint.
Refactor Profitability Analysis page (ProfitabilityAnalysis.tsx) to use Nivo Waterfall and other charts as per blueprint.
Ensure all Nivo charts use the custom useNivoTheme hook for consistent theming.
Test all refactored pages for interactivity, responsiveness, and visual consistency.
Implement Act I (KPI cards with sparklines) at the top of all major analytics pages: Sales Performance, Product Performance, Branch Performance, and Profitability Analysis.
Refactr Act II (main charts) for the Dashboard page: Replace legacy charts with Nivo Combination, Choropleth, and Stream charts. Ensure backend data and schemas are fully understood and all calculated metrics are correctly integrated with the frontend. For geoJSON, temporarily map unknown branches (e.g., Kubota) to Nairobi until a full mapping is provided.
Reduce visual clutter by removing or simplifying sparklines in all places except the main Act I KPI cards at the top of each analytics page.