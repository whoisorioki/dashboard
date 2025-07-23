import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
} from "@mui/material";
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
  Insights as InsightsIcon,
  MonetizationOn as MonetizationOnIcon,
  NotificationImportant as NotificationImportantIcon,
} from "@mui/icons-material";
import { useTheme } from "../../context/ThemeContext";
import FloatingActionMenu from "../FloatingActionMenu";
import WelcomeTour from "../WelcomeTour";
import { DataModeProvider } from "../../context/DataModeContext";
import ControlBar from "./ControlBar";
import { useLocalFilterReset } from "../../context/LocalFilterResetContext";

const drawerWidth = 240;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const muiTheme = useMuiTheme();
  const isSmallScreen = useMediaQuery(muiTheme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showTour, setShowTour] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const { resetAllLocalFilters } = useLocalFilterReset();

  // Check if user has completed the tour
  React.useEffect(() => {
    const tourCompleted = localStorage.getItem("dashboardTourCompleted");
    if (!tourCompleted) {
      // Show tour after a short delay to let the page load
      const timer = setTimeout(() => setShowTour(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleTourClose = () => {
    setShowTour(false);
    // Mark tour as completed
    localStorage.setItem("dashboardTourCompleted", "true");
  };

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
    // signOut(); // Removed as per edit hint
    handleUserMenuClose();
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    if (isSmallScreen) {
      setMobileOpen(false);
    }
  };

  const navItems = [
    { text: "Dashboard Overview", icon: <DashboardIcon />, path: "/overview" },
    { text: "Sales Performance", icon: <SalesIcon />, path: "/sales" },
    { text: "Product Analytics", icon: <ProductsIcon />, path: "/products" },
    { text: "Branch Performance", icon: <RegionsIcon />, path: "/branches" },
    {
      text: "Profitability Analysis",
      icon: <MonetizationOnIcon />,
      path: "/profitability",
    },
    {
      text: "Alerts & Diagnostics",
      icon: <NotificationImportantIcon />,
      path: "/alerts",
    },
  ];

  const getActiveTab = () => {
    const currentPath = location.pathname;
    const activeItem = navItems.find((item) => item.path === currentPath);
    return activeItem ? activeItem.text : "Overview";
  };

  const activeTab = getActiveTab();

  const drawer = (
    <>
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ fontWeight: "bold" }}
        >
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
                "&.Mui-selected": {
                  bgcolor: isDarkMode
                    ? "rgba(66, 165, 245, 0.15)"
                    : "rgba(25, 118, 210, 0.15)",
                },
                "&:hover": {
                  bgcolor: isDarkMode
                    ? "rgba(255, 255, 255, 0.08)"
                    : "rgba(0, 0, 0, 0.04)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color:
                    activeTab === item.text
                      ? isDarkMode
                        ? "primary.main"
                        : "primary.main"
                      : "inherit",
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
            display: "flex",
            alignItems: "center",
            p: 1,
            borderRadius: 1,
            cursor: "pointer",
            "&:hover": {
              bgcolor: isDarkMode
                ? "rgba(255, 255, 255, 0.08)"
                : "rgba(0, 0, 0, 0.04)",
            },
          }}
          onClick={handleUserMenuOpen}
        >
          <Avatar sx={{ width: 32, height: 32, mr: 1.5 }}>
            {/* Removed user avatar logic */}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: "medium" }}>
              {/* Removed user name logic */}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {/* Removed user role logic */}
            </Typography>
          </Box>
          <SettingsIcon fontSize="small" sx={{ color: "text.secondary" }} />
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
        <MenuItem
          onClick={() => {
            localStorage.removeItem("dashboardTourCompleted");
            setShowTour(true);
            handleUserMenuClose();
          }}
        >
          <ListItemIcon>
            <DashboardIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">Reset Tour</Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <Typography variant="body2">Logout</Typography>
        </MenuItem>
      </Menu>
    </>
  );

  return (
    <DataModeProvider>
      <Box sx={{ display: "flex" }}>
        <AppBar
          position="fixed"
          sx={{
            width: { md: `calc(100% - ${drawerWidth}px)` },
            ml: { md: `${drawerWidth}px` },
            bgcolor: "background.paper",
            color: "text.primary",
            boxShadow: 1,
          }}
        >
          <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            {/* Brand Title */}
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                flexGrow: 1,
                display: { xs: "block", lg: "block" },
              }}
            >
              Sales Analytics
            </Typography>
            {/* Theme Toggle */}
            <IconButton
              color="inherit"
              onClick={toggleTheme}
              sx={{
                ml: 1,
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "rotate(180deg)",
                },
              }}
            >
              {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
            {/* User/Profile Icon */}
            <IconButton
              color="inherit"
              onClick={handleUserMenuOpen}
              sx={{ ml: 1 }}
            >
              <PersonIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        {/* Global Control Bar for filters */}
        <Box
          sx={{
            width: { md: `calc(100% - ${drawerWidth}px)` },
            ml: { md: `${drawerWidth}px` },
            position: "fixed",
            top: { xs: 56, sm: 64 },
            zIndex: 1100,
            bgcolor: "background.paper",
            boxShadow: 1,
            borderBottom: 1,
            borderColor: "divider",
            minHeight: 56,
            display: "flex",
            alignItems: "center",
          }}
        >
          <ControlBar />
        </Box>
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
              display: { xs: "block", md: "none" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
              },
            }}
          >
            {drawer}
          </Drawer>
          {/* Desktop drawer */}
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", md: "block" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
                borderRight: (theme) =>
                  `1px solid ${
                    theme.palette.mode === "dark"
                      ? "rgba(255, 255, 255, 0.12)"
                      : "rgba(0, 0, 0, 0.12)"
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
            mt: { xs: "112px", sm: "128px" },
            position: "relative",
          }}
        >
          {children}
          <FloatingActionMenu
            onRefresh={() => window.location.reload()}
            onExport={() => console.log("Export data")}
            onShare={() => console.log("Share dashboard")}
            onSettings={() => console.log("Open settings")}
            onGenerateReport={() => console.log("Generate report")}
          />
          <WelcomeTour open={showTour} onClose={handleTourClose} />
        </Box>
      </Box>
    </DataModeProvider>
  );
};

export default MainLayout;
