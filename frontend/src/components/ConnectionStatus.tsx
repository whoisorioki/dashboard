import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import {
    CheckCircle,
    Error,
    Warning,
    Refresh,
    ExpandMore,
    Storage,
    Api,
    Dashboard as DashboardIcon,
} from '@mui/icons-material';

interface ServiceStatus {
    name: string;
    status: 'connected' | 'disconnected' | 'warning';
    url: string;
    details?: string;
    lastCheck?: string;
}

interface SystemHealth {
    services: ServiceStatus[];
    overall: 'healthy' | 'degraded' | 'down';
    lastUpdate: string;
}

const ConnectionStatus: React.FC = () => {
    const [health, setHealth] = useState<SystemHealth | null>(null);
    const [loading, setLoading] = useState(false);

    const checkHealth = async () => {
        setLoading(true);
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
        const currentTime = new Date().toLocaleTimeString();

        const services: ServiceStatus[] = [];

        // Test Backend API
        try {
            const response = await fetch(`${baseUrl}/api/health`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            services.push({
                name: 'Backend API',
                status: response.ok ? 'connected' : 'disconnected',
                url: `${baseUrl}/api/health`,
                details: response.ok ? 'API is responding' : `HTTP ${response.status}`,
                lastCheck: currentTime,
            });
        } catch (error: any) {
            services.push({
                name: 'Backend API',
                status: 'disconnected',
                url: `${baseUrl}/api/health`,
                details: error?.message || 'Connection failed',
                lastCheck: currentTime,
            });
        }

        // Test Druid Connection through Backend
        try {
            const response = await fetch(`${baseUrl}/api/health/druid`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            if (response.ok) {
                const data = await response.json();
                services.push({
                    name: 'Druid Database',
                    status: data.is_available ? 'connected' : 'disconnected',
                    url: `${baseUrl}/api/health/druid`,
                    details: data.druid_status || 'Unknown status',
                    lastCheck: currentTime,
                });
            } else {
                services.push({
                    name: 'Druid Database',
                    status: 'disconnected',
                    url: `${baseUrl}/api/health/druid`,
                    details: `HTTP ${response.status}`,
                    lastCheck: currentTime,
                });
            }
        } catch (error: any) {
            services.push({
                name: 'Druid Database',
                status: 'disconnected',
                url: `${baseUrl}/api/health/druid`,
                details: error?.message || 'Connection failed',
                lastCheck: currentTime,
            });
        }

        // Test Datasources
        try {
            const response = await fetch(`${baseUrl}/api/druid/datasources`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            if (response.ok) {
                const data = await response.json();
                services.push({
                    name: 'Data Sources',
                    status: data.count > 0 ? 'connected' : 'warning',
                    url: `${baseUrl}/api/druid/datasources`,
                    details: `${data.count} datasources available`,
                    lastCheck: currentTime,
                });
            } else {
                services.push({
                    name: 'Data Sources',
                    status: 'disconnected',
                    url: `${baseUrl}/api/druid/datasources`,
                    details: `HTTP ${response.status}`,
                    lastCheck: currentTime,
                });
            }
        } catch (error: any) {
            services.push({
                name: 'Data Sources',
                status: 'disconnected',
                url: `${baseUrl}/api/druid/datasources`,
                details: error?.message || 'Connection failed',
                lastCheck: currentTime,
            });
        }

        // Determine overall health
        const connectedCount = services.filter(s => s.status === 'connected').length;
        const totalCount = services.length;

        let overall: 'healthy' | 'degraded' | 'down';
        if (connectedCount === totalCount) {
            overall = 'healthy';
        } else if (connectedCount > 0) {
            overall = 'degraded';
        } else {
            overall = 'down';
        }

        setHealth({
            services,
            overall,
            lastUpdate: currentTime,
        });

        setLoading(false);
    };

    useEffect(() => {
        checkHealth();
    }, []);

    const getStatusIcon = (status: ServiceStatus['status']) => {
        switch (status) {
            case 'connected':
                return <CheckCircle color="success" />;
            case 'warning':
                return <Warning color="warning" />;
            case 'disconnected':
                return <Error color="error" />;
        }
    };

    const getStatusColor = (status: ServiceStatus['status']) => {
        switch (status) {
            case 'connected':
                return 'success';
            case 'warning':
                return 'warning';
            case 'disconnected':
                return 'error';
        }
    };

    const getOverallAlert = () => {
        if (!health) return null;

        switch (health.overall) {
            case 'healthy':
                return <Alert severity="success">All systems operational</Alert>;
            case 'degraded':
                return <Alert severity="warning">Some services are experiencing issues</Alert>;
            case 'down':
                return <Alert severity="error">System is down - please check your services</Alert>;
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    System Health
                </Typography>
                <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={checkHealth}
                    disabled={loading}
                >
                    {loading ? 'Checking...' : 'Refresh'}
                </Button>
            </Box>

            {getOverallAlert()}

            <Grid container spacing={3} sx={{ mt: 2 }}>
                {health?.services.map((service, index) => (
                    <Grid item xs={12} md={4} key={index}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
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
                                secondary={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}`}
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

            {health && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                    Last updated: {health.lastUpdate}
                </Typography>
            )}
        </Box>
    );
};

export default ConnectionStatus;
