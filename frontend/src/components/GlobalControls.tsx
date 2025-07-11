import { Box, Typography, Paper, useMediaQuery, useTheme as useMuiTheme, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { useDataRange } from '../hooks/useDataRange'

interface GlobalControlsProps {
  dateRange: [Date | null, Date | null]
  onDateRangeChange: (newRange: [Date | null, Date | null]) => void
  branch?: string
  onBranchChange?: (branch: string) => void
  productLine?: string
  onProductLineChange?: (productLine: string) => void
}

const GlobalControls: React.FC<GlobalControlsProps> = ({
  dateRange,
  onDateRangeChange,
  branch = 'all',
  onBranchChange,
  productLine = 'all',
  onProductLineChange
}) => {
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const { minDate, maxDate } = useDataRange();

  const handleStartDateChange = (date: Date | null) => {
    onDateRangeChange([date, dateRange[1]])
  }

  const handleEndDateChange = (date: Date | null) => {
    onDateRangeChange([dateRange[0], date])
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 3,
        borderRadius: 2,
        border: (theme) => `1px solid ${theme.palette.divider}`
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
          Dashboard Overview
        </Typography>

        <Box
          sx={{
            display: 'flex',
            gap: { xs: 1, md: 3 },
            flexDirection: isMobile ? 'column' : 'row',
            width: isMobile ? '100%' : 'auto',
            alignItems: isMobile ? 'stretch' : 'center',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              flexDirection: isMobile ? 'column' : 'row',
              width: isMobile ? '100%' : 'auto',
            }}
          >
            <DatePicker
              label="Start Date"
              value={dateRange[0]}
              onChange={handleStartDateChange}
              minDate={minDate}
              maxDate={maxDate}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: isMobile
                }
              }}
            />
            <DatePicker
              label="End Date"
              value={dateRange[1]}
              onChange={handleEndDateChange}
              minDate={minDate}
              maxDate={maxDate}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: isMobile
                }
              }}
            />
          </Box>

          <Box
            sx={{
              display: 'flex',
              gap: 2,
              alignItems: 'center',
              justifyContent: isMobile ? 'center' : 'flex-start',
              width: isMobile ? '100%' : 'auto',
            }}
          >

          </Box>

          {/* Business Context Filters */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              alignItems: 'center',
              flexDirection: isMobile ? 'column' : 'row',
              width: isMobile ? '100%' : 'auto',
            }}
          >
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Branch</InputLabel>
              <Select
                value={branch}
                label="Branch"
                onChange={(e) => onBranchChange?.(e.target.value)}
              >
                <MenuItem value="all">All Branches</MenuItem>
                <MenuItem value="Nakuru">Nakuru</MenuItem>
                <MenuItem value="Thika">Thika</MenuItem>
                <MenuItem value="Nairobi">Nairobi</MenuItem>
                <MenuItem value="Kiambu">Kiambu</MenuItem>
                <MenuItem value="Eldoret">Eldoret</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Product Line</InputLabel>
              <Select
                value={productLine}
                label="Product Line"
                onChange={(e) => onProductLineChange?.(e.target.value)}
              >
                <MenuItem value="all">All Products</MenuItem>
                <MenuItem value="TVS">TVS</MenuItem>
                <MenuItem value="Piaggio">Piaggio</MenuItem>
                <MenuItem value="Accessories">Accessories</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Box>
    </Paper>
  )
}

export default GlobalControls
