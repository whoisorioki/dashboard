import { Box, Typography, Chip, Alert } from '@mui/material'
import { InfoOutlined as InfoIcon } from '@mui/icons-material'
import { FALLBACK_DATE_RANGE } from '../constants/dateRanges'

const DataRangeInfo: React.FC = () => {
    return (
        <Alert
            icon={<InfoIcon />}
            severity="info"
            sx={{
                mb: 2,
                backgroundColor: 'rgba(25, 118, 210, 0.04)',
                border: '1px solid rgba(25, 118, 210, 0.2)'
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Data Available:
                </Typography>
                <Chip
                    label={`${FALLBACK_DATE_RANGE.MIN_DATE.toLocaleDateString()} - ${FALLBACK_DATE_RANGE.MAX_DATE.toLocaleDateString()}`}
                    size="small"
                    variant="outlined"
                    color="primary"
                />
                <Typography variant="body2" color="text.secondary">
                    • {Math.ceil((FALLBACK_DATE_RANGE.MAX_DATE.getTime() - FALLBACK_DATE_RANGE.MIN_DATE.getTime()) / (1000 * 60 * 60 * 24))} days of historical sales data
                </Typography>
            </Box>
        </Alert>
    )
}

export default DataRangeInfo
