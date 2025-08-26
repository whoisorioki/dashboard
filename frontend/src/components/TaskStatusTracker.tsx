import React, { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Chip,
    LinearProgress,
    Alert,
    Stack,
    Skeleton
} from '@mui/material';
import {
    Schedule,
    CheckCircle,
    Error,
    HourglassEmpty,
    CloudUpload,
    DataUsage,
    Help
} from '@mui/icons-material';
import { gql } from '../gql/gql';
import type { GetIngestionTaskStatusQuery, GetIngestionTaskStatusQueryVariables } from '../gql/graphql';

// GraphQL query for task status using generated gql function
const GET_TASK_STATUS = gql(`
  query GetIngestionTaskStatus($taskId: String!) {
    getIngestionTaskStatus(taskId: $taskId) {
      taskId
      status
      datasourceName
      originalFilename
      fileSize
      createdAt
    }
  }
`);

export interface TaskStatusTrackerProps {
    taskId: string;
    onStatusChange?: (status: string) => void;
    onComplete?: (result: GetIngestionTaskStatusQuery['getIngestionTaskStatus']) => void;
    onError?: (error: string) => void;
}

const STATUS_CONFIG = {
    PENDING: { label: 'Pending', color: 'primary' as const, icon: Schedule, description: 'Task is queued for processing' },
    PROCESSING: { label: 'Processing', color: 'info' as const, icon: DataUsage, description: 'File is being processed' },
    UPLOADING: { label: 'Uploading', color: 'info' as const, icon: CloudUpload, description: 'File is being uploaded to S3' },
    VALIDATING: { label: 'Validating', color: 'warning' as const, icon: HourglassEmpty, description: 'Data is being validated' },
    INGESTING: { label: 'Ingesting', color: 'warning' as const, icon: DataUsage, description: 'Data is being ingested into Druid' },
    COMPLETED: { label: 'Completed', color: 'success' as const, icon: CheckCircle, description: 'Task completed successfully' },
    FAILED: { label: 'Failed', color: 'error' as const, icon: Error, description: 'Task failed during processing' },
    VALIDATION_FAILED: { label: 'Validation Failed', color: 'error' as const, icon: Error, description: 'Data validation failed' },
    INGESTION_FAILED: { label: 'Ingestion Failed', color: 'error' as const, icon: Error, description: 'Druid ingestion failed' },
    SYSTEM_ERROR: { label: 'System Error', color: 'error' as const, icon: Error, description: 'System error occurred' },
    UNKNOWN: { label: 'Unknown', color: 'primary' as const, icon: Help, description: 'Unknown status' }
};

export const TaskStatusTracker: React.FC<TaskStatusTrackerProps> = ({
    taskId,
    onStatusChange,
    onComplete,
    onError
}) => {
    // GraphQL query hook using generated types
    const { data, loading, error, refetch } = useQuery<GetIngestionTaskStatusQuery, GetIngestionTaskStatusQueryVariables>(GET_TASK_STATUS, {
        variables: { taskId },
        pollInterval: 3000,
        notifyOnNetworkStatusChange: true,
        onCompleted: (data) => {
            const taskData = data.getIngestionTaskStatus;
            if (taskData) {
                const status = taskData.status;

                if (onStatusChange) {
                    onStatusChange(status);
                }

                if (status === 'COMPLETED' && onComplete) {
                    onComplete(taskData);
                }

                if (status === 'FAILED' || status === 'INGESTION_FAILED' || status === 'VALIDATION_FAILED' || status === 'SYSTEM_ERROR') {
                    if (onError) {
                        onError('Task failed');
                    }
                }
            }
        },
        onError: (error) => {
            console.error("Failed to fetch task status:", error);
            if (onError) {
                onError(error.message);
            }
        }
    });

    useEffect(() => {
        // Trigger initial fetch
        refetch();
    }, [refetch]);

    if (loading && !data) {
        return (
            <Card>
                <CardContent>
                    <Stack spacing={2}>
                        <Skeleton variant="text" width="60%" />
                        <Skeleton variant="rectangular" height={20} />
                        <Skeleton variant="text" width="40%" />
                    </Stack>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Alert severity="error">
                Failed to load task status: {error.message}
            </Alert>
        );
    }

    const taskData = data?.getIngestionTaskStatus;
    if (!taskData) {
        return (
            <Alert severity="warning">
                Task not found or no data available
            </Alert>
        );
    }

    const status = taskData.status;
    const statusConfig = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.UNKNOWN;
    const StatusIcon = statusConfig.icon;

    const isInProgress = ['PENDING', 'PROCESSING', 'UPLOADING', 'VALIDATING', 'INGESTING'].includes(status);
    const isCompleted = status === 'COMPLETED';
    const isFailed = ['FAILED', 'VALIDATION_FAILED', 'INGESTION_FAILED', 'SYSTEM_ERROR'].includes(status);

    return (
        <Card>
            <CardContent>
                <Stack spacing={2}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <StatusIcon color={statusConfig.color} />
                        <Typography variant="h6" component="div">
                            Task Status: {statusConfig.label}
                        </Typography>
                    </Box>

                    {/* Progress Bar */}
                    {isInProgress && (
                        <Box>
                            <LinearProgress
                                variant="indeterminate"
                                color={statusConfig.color}
                                sx={{ height: 8, borderRadius: 4 }}
                            />
                        </Box>
                    )}

                    {/* Status Description */}
                    <Typography variant="body2" color="text.secondary">
                        {statusConfig.description}
                    </Typography>

                    {/* Task Details */}
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            <strong>Task ID:</strong> {taskData.taskId}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            <strong>Data Source:</strong> {taskData.datasourceName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            <strong>File:</strong> {taskData.originalFilename}
                        </Typography>
                        {taskData.fileSize && (
                            <Typography variant="body2" color="text.secondary">
                                <strong>Size:</strong> {(taskData.fileSize / 1024 / 1024).toFixed(2)} MB
                            </Typography>
                        )}
                        <Typography variant="body2" color="text.secondary">
                            <strong>Created:</strong> {new Date(taskData.createdAt).toLocaleString()}
                        </Typography>
                    </Box>

                    {/* Status Chip */}
                    <Box>
                        <Chip
                            label={statusConfig.label}
                            color={statusConfig.color}
                            icon={<StatusIcon />}
                            variant={isCompleted ? "filled" : "outlined"}
                        />
                    </Box>

                    {/* Success/Error Messages */}
                    {isCompleted && (
                        <Alert severity="success">
                            Data ingestion completed successfully! The data is now available in the dashboard.
                        </Alert>
                    )}

                    {isFailed && (
                        <Alert severity="error">
                            Task failed during processing. Please check the logs for more details.
                        </Alert>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
};

export default TaskStatusTracker;
