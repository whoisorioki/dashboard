import { Box, Typography, Breadcrumbs, Link, alpha } from '@mui/material'
import { useLocation } from 'react-router-dom'
import {
    Dashboard as DashboardIcon,
    ShoppingCart as SalesIcon,
    Inventory as ProductsIcon,
    Public as RegionsIcon,
    NavigateNext as NavigateNextIcon
} from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'

interface PageHeaderProps {
    title: string
    subtitle?: string
    icon?: React.ReactElement
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, icon }) => {
    const theme = useTheme()
    const location = useLocation()

    const getPageIcon = (path: string) => {
        switch (path) {
            case '/overview':
            case '/':
                return <DashboardIcon />
            case '/sales':
                return <SalesIcon />
            case '/products':
                return <ProductsIcon />
            case '/regions':
                return <RegionsIcon />
            default:
                return <DashboardIcon />
        }
    }

    const getBreadcrumbs = () => {
        const pathnames = location.pathname.split('/').filter((x) => x)

        return (
            <Breadcrumbs
                separator={<NavigateNextIcon fontSize="small" />}
                sx={{ mb: 1 }}
            >
                <Link
                    underline="hover"
                    color="inherit"
                    href="/"
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        '&:hover': { color: theme.palette.primary.main }
                    }}
                >
                    <DashboardIcon sx={{ mr: 0.5, fontSize: 16 }} />
                    Dashboard
                </Link>
                {pathnames.map((name, index) => {
                    const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`
                    const isLast = index === pathnames.length - 1
                    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1)

                    return isLast ? (
                        <Typography color="text.primary" key={name} sx={{ fontWeight: 500 }}>
                            {capitalizedName}
                        </Typography>
                    ) : (
                        <Link
                            underline="hover"
                            color="inherit"
                            href={routeTo}
                            key={name}
                            sx={{ '&:hover': { color: theme.palette.primary.main } }}
                        >
                            {capitalizedName}
                        </Link>
                    )
                })}
            </Breadcrumbs>
        )
    }

    return (
        <Box
            sx={{
                mb: 1.5,
                mt: { xs: 2, sm: 3 }, // Add top margin for space from header
                pl: 0, // Remove ALL left padding
                pt: { xs: 1.5, sm: 2 },
                pb: { xs: 1.5, sm: 2 },
                pr: { xs: 1.5, sm: 2 },
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                },
            }}
        >
            {getBreadcrumbs()}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {icon && (
                    <Box
                        sx={{
                            p: 1.5,
                            borderRadius: 2,
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {icon}
                    </Box>
                )}
                <Box>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            color: theme.palette.text.primary,
                            mb: subtitle ? 0.5 : 0,
                        }}
                    >
                        {title}
                    </Typography>
                    {subtitle && (
                        <Typography
                            variant="body1"
                            color="text.secondary"
                            sx={{ fontWeight: 400 }}
                        >
                            {subtitle}
                        </Typography>
                    )}
                </Box>
            </Box>
        </Box>
    )
}

export default PageHeader
