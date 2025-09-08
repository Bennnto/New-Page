import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  LinearProgress,
  Paper,
  IconButton,
  Alert,
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  Person,
  Email,
  CalendarToday,
  Star,
  Settings,
  Security,
  CreditCard,
  Download,
  Visibility,
  CloudUpload,
  TrendingUp,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

interface UserStats {
  mediaUploaded: number;
  totalViews: number;
  joinDate: string;
  subscriptionDays: number;
  favoriteContent: number;
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    username: user?.username || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const getApiBaseUrl = () => {
        if (process.env.NODE_ENV === 'production') {
          return '';
        }
        return process.env.REACT_APP_API_URL || 'http://localhost:5001';
      };
      const API_BASE_URL = getApiBaseUrl();
      
      const response = await fetch(`${API_BASE_URL}/api/user/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      
      if (data.success) {
        setUserStats(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch stats');
      }
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
      // Use mock data if API fails
      setUserStats({
        mediaUploaded: user?.stats?.mediaUploaded || 0,
        totalViews: user?.stats?.totalViews || 0,
        joinDate: typeof user?.stats?.joinDate === 'string' ? user.stats.joinDate : new Date().toISOString(),
        subscriptionDays: 30,
        favoriteContent: 12,
      });
    }
  };

  const handleProfileSave = async () => {
    setLoading(true);
    try {
      await axios.put('/api/user/profile', profileData);
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      await axios.put('/api/user/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setSuccessMessage('Password updated successfully!');
      setShowPasswordDialog(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to update password:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSubscriptionColor = (plan: string) => {
    switch (plan) {
      case 'premium': return 'primary';
      case 'basic': return 'secondary';
      case 'enterprise': return 'success';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Profile & Account
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your account settings and subscription
          </Typography>
        </Box>

        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
          {/* Profile Information */}
          <Box sx={{ flex: { xs: 1, md: 2 } }}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      mr: 3,
                      bgcolor: 'primary.main',
                      fontSize: '2rem'
                    }}
                  >
                    {user?.firstName?.[0]?.toUpperCase()}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {user?.firstName} {user?.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      @{user?.username}
                    </Typography>
                    <Chip 
                      label={`${user?.subscription?.plan?.toUpperCase()} Member`}
                      color={getSubscriptionColor(user?.subscription?.plan || 'free') as any}
                      size="small"
                      icon={<Star />}
                    />
                  </Box>
                  <IconButton 
                    onClick={() => setIsEditing(!isEditing)}
                    color="primary"
                  >
                    <Edit />
                  </IconButton>
                </Box>

                <Divider sx={{ mb: 3 }} />

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    disabled={!isEditing}
                    variant={isEditing ? "outlined" : "filled"}
                  />
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    disabled={!isEditing}
                    variant={isEditing ? "outlined" : "filled"}
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    disabled={!isEditing}
                    variant={isEditing ? "outlined" : "filled"}
                  />
                  <TextField
                    fullWidth
                    label="Username"
                    value={profileData.username}
                    onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                    disabled={!isEditing}
                    variant={isEditing ? "outlined" : "filled"}
                  />
                </Box>

                {isEditing && (
                  <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={handleProfileSave}
                      disabled={loading}
                    >
                      Save Changes
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Cancel />}
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Account Security */}
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Account Security
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Security />
                    </ListItemIcon>
                    <ListItemText
                      primary="Password"
                      secondary="Last changed 30 days ago"
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setShowPasswordDialog(true)}
                    >
                      Change
                    </Button>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Settings />
                    </ListItemIcon>
                    <ListItemText
                      primary="Two-Factor Authentication"
                      secondary="Not enabled"
                    />
                    <Button variant="outlined" size="small">
                      Enable
                    </Button>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Box>

          {/* Sidebar */}
          <Box sx={{ flex: { xs: 1, md: 1 }, minWidth: { md: 300 } }}>
            {/* Subscription Info */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Subscription Status
                </Typography>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Chip 
                    label={user?.subscription?.plan?.toUpperCase() || 'FREE'}
                    color={getSubscriptionColor(user?.subscription?.plan || 'free') as any}
                    size="medium"
                    sx={{ mb: 2 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Status: {user?.subscription?.status || 'Active'}
                  </Typography>
                </Box>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<CreditCard />}
                  href="/subscription"
                >
                  Manage Subscription
                </Button>
              </CardContent>
            </Card>

            {/* User Stats */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Your Activity
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CloudUpload />
                    </ListItemIcon>
                    <ListItemText
                      primary="Content Uploaded"
                      secondary={`${userStats?.mediaUploaded || 0} items`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Visibility />
                    </ListItemIcon>
                    <ListItemText
                      primary="Total Views"
                      secondary={`${userStats?.totalViews || 0} views`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CalendarToday />
                    </ListItemIcon>
                    <ListItemText
                      primary="Member Since"
                      secondary={formatDate(userStats?.joinDate || (typeof user?.stats?.joinDate === 'string' ? user.stats.joinDate : new Date().toISOString()))}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <TrendingUp />
                    </ListItemIcon>
                    <ListItemText
                      primary="Engagement"
                      secondary="High Activity"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button variant="outlined" startIcon={<Download />} fullWidth>
                    Export Data
                  </Button>
                  <Button variant="outlined" startIcon={<Settings />} fullWidth>
                    Privacy Settings
                  </Button>
                  {user?.role === 'admin' && (
                    <Button variant="contained" color="secondary" fullWidth href="/admin">
                      Admin Panel
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Password Change Dialog */}
        <Dialog 
          open={showPasswordDialog} 
          onClose={() => setShowPasswordDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Change Password</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                type="password"
                label="Current Password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                type="password"
                label="New Password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                type="password"
                label="Confirm New Password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowPasswordDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handlePasswordChange}
              disabled={loading}
            >
              Change Password
            </Button>
          </DialogActions>
        </Dialog>
    </Box>
    </Container>
  );
};

export default Profile;