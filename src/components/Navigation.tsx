'use client';

import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  useTheme,
  useMediaQuery,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  ChecklistRtl,
  Assessment,
  BarChart,
  Menu as MenuIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useChecklistStore } from '../store/checklist-store';
import { useEvaluationStore } from '../store/evaluation-store';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);
  const [isInitialMount, setIsInitialMount] = useState(true);
  const open = Boolean(anchorEl);

  // Get loading states from stores
  const { loadingChecklists, loading } = useChecklistStore();
  const { loadingProjeFirmalari, loadingKonular, loadingDegerlendirmeler } =
    useEvaluationStore();

  // Check if any API is loading
  const isAnyApiLoading =
    loadingChecklists ||
    loading ||
    loadingProjeFirmalari ||
    loadingKonular ||
    loadingDegerlendirmeler;

  const navItems = [
    {
      label: 'Checklist',
      path: '/',
      icon: <ChecklistRtl />,
    },
    {
      label: 'Mekanik Değerlendirme',
      path: '/evaluation',
      icon: <Assessment />,
    },
    {
      label: 'Değerlendirme Raporları',
      path: '/reports',
      icon: <BarChart />,
    },
  ];

  // Check if current path matches the nav item
  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  // Initialize on mount
  useEffect(() => {
    setIsInitialMount(false);
  }, []);

  // Track pathname changes for loading state
  useEffect(() => {
    if (pathname !== prevPathname) {
      setPrevPathname(pathname);
      // Stop navigation animation when pathname changes
      // Add a small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setIsNavigating(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [pathname, prevPathname]);

  // Stop navigation animation when APIs finish loading
  useEffect(() => {
    // Don't run on initial mount
    if (isInitialMount) return;

    // If APIs are done loading and we're still showing navigation animation, stop it
    if (!isAnyApiLoading && isNavigating) {
      const timer = setTimeout(() => {
        setIsNavigating(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isNavigating, isAnyApiLoading, isInitialMount]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (path: string) => {
    if (path !== pathname) {
      setIsNavigating(true);
    }
    router.push(path);
    handleMenuClose();
  };

  const handleLinkClick = (path: string) => {
    if (path !== pathname) {
      setIsNavigating(true);
      // Navigation will be handled by Link component
    }
  };

  return (
    <AppBar position="static" elevation={1}>
      <Toolbar>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            mr: 2,
          }}
        >
          <ChecklistRtl
            sx={{
              mr: 2,
              animation: isNavigating ? 'spin 1s linear infinite' : 'none',
              '@keyframes spin': {
                '0%': {
                  transform: 'rotate(0deg)',
                },
                '100%': {
                  transform: 'rotate(360deg)',
                },
              },
              transition: 'opacity 0.3s ease',
              opacity: isNavigating ? 0.7 : 1,
            }}
          />
        </Box>
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: { xs: 1, md: 0 },
            mr: { xs: 1, md: 4 },
            fontWeight: 'bold',
          }}
        >
          Checklist Uygulaması
        </Typography>
        {isMobile ? (
          <>
            <Box sx={{ flexGrow: 1 }} />
            <IconButton
              color="inherit"
              onClick={handleMenuOpen}
              aria-label="menu"
              aria-controls={open ? 'navigation-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="navigation-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  minWidth: 250,
                },
              }}
            >
              {navItems.map((item) => (
                <MenuItem
                  key={item.path}
                  onClick={() => handleMenuItemClick(item.path)}
                  selected={isActive(item.path)}
                  sx={{
                    backgroundColor: isActive(item.path)
                      ? 'action.selected'
                      : 'transparent',
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.label} />
                </MenuItem>
              ))}
            </Menu>
          </>
        ) : (
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              flexGrow: 1,
              justifyContent: 'flex-end',
            }}
          >
            {navItems.map((item) => (
              <Button
                key={item.path}
                component={Link}
                href={item.path}
                startIcon={item.icon}
                color="inherit"
                variant={isActive(item.path) ? 'contained' : 'text'}
                onClick={() => handleLinkClick(item.path)}
                sx={{
                  backgroundColor: isActive(item.path)
                    ? 'rgba(255, 255, 255, 0.2)'
                    : 'transparent',
                  '&:hover': {
                    backgroundColor: isActive(item.path)
                      ? 'rgba(255, 255, 255, 0.3)'
                      : 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
