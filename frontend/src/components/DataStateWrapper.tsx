import React from "react";
import { CircularProgress, Box } from "@mui/material";
import ChartEmptyState from "./states/ChartEmptyState";

interface DataStateWrapperProps<T> {
    isLoading: boolean;
    error?: unknown;
    data?: T[] | null;
    emptyMessage?: string;
    errorMessage?: string;
    children: React.ReactNode;
    minHeight?: number | string;
}

const DataStateWrapper = <T,>({
    isLoading,
    error,
    data,
    emptyMessage = "No data available for the selected period.",
    errorMessage = "Error loading data.",
    children,
    minHeight = 200,
}: DataStateWrapperProps<T>) => {
    if (isLoading) {
        return (
            <Box
                sx={{
                    minHeight,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <CircularProgress />
            </Box>
        );
    }
    if (error) {
        return (
            <ChartEmptyState
                isError
                message={error instanceof Error ? error.message : errorMessage}
            />
        );
    }
    if (!data || data.length === 0) {
        return <ChartEmptyState message={emptyMessage} />;
    }
    return <>{children}</>;
};

export default DataStateWrapper; 