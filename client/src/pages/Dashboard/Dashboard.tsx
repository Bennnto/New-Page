import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@mui/material';
import {
  CloudUpload,
  Visibility,
  Favorite,
  Payment,
  TrendingUp,
  Add,
  MoreVert,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Mock data - in real app, this would come from API
  const stats = {
    mediaUploaded: 45,
    totalViews: 1247,
    totalLikes: 89,
    storageUsed: 2.3, // GB
    storageLimit: 10, // GB
  };

  const recentMedia = [
    { id: 1, title: 'Sunset Photography', type: 'image', views: 23, createdAt: '2 days ago' },
    { id: 2, title: 'Product Demo Video', type: 'video', views: 156, createdAt: '1 week ago' },
    { id: 3, title: 'Design Mockups', type: 'image', views: 67, createdAt: '1 week ago' },
  ];

  const storagePercentage = (stats.storageUsed / stats.storageLimit) * 100;

  if (!user) return null;

  return (
    <Box>
      {/* Welcome Section */}
      <Box mb={4}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          Welcome back, {user.firstName}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your account today.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' },
          gap: 3, 
          mb: 4 
        }}
      >
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="text.secondary" gutterBottom variant="body2">
                  Media Uploaded
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {stats.mediaUploaded}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <CloudUpload />
              </Avatar>
            </Box>
            <Box mt={2}>
              <Typography variant="body2" color="text.secondary">
                <TrendingUp fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                +12% from last month
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="text.secondary" gutterBottom variant="body2">
                  Total Views
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {stats.totalViews.toLocaleString()}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'info.main' }}>
                <Visibility />
              </Avatar>
            </Box>
            <Box mt={2}>
              <Typography variant="body2" color="text.secondary">
                <TrendingUp fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                +8% from last month
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="text.secondary" gutterBottom variant="body2">
                  Total Likes
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {stats.totalLikes}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'error.main' }}>
                <Favorite />
              </Avatar>
            </Box>
            <Box mt={2}>
              <Typography variant="body2" color="text.secondary">
                <TrendingUp fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                +15% from last month
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="text.secondary" gutterBottom variant="body2">
                  Subscription
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {user.subscription?.plan || 'Free'}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'success.main' }}>
                <Payment />
              </Avatar>
            </Box>
            <Box mt={2}>
              <Chip 
                label={user.subscription?.status || 'Active'} 
                color="success" 
                size="small" 
              />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Content Grid */}
      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
          gap: 3 
        }}
      >
        {/* Storage Usage */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Storage Usage
            </Typography>
            <Box mt={3}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">
                  {stats.storageUsed} GB used
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stats.storageLimit} GB total
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={storagePercentage} 
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Typography variant="body2" color="text.secondary" mt={1}>
                {(stats.storageLimit - stats.storageUsed).toFixed(1)} GB remaining
              </Typography>
            </Box>
            
            <Box mt={3}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/subscription')}
              >
                Upgrade Storage
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Recent Media */}
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Recent Media
              </Typography>
              <IconButton size="small">
                <MoreVert />
              </IconButton>
            </Box>
            
            <List disablePadding>
              {recentMedia.map((item, index) => (
                <ListItem key={item.id} divider={index < recentMedia.length - 1}>
                  <ListItemAvatar>
                    <Avatar>
                      {item.type === 'image' ? '📷' : '🎥'}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={item.title}
                    secondary={`${item.views} views • ${item.createdAt}`}
                  />
                  <ListItemSecondaryAction>
                    <Chip 
                      label={item.type} 
                      size="small" 
                      color={item.type === 'image' ? 'primary' : 'secondary'}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
            
            <Button
              variant="text"
              fullWidth
              sx={{ mt: 2 }}
              onClick={() => navigate('/media')}
            >
              View All Media
            </Button>
          </CardContent>
        </Card>
      </Box>

      {/* Quick Actions */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Quick Actions
          </Typography>
          
          <Box 
            sx={{ 
              display: 'flex', 
              gap: 2, 
              flexDirection: { xs: 'column', sm: 'row' },
              mt: 2 
            }}
          >
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/media/upload')}
              sx={{ flex: 1 }}
            >
              Upload Media
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => navigate('/media')}
              sx={{ flex: 1 }}
            >
              Browse Gallery
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => navigate('/profile')}
              sx={{ flex: 1 }}
            >
              Edit Profile
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;