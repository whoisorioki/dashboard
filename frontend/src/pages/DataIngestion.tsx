import React, { useState } from 'react';
import { Box, Typography, Container, Paper, Tabs, Tab, Alert } from '@mui/material';
import { CloudUpload as UploadIcon, Timeline as StatusIcon } from '@mui/icons-material';
import DataUploader from '../components/DataUploader';
import TaskStatusTracker from '../components/TaskStatusTracker';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`ingestion-tabpanel-${index}`}
            aria-labelledby={`ingestion-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `ingestion-tab-${index}`,
        'aria-controls': `ingestion-tabpanel-${index}`,
    };
}

const DataIngestion: React.FC = () => {
    const [tabValue, setTabValue] = useState(0);
    const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
    const [taskHistory, setTaskHistory] = useState<string[]>([]);
    const [notification, setNotification] = useState<{
        type: 'success' | 'error' | 'info';
        message: string;
    } | null>(null);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleUploadInitiated = (taskId: string) => {
        setCurrentTaskId(taskId);
        setTaskHistory(prev => [taskId, ...prev.slice(0, 9)]); // Keep last 10 tasks
        setTabValue(1); // Switch to status tab
        setNotification({
            type: 'success',
            message: `Upload initiated! Task ID: ${taskId}`
        });
    };

    const handleUploadComplete = (result: any) => {
        setNotification({
            type: 'success',
            message: `Upload completed successfully! ${result.rowCount} rows processed.`
        });
    };

    const handleUploadError = (error: string) => {
        setNotification({
            type: 'error',
            message: `Upload failed: ${error}`
        });
    };

    const handleStatusChange = (status: string) => {
        if (status === 'SUCCESS') {
            setNotification({
                type: 'success',
                message: 'Data ingestion completed successfully!'
            });
        } else if (['FAILED', 'VALIDATION_FAILED', 'SYSTEM_ERROR'].includes(status)) {
            setNotification({
                type: 'error',
                message: `Task failed with status: ${status}`
            });
        }
    };

    const handleStatusComplete = (result: any) => {
        setNotification({
            type: 'success',
            message: `Task completed! ${result.rowCount} rows ingested into ${result.datasourceName}`
        });
    };

    const handleStatusError = (error: string) => {
        setNotification({
            type: 'error',
            message: `Status tracking error: ${error}`
        });
    };

    const clearNotification = () => {
        setNotification(null);
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Page Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Data Ingestion
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Upload and process sales data files for analytics. Monitor ingestion progress in real-time.
                </Typography>
            </Box>

            {/* Notification */}
            {notification && (
                <Alert
                    severity={notification.type}
                    sx={{ mb: 3 }}
                    onClose={clearNotification}
                >
                    {notification.message}
                </Alert>
            )}

            {/* Main Content */}
            <Paper sx={{ width: '100%' }}>
                {/* Tabs */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        aria-label="data ingestion tabs"
                    >
                        <Tab
                            label="Upload Data"
                            icon={<UploadIcon />}
                            iconPosition="start"
                            {...a11yProps(0)}
                        />
                        <Tab
                            label="Monitor Status"
                            icon={<StatusIcon />}
                            iconPosition="start"
                            {...a11yProps(1)}
                        />
                    </Tabs>
                </Box>

                {/* Upload Tab */}
                <TabPanel value={tabValue} index={0}>
                    <DataUploader
                        onUploadInitiated={handleUploadInitiated}
                        onUploadComplete={handleUploadComplete}
                        onUploadError={handleUploadError}
                    />
                </TabPanel>

                {/* Status Tab */}
                <TabPanel value={tabValue} index={1}>
                    {currentTaskId ? (
                        <TaskStatusTracker
                            taskId={currentTaskId}
                            onStatusChange={handleStatusChange}
                            onComplete={handleStatusComplete}
                            onError={handleStatusError}
                        />
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <StatusIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                No Active Tasks
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Upload a file to start monitoring ingestion progress.
                            </Typography>
                        </Box>
                    )}

                    {/* Task History */}
                    {taskHistory.length > 1 && (
                        <Paper sx={{ p: 3, mt: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Recent Tasks
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {taskHistory.slice(1).map((taskId, index) => (
                                    <Box
                                        key={taskId}
                                        sx={{
                                            p: 2,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            borderRadius: 1,
                                            cursor: 'pointer',
                                            '&:hover': {
                                                backgroundColor: 'action.hover',
                                            }
                                        }}
                                        onClick={() => setCurrentTaskId(taskId)}
                                    >
                                        <Typography variant="body2" fontWeight="medium">
                                            Task {index + 1}: {taskId}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Click to view status
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Paper>
                    )}
                </TabPanel>
            </Paper>

            {/* Help Section */}
            <Paper sx={{ p: 3, mt: 4, backgroundColor: 'grey.50' }}>
                <Typography variant="h6" gutterBottom>
                    📚 How It Works
                </Typography>
                <Typography variant="body2" paragraph>
                    The data ingestion process follows these steps:
                </Typography>
                <Box component="ol" sx={{ pl: 3, m: 0 }}>
                    <li>
                        <Typography variant="body2">
                            <strong>Upload:</strong> Select a file (CSV, Excel, or Parquet) up to 500MB
                        </Typography>
                    </li>
                    <li>
                        <Typography variant="body2">
                            <strong>Validation:</strong> System validates file format, size, and data schema
                        </Typography>
                    </li>
                    <li>
                        <Typography variant="body2">
                            <strong>Processing:</strong> File is processed and uploaded to secure storage
                        </Typography>
                    </li>
                    <li>
                        <Typography variant="body2">
                            <strong>Ingestion:</strong> Data is ingested into Apache Druid for analytics
                        </Typography>
                    </li>
                    <li>
                        <Typography variant="body2">
                            <strong>Completion:</strong> Data becomes available in the dashboard
                        </Typography>
                    </li>
                </Box>

                <Typography variant="body2" sx={{ mt: 2 }}>
                    <strong>Supported Formats:</strong> CSV, Excel (.xlsx, .xls), Parquet
                </Typography>
                <Typography variant="body2">
                    <strong>File Size Limit:</strong> 500MB per file
                </Typography>
                <Typography variant="body2">
                    <strong>Processing Time:</strong> Typically 2-5 minutes for files under 100MB
                </Typography>
            </Paper>
        </Container>
    );
};

export default DataIngestion;
