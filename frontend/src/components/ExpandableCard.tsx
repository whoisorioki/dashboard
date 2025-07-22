import React, { useState } from "react";
import {
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Dialog,
  DialogContent,
  DialogTitle,
  useTheme,
  Box,
  Typography,
} from "@mui/material";
import { OpenInFull as OpenInFullIcon, Close as CloseIcon, InfoOutlined as InfoIcon } from "@mui/icons-material";

interface ExpandableCardProps {
  title: string;
  children: React.ReactNode;
  infoContent?: React.ReactNode;
  minHeight?: number | string;
}

const ExpandableCard: React.FC<ExpandableCardProps> = ({ title, children, infoContent, minHeight }) => {
  const [expandOpen, setExpandOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const theme = useTheme();

  return (
    <Card sx={{ position: "relative", minHeight: minHeight || 320, display: "flex", flexDirection: "column" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2, pb: 0 }}>
        <Typography variant="h6" fontWeight={600}>{title}</Typography>
        <Box>
          {infoContent && (
            <Tooltip title="More info" arrow>
              <IconButton size="small" onClick={() => setInfoOpen(true)}>
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Expand" arrow>
            <IconButton size="small" onClick={() => setExpandOpen(true)}>
              <OpenInFullIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {children}
      </CardContent>
      {/* Info Modal */}
      <Dialog open={infoOpen} onClose={() => setInfoOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {title} Info
          <IconButton
            aria-label="close"
            onClick={() => setInfoOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8, color: theme.palette.grey[500] }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {infoContent}
        </DialogContent>
      </Dialog>
      {/* Expand Modal */}
      <Dialog open={expandOpen} onClose={() => setExpandOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {title} (Expanded)
          <IconButton
            aria-label="close"
            onClick={() => setExpandOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8, color: theme.palette.grey[500] }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ minHeight: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {children}
          </Box>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ExpandableCard; 