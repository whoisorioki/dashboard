import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import CssBaseline from "@mui/material/CssBaseline";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeContextProvider } from "./context/ThemeContext";
import { NotificationProvider } from "./context/NotificationContext";
import { FilterProvider } from "./context/FilterContext";
import Dashboard from "./pages/Dashboard";
import Sales from "./pages/Sales";
import Products from "./pages/Products";
import Branches from "./pages/Branches";
import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { graphqlClient } from "./lib/graphqlClient";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProfitabilityAnalysis from "./pages/ProfitabilityAnalysis";
import AlertsDiagnostics from "./pages/AlertsDiagnostics";
import { LocalFilterResetProvider } from "./context/LocalFilterResetContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { queryClient, localStoragePersister } from "./lib/queryClient";
import { useDataVersionPoll } from "./lib/useDataVersionPoll";

// Create a client
// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       refetchOnWindowFocus: false,
//       retry: 1,
//     },
//   },
// });

function LayoutWithReset({ children }: { children: React.ReactNode }) {
  return <MainLayout>{children}</MainLayout>;
}

function App() {
  // useDataVersionPoll(); // Disabled for debugging blank page issue
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: localStoragePersister }}
      onSuccess={() => {
        queryClient.resumePausedMutations();
      }}
    >
      <ThemeContextProvider>
        <NotificationProvider>
          <FilterProvider>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <CssBaseline />
              <LocalFilterResetProvider>
                <LayoutWithReset>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                      path="/*"
                      element={
                        <ProtectedRoute>
                          <Routes>
                            <Route
                              path="/"
                              element={<Navigate to="/overview" replace />}
                            />
                            <Route
                              path="/overview"
                              element={
                                <ErrorBoundary>
                                  <Dashboard />
                                </ErrorBoundary>
                              }
                            />
                            <Route
                              path="/sales"
                              element={
                                <ErrorBoundary>
                                  <Sales />
                                </ErrorBoundary>
                              }
                            />
                            <Route
                              path="/products"
                              element={
                                <ErrorBoundary>
                                  <Products />
                                </ErrorBoundary>
                              }
                            />
                            <Route
                              path="/branches"
                              element={
                                <ErrorBoundary>
                                  <Branches />
                                </ErrorBoundary>
                              }
                            />
                            <Route
                              path="/profitability"
                              element={
                                <ErrorBoundary>
                                  <ProfitabilityAnalysis />
                                </ErrorBoundary>
                              }
                            />
                            <Route
                              path="/alerts"
                              element={
                                <ErrorBoundary>
                                  <AlertsDiagnostics />
                                </ErrorBoundary>
                              }
                            />
                          </Routes>
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </LayoutWithReset>
              </LocalFilterResetProvider>
            </LocalizationProvider>
          </FilterProvider>
        </NotificationProvider>
      </ThemeContextProvider>
    </PersistQueryClientProvider>
  );
}

export default App;
