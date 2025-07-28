import React from "react";
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

interface ConnectionStatusProps {
  systemHealth: { status: string } | null;
  druidHealth: { druidStatus: string; isAvailable: boolean } | null;
  druidDatasources: { datasources: string[]; count: number } | null;
  isLoading: boolean;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ systemHealth, druidHealth, druidDatasources, isLoading }) => {
  const currentTime = new Date().toLocaleTimeString();

  const services = [
    {
      name: "Backend API",
      status: systemHealth?.status === "ok" ? "connected" : "disconnected",
      url: "GraphQL: /graphql",
      details: systemHealth?.status === "ok" ? "API is responding" : `Status: ${systemHealth?.status}`,
      lastCheck: currentTime,
    },
    {
      name: "Druid Database",
      status: druidHealth?.isAvailable ? "connected" : "disconnected",
      url: "Druid via Backend API",
      details: druidHealth?.druidStatus || "Unknown status",
      lastCheck: currentTime,
    },
    {
      name: "Data Sources",
      status: (druidDatasources?.count ?? 0) > 0 ? "connected" : "warning",
      url: "Druid Datasources via Backend API",
      details: typeof druidDatasources?.count === "number"
        ? `${druidDatasources.count} datasources available`
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle color="success" />;
      case "warning":
        return <Warning color="warning" />;
      case "disconnected":
        return <Error color="error" />;
    }
  };

  const getStatusColor = (status: string) => {
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
    if (isLoading) return <Alert severity="info">Checking system status...</Alert>;
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
          onClick={() => window.location.reload()}
          disabled={isLoading}
        >
          {isLoading ? "Checking..." : "Refresh"}
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
                secondary={import.meta.env.VITE_API_GRAPHQL_URL || "http://localhost:8000/graphql"}
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
