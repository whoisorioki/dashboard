import React from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CssBaseline from "@mui/material/CssBaseline";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeContextProvider } from "./context/ThemeContext";
import { NotificationProvider } from "./context/NotificationContext";
import Dashboard from "./pages/Dashboard";
import Sales from "./pages/Sales";
import Products from "./pages/Products";
import Branches from "./pages/Branches";
import DataIngestion from "./pages/DataIngestion";
import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { graphqlClient } from "./lib/graphqlClient";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProfitabilityAnalysis from "./pages/ProfitabilityAnalysis";
import AlertsDiagnostics from "./pages/AlertsDiagnostics";
import { LocalFilterResetProvider } from "./context/LocalFilterResetContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
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
  useDataVersionPoll(); // Enable monthly data version polling
  return (
    <QueryClientProvider client={queryClient}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <ThemeContextProvider>
          <NotificationProvider>
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
                          <Route
                            path="/data-ingestion"
                            element={
                              <ErrorBoundary>
                                <DataIngestion />
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
          </NotificationProvider>
        </ThemeContextProvider>
      </LocalizationProvider>
    </QueryClientProvider>
  );
}

export default App;
