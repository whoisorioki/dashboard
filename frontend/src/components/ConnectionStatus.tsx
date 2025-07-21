import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  Button,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  CheckCircle,
  Error,
  Warning,
  Refresh,
  ExpandMore,
  Storage,
  Api,
  Dashboard as DashboardIcon,
} from "@mui/icons-material";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface ServiceStatus {
  name: string;
  status: "connected" | "disconnected" | "warning";
  url: string;
  details?: string;
  lastCheck?: string;
}

interface SystemHealth {
  services: ServiceStatus[];
  overall: "healthy" | "degraded" | "down";
  lastUpdate: string;
}

// Add types for the API responses
interface HealthApiResponse { data: { status: string }; }
interface DruidHealthApiResponse { data: { druid_status: string; is_available: boolean }; }
interface DatasourcesApiResponse { data: { datasources: string[]; count: number }; }

const HEALTH_QUERY_KEY = ["health-status"];
const DRUID_QUERY_KEY = ["druid-health-status"];
const DATASOURCES_QUERY_KEY = ["druid-datasources-status"];

const fetchHealth = async (baseUrl: string) => {
  const res = await fetch(`${baseUrl}/api/health`);
  return res.json();
};
const fetchDruidHealth = async (baseUrl: string) => {
  const res = await fetch(`${baseUrl}/api/health/druid`);
  return res.json();
};
const fetchDatasources = async (baseUrl: string) => {
  const res = await fetch(`${baseUrl}/api/druid/datasources`);
  return res.json();
};

const ConnectionStatus: React.FC = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const queryClient = useQueryClient();
  const currentTime = new Date().toLocaleTimeString();

  const {
    data: healthData,
    isFetching: loadingHealth,
    refetch: refetchHealth,
  } = useQuery<HealthApiResponse>({
    queryKey: HEALTH_QUERY_KEY,
    queryFn: () => fetchHealth(baseUrl),
    staleTime: 60 * 1000,
  });
  const {
    data: druidData,
    isFetching: loadingDruid,
    refetch: refetchDruid,
  } = useQuery<DruidHealthApiResponse>({
    queryKey: DRUID_QUERY_KEY,
    queryFn: () => fetchDruidHealth(baseUrl),
    staleTime: 60 * 1000,
  });
  const {
    data: datasourcesData,
    isFetching: loadingDatasources,
    refetch: refetchDatasources,
  } = useQuery<DatasourcesApiResponse>({
    queryKey: DATASOURCES_QUERY_KEY,
    queryFn: () => fetchDatasources(baseUrl),
    staleTime: 60 * 1000,
  });

  const loading = loadingHealth || loadingDruid || loadingDatasources;

  const handleRefresh = () => {
    refetchHealth();
    refetchDruid();
    refetchDatasources();
  };

  // Compose services array from query results
  const services: ServiceStatus[] = [
    {
      name: "Backend API",
      status: healthData?.data?.status === "ok" ? "connected" : "disconnected",
      url: `${baseUrl}/api/health`,
      details: healthData?.data?.status === "ok" ? "API is responding" : `Status: ${healthData?.data?.status}`,
      lastCheck: currentTime,
    },
    {
      name: "Druid Database",
      status: druidData?.data?.is_available ? "connected" : "disconnected",
      url: `${baseUrl}/api/health/druid`,
      details: druidData?.data?.druid_status || "Unknown status",
      lastCheck: currentTime,
    },
    {
      name: "Data Sources",
      status: datasourcesData?.data?.count > 0 ? "connected" : "warning",
      url: `${baseUrl}/api/druid/datasources`,
      details: typeof datasourcesData?.data?.count === "number"
        ? `${datasourcesData.data.count} datasources available`
        : "undefined datasources available",
      lastCheck: currentTime,
    },
  ];

  // Determine overall health
  const connectedCount = services.filter((s) => s.status === "connected").length;
  const totalCount = services.length;
  let overall: "healthy" | "degraded" | "down";
  if (connectedCount === totalCount) {
    overall = "healthy";
  } else if (connectedCount > 0) {
    overall = "degraded";
  } else {
    overall = "down";
  }

  const getStatusIcon = (status: ServiceStatus["status"]) => {
    switch (status) {
      case "connected":
        return <CheckCircle color="success" />;
      case "warning":
        return <Warning color="warning" />;
      case "disconnected":
        return <Error color="error" />;
    }
  };

  const getStatusColor = (status: ServiceStatus["status"]) => {
    switch (status) {
      case "connected":
        return "success";
      case "warning":
        return "warning";
      case "disconnected":
        return "error";
    }
  };

  const getOverallAlert = () => {
    switch (overall) {
      case "healthy":
        return <Alert severity="success">All systems operational</Alert>;
      case "degraded":
        return <Alert severity="warning">Some services are experiencing issues</Alert>;
      case "down":
        return <Alert severity="error">System is down - please check your services</Alert>;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          System Health
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={handleRefresh}
          disabled={loading}
        >
          {loading ? "Checking..." : "Refresh"}
        </Button>
      </Box>

      {getOverallAlert()}

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {services.map((service, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  {getStatusIcon(service.status)}
                  <Typography variant="h6" sx={{ ml: 1, flexGrow: 1 }}>
                    {service.name}
                  </Typography>
                  <Chip
                    label={service.status}
                    color={getStatusColor(service.status)}
                    size="small"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {service.details}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Last checked: {service.lastCheck}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Accordion sx={{ mt: 3 }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h6">Connection Details</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List>
            <ListItem>
              <ListItemIcon>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText
                primary="Frontend"
                secondary={`Running on ${window.location.origin}`}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Api />
              </ListItemIcon>
              <ListItemText
                primary="Backend API"
                secondary={`${baseUrl}`}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Storage />
              </ListItemIcon>
              <ListItemText
                primary="Druid Cluster"
                secondary="Connected via Backend API"
              />
            </ListItem>
          </List>
        </AccordionDetails>
      </Accordion>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 2, display: "block" }}
      >
        Last updated: {currentTime}
      </Typography>
    </Box>
  );
};

export default ConnectionStatus;
