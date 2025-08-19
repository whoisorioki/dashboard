import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
    Box,
    Button,
    TextField,
    Typography,
    Alert,
    CircularProgress,
    Paper,
    Stack
} from '@mui/material';
import { CloudUpload, FileUpload } from '@mui/icons-material';

// REST API endpoint for file upload
const UPLOAD_ENDPOINT = 'http://localhost:8000/api/ingest/upload';

export interface DataUploaderProps {
    onUploadInitiated?: (taskId: string) => void;
    onUploadComplete?: (result: any) => void;
    onUploadError?: (error: string) => void;
}

export const DataUploader: React.FC<DataUploaderProps> = ({
    onUploadInitiated,
    onUploadComplete,
    onUploadError
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [dataSourceName, setDataSourceName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadResult, setUploadResult] = useState<any>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setSelectedFile(acceptedFiles[0]);
            setError(null);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/csv': ['.csv'],
            'application/vnd.ms-excel': ['.xls'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
        },
        multiple: false
    });

    const handleUpload = async () => {
        if (!selectedFile || !dataSourceName.trim()) {
            setError('Please select a file and enter a datasource name');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Use REST API for file upload (this works!)
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('datasource_name', dataSourceName.trim());

            const response = await fetch(UPLOAD_ENDPOINT, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`);
            }

            const result = await response.json();
            setUploadResult(result);

            if (onUploadComplete) {
                onUploadComplete(result);
            }

            if (result.task_id && onUploadInitiated) {
                onUploadInitiated(result.task_id);
            }

            setLoading(false);
        } catch (err: any) {
            const errorMessage = err.message || 'Upload failed';
            setError(errorMessage);
            console.error("Upload failed:", err);

            if (onUploadError) {
                onUploadError(errorMessage);
            }

            setLoading(false);
        }
    };

    const handleReset = () => {
        setSelectedFile(null);
        setDataSourceName('');
        setError(null);
        setUploadResult(null);
    };

    return (
        <Paper elevation={2} sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h6" gutterBottom>
                Upload Sales Data
            </Typography>

            <Stack spacing={3}>
                {/* File Drop Zone */}
                <Box
                    {...getRootProps()}
                    sx={{
                        border: '2px dashed',
                        borderColor: isDragActive ? 'primary.main' : 'grey.300',
                        borderRadius: 2,
                        p: 3,
                        textAlign: 'center',
                        cursor: 'pointer',
                        backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                            borderColor: 'primary.main',
                            backgroundColor: 'action.hover'
                        }
                    }}
                >
                    <input {...getInputProps()} />
                    <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                    {isDragActive ? (
                        <Typography>Drop the file here...</Typography>
                    ) : (
                        <Typography>
                            Drag and drop a CSV or Excel file here, or click to select
                        </Typography>
                    )}
                </Box>

                {/* Selected File Info */}
                {selectedFile && (
                    <Alert severity="info">
                        <Typography variant="body2">
                            Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </Typography>
                    </Alert>
                )}

                {/* Data Source Name Input */}
                <TextField
                    fullWidth
                    label="Data Source Name"
                    value={dataSourceName}
                    onChange={(e) => setDataSourceName(e.target.value)}
                    placeholder="Enter a name for this data source (e.g., 'Q1_2024_Sales')"
                    helperText="This name will be used to identify the data in the system"
                />

                {/* Error Display */}
                {error && (
                    <Alert severity="error">
                        {error}
                    </Alert>
                )}

                {/* Upload Result */}
                {uploadResult && (
                    <Alert severity="success">
                        <Typography variant="body2">
                            Upload initiated successfully! Task ID: {uploadResult.task_id}
                        </Typography>
                    </Alert>
                )}

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                        variant="outlined"
                        onClick={handleReset}
                        disabled={loading}
                    >
                        Reset
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleUpload}
                        disabled={!selectedFile || !dataSourceName.trim() || loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <FileUpload />}
                    >
                        {loading ? 'Uploading...' : 'Upload Data'}
                    </Button>
                </Box>
            </Stack>
        </Paper>
    );
};

export default DataUploader;
