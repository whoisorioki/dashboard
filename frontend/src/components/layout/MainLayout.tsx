import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Avatar,
    Menu,
    MenuItem,
    useMediaQuery,
    useTheme as useMuiTheme,
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    ShoppingCart as SalesIcon,
    Inventory as ProductsIcon,
    Public as RegionsIcon,
    Menu as MenuIcon,
    Settings as SettingsIcon,
    Person as PersonIcon,
    DarkMode as DarkModeIcon,
    LightMode as LightModeIcon,
} from '@mui/icons-material';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import FloatingActionMenu from '../FloatingActionMenu';
import WelcomeTour from '../WelcomeTour';
import HeaderControls from '../HeaderControls';

const drawerWidth = 240;

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const muiTheme = useMuiTheme();
    const isSmallScreen = useMediaQuery(muiTheme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [showTour, setShowTour] = useState(false);
    const { isDarkMode, toggleTheme } = useTheme();
    const { user, signOut } = useAuth();

    // Check if user has completed the tour
    React.useEffect(() => {
        const tourCompleted = localStorage.getItem('dashboardTourCompleted')
        if (!tourCompleted) {
            setTimeout(() => setShowTour(true), 1000) // Show tour after 1 second
        }
    }, [])

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleUserMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        await signOut();
        handleUserMenuClose();
    };

    const handleNavClick = (path: string) => {
        navigate(path);
        if (isSmallScreen) {
            setMobileOpen(false);
        }
    };

    const navItems = [
        { text: 'Overview', icon: <DashboardIcon />, path: '/overview' },
        { text: 'Sales', icon: <SalesIcon />, path: '/sales' },
        { text: 'Products', icon: <ProductsIcon />, path: '/products' },
        { text: 'Branches', icon: <RegionsIcon />, path: '/branches' },
    ];

    const getActiveTab = () => {
        const currentPath = location.pathname;
        const activeItem = navItems.find(item => item.path === currentPath);
        return activeItem ? activeItem.text : 'Overview';
    };

    const activeTab = getActiveTab();

    const drawer = (
        <>
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
                    Sales Analytics
                </Typography>
            </Box>
            <Divider />
            <List>
                {navItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton
                            selected={activeTab === item.text}
                            onClick={() => handleNavClick(item.path)}
                            sx={{
                                '&.Mui-selected': {
                                    bgcolor: isDarkMode ? 'rgba(66, 165, 245, 0.15)' : 'rgba(25, 118, 210, 0.15)',
                                },
                                '&:hover': {
                                    bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                                },
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    color: activeTab === item.text
                                        ? isDarkMode
                                            ? 'primary.main'
                                            : 'primary.main'
                                        : 'inherit',
                                }}
                            >
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Box sx={{ flexGrow: 1 }} />
            <Divider />
            <Box sx={{ p: 2 }}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 1,
                        borderRadius: 1,
                        cursor: 'pointer',
                        '&:hover': {
                            bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                        },
                    }}
                    onClick={handleUserMenuOpen}
                >
                    <Avatar sx={{ width: 32, height: 32, mr: 1.5 }}>
                        {user?.user_metadata?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {user?.user_metadata?.full_name || user?.email || 'User'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {user?.user_metadata?.role || 'User'}
                        </Typography>
                    </Box>
                    <SettingsIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </Box>
            </Box>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleUserMenuClose}
                PaperProps={{
                    elevation: 2,
                    sx: { minWidth: 180 },
                }}
            >
                <MenuItem onClick={handleUserMenuClose}>
                    <ListItemIcon>
                        <PersonIcon fontSize="small" />
                    </ListItemIcon>
                    <Typography variant="body2">Profile</Typography>
                </MenuItem>
                <MenuItem onClick={handleUserMenuClose}>
                    <ListItemIcon>
                        <SettingsIcon fontSize="small" />
                    </ListItemIcon>
                    <Typography variant="body2">Settings</Typography>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                    <Typography variant="body2">Logout</Typography>
                </MenuItem>
            </Menu>
        </>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar
                position="fixed"
                sx={{
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    ml: { md: `${drawerWidth}px` },
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    boxShadow: 1,
                }}
            >
                <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>

                    {/* Current Page Title (only on small screens) */}
                    <Typography
                        variant="h6"
                        sx={{
                            display: { xs: 'block', lg: 'none' },
                            fontWeight: 'bold',
                            mr: 2,
                        }}
                    >
                        {activeTab}
                    </Typography>

                    {/* Global Filters */}
                    <Box sx={{
                        flexGrow: 1,
                        display: 'flex',
                        justifyContent: { xs: 'flex-end', lg: 'center' },
                        overflow: 'hidden',
                        minWidth: 0,
                    }}>
                        <HeaderControls />
                    </Box>

                    {/* Theme Toggle */}
                    <IconButton
                        color="inherit"
                        onClick={toggleTheme}
                        sx={{
                            ml: 1,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'rotate(180deg)',
                            }
                        }}
                    >
                        {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
            >
                {/* Mobile drawer */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile
                    }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
                {/* Desktop drawer */}
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                            borderRight: (theme) =>
                                `1px solid ${theme.palette.mode === 'dark'
                                    ? 'rgba(255, 255, 255, 0.12)'
                                    : 'rgba(0, 0, 0, 0.12)'
                                }`,
                        },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    minWidth: 0, // Ensure flex item can shrink
                    mt: { xs: '56px', sm: '64px' },
                    position: 'relative',
                }}
            >
                {children}
                <FloatingActionMenu
                    onRefresh={() => window.location.reload()}
                    onExport={() => console.log('Export data')}
                    onShare={() => console.log('Share dashboard')}
                    onSettings={() => console.log('Open settings')}
                    onGenerateReport={() => console.log('Generate report')}
                />
                <WelcomeTour
                    open={showTour}
                    onClose={() => setShowTour(false)}
                />
            </Box>
        </Box>
    );
};

export default MainLayout;
