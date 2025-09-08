import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Alert,
  Chip,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Divider,
  Skeleton,
} from '@mui/material';
import {
  Add,
  Announcement as AnnouncementIcon,
  AdminPanelSettings,
  Schedule,
  PriorityHigh,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface Announcement {
  _id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  isImportant: boolean;
  isPublic: boolean;
}

const Announcements: React.FC = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    isImportant: false
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      const getApiBaseUrl = () => {
        if (process.env.NODE_ENV === 'production') {
          return '';
        }
        return process.env.REACT_APP_API_URL || 'http://localhost:5001';
      };
      const API_BASE_URL = getApiBaseUrl();

      const response = await fetch(`${API_BASE_URL}/api/announcements`);
      const data = await response.json();
      
      if (data.success) {
        setAnnouncements(data.data.announcements || []);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreateAnnouncement = async () => {
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) {
      alert('Please fill in both title and content');
      return;
    }

    setSubmitting(true);
    try {
      const getApiBaseUrl = () => {
        if (process.env.NODE_ENV === 'production') {
          return '';
        }
        return process.env.REACT_APP_API_URL || 'http://localhost:5001';
      };
      const API_BASE_URL = getApiBaseUrl();

      const response = await fetch(`${API_BASE_URL}/api/announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(newAnnouncement),
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh announcements
        await fetchAnnouncements();
        
        // Reset form
        setNewAnnouncement({
          title: '',
          content: '',
          isImportant: false
        });
        setCreateDialogOpen(false);
        
        alert('Announcement created successfully!');
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error creating announcement:', error);
      alert('Error creating announcement. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
            <AnnouncementIcon sx={{ mr: 2, color: 'primary.main' }} />
            Announcements
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Stay updated with the latest news and updates from the Undercovered team
          </Typography>
        </Box>

        {/* Admin Create Button */}
        {user?.role === 'admin' && (
          <Fab
            color="primary"
            aria-label="create announcement"
            onClick={() => setCreateDialogOpen(true)}
            sx={{ ml: 2 }}
          >
            <Add />
          </Fab>
        )}
      </Box>

      {/* Membership Check */}
      {!user?.subscription?.status || user.subscription.status !== 'active' ? (
        <Alert severity="warning" sx={{ mb: 4 }}>
          <Typography variant="body2">
            <strong>Premium Content:</strong> Announcements are available to active members only. 
            Please ensure your subscription is active to view all announcements.
          </Typography>
        </Alert>
      ) : null}

      {/* Loading State */}
      {loading ? (
        <Box>
          {[1, 2, 3].map((item) => (
            <Card key={item} sx={{ mb: 3 }}>
              <CardContent>
                <Skeleton variant="text" width="60%" height={32} />
                <Skeleton variant="text" width="40%" height={20} sx={{ mb: 2 }} />
                <Skeleton variant="rectangular" width="100%" height={80} />
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        <>
          {/* No Announcements */}
          {announcements.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <AnnouncementIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No announcements yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.role === 'admin' 
                    ? 'Create your first announcement to keep members informed!'
                    : 'Check back later for updates from the admin team.'
                  }
                </Typography>
              </CardContent>
            </Card>
          ) : (
            /* Announcements List */
            <Box>
              {announcements.map((announcement) => (
                <Card 
                  key={announcement._id} 
                  sx={{ 
                    mb: 3,
                    border: announcement.isImportant ? 2 : 1,
                    borderColor: announcement.isImportant ? 'error.main' : 'divider',
                    position: 'relative'
                  }}
                >
                  {announcement.isImportant && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -1,
                        left: -1,
                        right: -1,
                        height: 4,
                        background: 'linear-gradient(90deg, #f44336, #ff9800)',
                        borderRadius: '4px 4px 0 0',
                      }}
                    />
                  )}
                  
                  <CardContent sx={{ p: 4 }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="h5" sx={{ fontWeight: 600, mr: 2 }}>
                            {announcement.title}
                          </Typography>
                          {announcement.isImportant && (
                            <Chip
                              icon={<PriorityHigh />}
                              label="Important"
                              color="error"
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                          <AdminPanelSettings sx={{ fontSize: 16, mr: 1 }} />
                          <Typography variant="body2" sx={{ mr: 2 }}>
                            {announcement.author}
                          </Typography>
                          <Schedule sx={{ fontSize: 16, mr: 1 }} />
                          <Typography variant="body2">
                            {formatDate(announcement.createdAt)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Content */}
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        lineHeight: 1.8,
                        whiteSpace: 'pre-wrap',
                        color: 'text.primary'
                      }}
                    >
                      {announcement.content}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </>
      )}

      {/* Create Announcement Dialog */}
      <Dialog 
        open={createDialogOpen} 
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Create New Announcement
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <TextField
            fullWidth
            label="Announcement Title"
            value={newAnnouncement.title}
            onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
            margin="normal"
            placeholder="Enter a clear, descriptive title..."
          />
          
          <TextField
            fullWidth
            label="Announcement Content"
            value={newAnnouncement.content}
            onChange={(e) => setNewAnnouncement(prev => ({ ...prev, content: e.target.value }))}
            margin="normal"
            multiline
            rows={6}
            placeholder="Write your announcement content here..."
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={newAnnouncement.isImportant}
                onChange={(e) => setNewAnnouncement(prev => ({ ...prev, isImportant: e.target.checked }))}
                color="error"
              />
            }
            label="Mark as Important"
            sx={{ mt: 2 }}
          />
          
          {newAnnouncement.isImportant && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Important announcements will be highlighted and shown at the top of the list.
            </Alert>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setCreateDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleCreateAnnouncement}
            disabled={submitting || !newAnnouncement.title.trim() || !newAnnouncement.content.trim()}
          >
            {submitting ? 'Creating...' : 'Create Announcement'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Announcements;