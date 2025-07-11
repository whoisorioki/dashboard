import React from 'react'
import { Card, CardContent, Typography, Box, Tooltip, IconButton } from '@mui/material'
import { HelpOutline as HelpOutlineIcon, TrendingUp as TrendingUpIcon } from '@mui/icons-material'
import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'
import { useApi } from '../hooks/useDynamicApi'
import { TargetAttainmentData } from '../types/api'
import ChartSkeleton from './skeletons/ChartSkeleton'
import ChartErrorState from './states/ChartErrorState'
import ChartEmptyState from './states/ChartEmptyState'

interface QuotaAttainmentGaugeProps {
    startDate: string | null
    endDate: string | null
    target: number
    branch?: string
    productLine?: string
}

const QuotaAttainmentGauge: React.FC<QuotaAttainmentGaugeProps> = ({
    startDate,
    endDate,
    target,
    branch,
    productLine
}) => {
    const { data, error, isLoading, mutate } = useApi<TargetAttainmentData>('/kpis/sales-target-attainment', {
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        target: target,
        branch: branch || undefined,
        product_line: productLine || undefined,
    })

    if (isLoading) {
        return (
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" gutterBottom>
                        Quota Attainment
                    </Typography>
                    <ChartSkeleton />
                </CardContent>
            </Card>
        )
    }

    if (error) {
        return (
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        Quota Attainment
                    </Typography>
                    <ChartErrorState
                        errorMessage="Failed to load quota attainment data"
                        onRetry={mutate}
                    />
                </CardContent>
            </Card>
        )
    }

    if (!data) {
        return (
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        Quota Attainment
                    </Typography>
                    <ChartEmptyState
                        message="No Quota Data Available"
                        subtitle="Unable to calculate quota attainment. Check if target and sales data are available."
                    />
                </CardContent>
            </Card>
        )
    }

    const attainmentPercentage = Math.round(data.attainment_percentage)
    const salesValue = data.total_sales

    // Determine color based on performance
    const getPerformanceColor = (percentage: number) => {
        if (percentage >= 100) return '#2e7d32' // Green for on/above target
        if (percentage >= 80) return '#f57c00'  // Orange for close to target
        return '#d32f2f' // Red for below target
    }

    const performanceColor = getPerformanceColor(attainmentPercentage)

    const option: EChartsOption = {
        tooltip: {
            formatter: function () {
                return `
          <div style="font-size: 14px;">
            <strong>Quota Attainment</strong><br/>
            Sales: $${(salesValue / 1000000).toFixed(1)}M<br/>
            Target: $${(target / 1000000).toFixed(0)}M<br/>
            Progress: ${attainmentPercentage}%
          </div>
        `
            }
        },
        series: [
            {
                name: 'Quota',
                type: 'gauge',
                startAngle: 180,
                endAngle: 0,
                min: 0,
                max: 150, // Show up to 150% for over-performance
                splitNumber: 5,
                itemStyle: {
                    color: performanceColor,
                    shadowColor: 'rgba(0,0,0,0.45)',
                    shadowBlur: 10,
                    shadowOffsetX: 2,
                    shadowOffsetY: 2
                },
                progress: {
                    show: true,
                    roundCap: true,
                    width: 18
                },
                pointer: {
                    length: '80%',
                    width: 8,
                    offsetCenter: [0, 0]
                },
                axisLine: {
                    lineStyle: {
                        width: 18,
                        color: [
                            [0.8, '#ff6b6b'],
                            [1.0, '#4ecdc4'],
                            [1.5, '#45b7d1']
                        ]
                    }
                },
                axisTick: {
                    distance: -25,
                    splitNumber: 2,
                    lineStyle: {
                        width: 2,
                        color: '#999'
                    }
                },
                splitLine: {
                    distance: -30,
                    length: 14,
                    lineStyle: {
                        width: 3,
                        color: '#999'
                    }
                },
                axisLabel: {
                    distance: -40,
                    color: '#999',
                    fontSize: 14,
                    formatter: function (value: number) {
                        return value + '%'
                    }
                },
                title: {
                    offsetCenter: [0, '30%'],
                    fontSize: 18,
                    color: '#666',
                    fontWeight: 'bold'
                },
                detail: {
                    fontSize: 40,
                    offsetCenter: [0, '10%'],
                    valueAnimation: true,
                    color: performanceColor,
                    fontWeight: 'bold',
                    formatter: function (value: number) {
                        return Math.round(value) + '%'
                    }
                },
                data: [
                    {
                        value: attainmentPercentage,
                        name: 'Achievement'
                    }
                ]
            }
        ]
    }

    return (
        <Card sx={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Tooltip title="Gauge chart showing progress toward sales quota. Green indicates on/above target, orange shows close to target, and red indicates below target performance." arrow>
                <IconButton
                    size="small"
                    sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        zIndex: 1,
                        color: 'text.secondary',
                        '&:hover': {
                            color: 'primary.main',
                            backgroundColor: 'action.hover',
                        },
                    }}
                >
                    <HelpOutlineIcon fontSize="small" />
                </IconButton>
            </Tooltip>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TrendingUpIcon sx={{ mr: 1, color: performanceColor }} />
                    <Typography variant="h5">
                        Quota Attainment
                    </Typography>
                </Box>

                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                    <ReactECharts
                        option={option}
                        style={{ height: '280px', width: '100%' }}
                        opts={{ renderer: 'canvas' }}
                    />
                </Box>

                <Box sx={{ mt: 1, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        Sales: ${(salesValue / 1000000).toFixed(1)}M of ${(target / 1000000).toFixed(0)}M target
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    )
}

export default QuotaAttainmentGauge
