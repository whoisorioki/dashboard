import { Card, CardContent, Typography } from "@mui/material";
import ChartSkeleton from "./skeletons/ChartSkeleton";
import ChartEmptyState from "./states/ChartEmptyState";
import React from "react";

interface ChartCardProps {
  title: string;
  isLoading: boolean;
  error?: any;
  empty?: boolean;
  onRetry?: () => void;
  children: React.ReactNode;
}

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  isLoading,
  error,
  empty,
  onRetry,
  children,
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {title}
          </Typography>
          <ChartSkeleton />
        </CardContent>
      </Card>
    );
  }
  if (error) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {title}
          </Typography>
          <ChartEmptyState
            isError
            message={
              error instanceof Error ? error.message : "Failed to load data."
            }
            subtitle="An error occurred while loading data. Please try again."
            onRetry={onRetry || (() => {})}
          />
        </CardContent>
      </Card>
    );
  }
  if (empty) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {title}
          </Typography>
          <ChartEmptyState message="No data available." />
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          {title}
        </Typography>
        {children}
      </CardContent>
    </Card>
  );
};

export default ChartCard;
