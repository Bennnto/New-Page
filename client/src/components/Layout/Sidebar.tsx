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
  LibraryBooks,
  Chat,
  Announcement,
  Person,
  CreditCard,
  AdminPanelSettings,
  CloudUpload,
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
    return location.pathname === path || 
           (path === '/media' && location.pathname.startsWith('/media'));
  };

  const publicMenuItems = [
    { text: 'Home', icon: <Home />, path: '/' },
  ];

  const memberMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Media Library', icon: <LibraryBooks />, path: '/media' },
    { text: 'Community Chat', icon: <Chat />, path: '/chat' },
    { text: 'Announcements', icon: <Announcement />, path: '/announcements' },
  ];

  const adminMenuItems = [
    { text: 'Admin Panel', icon: <AdminPanelSettings />, path: '/admin' },
    { text: 'Upload Content', icon: <CloudUpload />, path: '/upload' },
    { text: 'Manage Members', icon: <Person />, path: '/admin/members' },
  ];

  const accountMenuItems = [
    { text: 'Profile', icon: <Person />, path: '/profile' },
    { text: 'Subscription', icon: <CreditCard />, path: '/subscription' },
  ];

  const renderMenuItems = (items: Array<{text: string, icon: React.ReactNode, path: string}>, showDivider = true) => (
    <>
      {items.map((item) => (
        <ListItem key={item.path} disablePadding>
          <ListItemButton
            onClick={() => handleNavigation(item.path)}
            selected={isActive(item.path)}
            sx={{
              borderRadius: 2,
              mx: 1,
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
                '& .MuiListItemIcon-root': {
                  color: 'inherit',
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text}
              primaryTypographyProps={{
                fontWeight: isActive(item.path) ? 600 : 400,
              }}
            />
          </ListItemButton>
        </ListItem>
      ))}
      {showDivider && <Divider sx={{ my: 2 }} />}
    </>
  );

  return (
    <Box sx={{ width: 280, height: '100%', bgcolor: 'background.paper' }}>
      {/* Logo/Brand */}
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 800,
            background: 'linear-gradient(45deg, #4f46e5 30%, #f59e0b 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          UNDERCOVERED
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Premium Media Platform
        </Typography>
      </Box>

      <Divider />

      <List sx={{ px: 2, py: 2 }}>
        {/* Public Navigation */}
        {!user && renderMenuItems(publicMenuItems)}

        {/* Member Navigation */}
        {user && (
          <>
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600 }}>
                Member Area
              </Typography>
            </Box>
            {renderMenuItems(memberMenuItems)}
          </>
        )}

        {/* Admin Navigation */}
        {user && user.role === 'admin' && (
          <>
            <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600 }}>
                Admin Tools
              </Typography>
              <Chip label="Admin" size="small" color="error" />
            </Box>
            {renderMenuItems(adminMenuItems)}
          </>
        )}

        {/* Account Navigation */}
        {user && (
          <>
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600 }}>
                Account
              </Typography>
            </Box>
            {renderMenuItems(accountMenuItems, false)}
          </>
        )}
      </List>

      {/* User Info */}
      {user && (
        <Box sx={{ mt: 'auto', p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box 
              sx={{ 
                width: 40, 
                height: 40, 
                borderRadius: '50%', 
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'primary.contrastText',
                fontWeight: 600,
              }}
            >
              {user.firstName?.[0] || user.username?.[0] || 'U'}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
                {user.firstName ? `${user.firstName} ${user.lastName}` : user.username}
              </Typography>
              <Chip 
                label={user.subscription?.plan || 'Free'}
                size="small"
                color={
                  user.subscription?.plan === 'Annual' ? 'success' :
                  user.subscription?.plan === 'Quarterly' ? 'secondary' :
                  user.subscription?.plan === 'Monthly' ? 'primary' : 'default'
                }
                sx={{ fontSize: '0.7rem', height: 20 }}
              />
            </Box>
          </Box>
          
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
            Welcome to Undercovered
          </Typography>
        </Box>
      )}

      {/* Call to Action for Non-Users */}
      {!user && (
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Box 
            sx={{ 
              p: 2, 
              borderRadius: 2, 
              background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%)',
              border: 1,
              borderColor: 'primary.main',
              textAlign: 'center'
            }}
          >
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              Join Undercovered
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              Access premium content and exclusive community
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <ListItemButton 
                onClick={() => handleNavigation('/register')}
                sx={{ 
                  bgcolor: 'primary.main', 
                  color: 'primary.contrastText',
                  borderRadius: 1,
                  py: 1,
                  '&:hover': { bgcolor: 'primary.dark' }
                }}
              >
                <ListItemText 
                  primary="Subscribe Now" 
                  primaryTypographyProps={{ 
                    textAlign: 'center', 
                    fontWeight: 600,
                    fontSize: '0.875rem'
                  }}
                />
              </ListItemButton>
              
              <ListItemButton 
                onClick={() => handleNavigation('/login')}
                sx={{ 
                  border: 1,
                  borderColor: 'primary.main',
                  borderRadius: 1,
                  py: 1,
                }}
              >
                <ListItemText 
                  primary="Member Login" 
                  primaryTypographyProps={{ 
                    textAlign: 'center',
                    fontSize: '0.875rem'
                  }}
                />
              </ListItemButton>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Sidebar;