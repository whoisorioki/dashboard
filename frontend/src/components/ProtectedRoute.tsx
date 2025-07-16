import React from 'react'
import { Navigate } from 'react-router-dom'
import { Box, CircularProgress, Typography } from '@mui/material'
// Authentication removed for testing
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export default ProtectedRoute;
