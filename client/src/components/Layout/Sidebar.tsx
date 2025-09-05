import React from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  Chip,
} from '@mui/material';
import {
  Home,
  Dashboard,
  CloudUpload,
  Photo,
  Announcement,
  Person,
  CreditCard,
  Settings,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  onItemClick?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onItemClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const handleNavigation = (path: string) => {
    navigate(path);
    onItemClick?.();
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const publicMenuItems = [
    { text: 'Home', icon: <Home />, path: '/' },
    { text: 'Media Gallery', icon: <Photo />, path: '/media' },
    { text: 'Announcements', icon: <Announcement />, path: '/announcements' },
  ];

  const privateMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Upload Media', icon: <CloudUpload />, path: '/upload' },
    { text: 'My Media', icon: <Photo />, path: '/media?user=me' },
  ];

  const accountMenuItems = [
    { text: 'Profile', icon: <Person />, path: '/profile' },
    { text: 'Subscription', icon: <CreditCard />, path: '/subscription' },
    { text: 'Settings', icon: <Settings />, path: '/settings' },
  ];

  return (
    <Box sx={{ overflow: 'auto', height: '100%' }}>
      {/* Public Navigation */}
      <List>
        {publicMenuItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={isActive(item.path)}
              onClick={() => handleNavigation(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'rgba(79, 70, 229, 0.12)',
                  borderRight: '3px solid',
                  borderRightColor: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'rgba(79, 70, 229, 0.16)',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ color: isActive(item.path) ? 'primary.main' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                sx={{ 
                  '& .MuiListItemText-primary': {
                    color: isActive(item.path) ? 'primary.main' : 'inherit',
                    fontWeight: isActive(item.path) ? 600 : 400,
                  }
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {user && (
        <>
          <Divider sx={{ my: 1 }} />
          
          {/* User Section Header */}
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              MY WORKSPACE
            </Typography>
          </Box>

          <List>
            {privateMenuItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  selected={isActive(item.path)}
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(79, 70, 229, 0.12)',
                      borderRight: '3px solid',
                      borderRightColor: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'rgba(79, 70, 229, 0.16)',
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: isActive(item.path) ? 'primary.main' : 'inherit' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text}
                    sx={{ 
                      '& .MuiListItemText-primary': {
                        color: isActive(item.path) ? 'primary.main' : 'inherit',
                        fontWeight: isActive(item.path) ? 600 : 400,
                      }
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 1 }} />

          {/* Account Section */}
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              ACCOUNT
            </Typography>
          </Box>

          <List>
            {accountMenuItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  selected={isActive(item.path)}
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(79, 70, 229, 0.12)',
                      borderRight: '3px solid',
                      borderRightColor: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'rgba(79, 70, 229, 0.16)',
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: isActive(item.path) ? 'primary.main' : 'inherit' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text}
                    sx={{ 
                      '& .MuiListItemText-primary': {
                        color: isActive(item.path) ? 'primary.main' : 'inherit',
                        fontWeight: isActive(item.path) ? 600 : 400,
                      }
                    }}
                  />
                  {item.path === '/subscription' && user.subscription.plan !== 'free' && (
                    <Chip 
                      label={user.subscription.plan.toUpperCase()} 
                      size="small" 
                      color="primary"
                      variant="outlined"
                    />
                  )}
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          {/* Subscription Status */}
          <Box sx={{ px: 2, py: 2, mt: 'auto' }}>
            <Box sx={{ 
              p: 2, 
              borderRadius: 2, 
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider'
            }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Current Plan
              </Typography>
              <Typography variant="h6" color="primary" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                {user.subscription.plan}
              </Typography>
              {user.subscription.plan === 'free' && (
                <Typography variant="caption" color="text.secondary">
                  Upgrade for more features
                </Typography>
              )}
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};

export default Sidebar;
