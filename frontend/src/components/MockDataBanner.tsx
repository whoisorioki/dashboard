import React from "react";
import { Alert } from "@mui/material";

const MockDataBanner: React.FC = () => (
  <Alert severity="info" sx={{ borderRadius: 0, mb: 2 }}>
    <strong>Notice:</strong> The dashboard is currently running in <b>mock data mode</b> because the analytics backend (Druid) is unavailable.
  </Alert>
);

export default MockDataBanner; 