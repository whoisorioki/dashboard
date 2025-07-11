import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import CssBaseline from '@mui/material/CssBaseline'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ThemeContextProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import { FilterProvider } from './context/FilterContext'
import Dashboard from './pages/Dashboard'
import Sales from './pages/Sales'
import Products from './pages/Products'
import Branches from './pages/Branches'
import MainLayout from './components/layout/MainLayout'
import ProtectedRoute from './components/ProtectedRoute'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Login from './pages/Login'
import Register from './pages/Register'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeContextProvider>
        <NotificationProvider>
          <AuthProvider>
            <FilterProvider>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <CssBaseline />
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route
                    path="/*"
                    element={
                      <ProtectedRoute>
                        <MainLayout>
                          <Routes>
                            <Route path="/" element={<Navigate to="/overview" replace />} />
                            <Route path="/overview" element={<Dashboard />} />
                            <Route path="/sales" element={<Sales />} />
                            <Route path="/products" element={<Products />} />
                            <Route path="/branches" element={<Branches />} />
                          </Routes>
                        </MainLayout>
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </LocalizationProvider>
            </FilterProvider>
          </AuthProvider>
        </NotificationProvider>
      </ThemeContextProvider>
    </QueryClientProvider>
  )
}

export default App
