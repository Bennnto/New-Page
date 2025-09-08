import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardMedia,
  CardContent,
  Chip,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Skeleton,
} from '@mui/material';
import {
  Search,
  FilterList,
  PlayArrow,
  Download,
  Favorite,
  FavoriteBorder,
  Share,
  Close,
  Category,
  Refresh,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface MediaItem {
  id: string;
  title: string;
  description: string;
  type: 'image' | 'video' | 'audio' | 'document';
  thumbnail: string;
  url: string;
  category: string;
  uploadedBy: string;
  uploadedAt: string;
  likes: number;
  isLiked: boolean;
  tags: string[];
  duration?: string;
  size: string;
  quality: 'HD' | '4K' | 'Standard';
}

const MediaLibrary: React.FC = () => {
  const { user } = useAuth();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Content protection measures
  React.useEffect(() => {
    // Disable screenshot keys and dev tools
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+S, PrintScreen
      if (
        e.key === 'F12' ||
        e.key === 'PrintScreen' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S'))
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // Disable right-click globally on this component
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Disable text selection and drag
    const handleSelectStart = (e: Event) => {
      e.preventDefault();
      return false;
    };

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('selectstart', handleSelectStart);
w
    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('selectstart', handleSelectStart);
    };
  }, [dialogOpen]); // Re-apply when dialog opens/closes

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 
        (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5001');
      
      const response = await fetch(`${API_BASE_URL}/api/media`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📁 Fetched media:', data);
        setMediaItems(data.media || []);
      } else {
        console.error('Failed to fetch media');
        // Fallback to mock data
        const mockData: MediaItem[] = [
          {
            id: '1',
            title: 'Exclusive Behind the Scenes',
            description: 'Go behind the scenes with exclusive content only available to our premium members.',
            type: 'video',
            thumbnail: '/api/placeholder/400/225',
            url: '/api/media/video/1',
            category: 'Exclusive',
            uploadedBy: 'Admin',
            uploadedAt: '2024-01-15',
            likes: 127,
            isLiked: false,
            tags: ['exclusive', 'behind-scenes', 'premium'],
            duration: '15:30',
            size: '850 MB',
            quality: '4K',
          },
        ];
        setMediaItems(mockData);
      }
    } catch (error) {
      console.error('Error fetching media:', error);
      setMediaItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch media on component mount
  useEffect(() => {
    fetchMedia();
  }, []);

  const categories = ['all', 'Exclusive', 'Photography', 'Audio', 'Resources'];

  const filteredItems = mediaItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleLike = (id: string) => {
    setMediaItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, isLiked: !item.isLiked, likes: item.isLiked ? item.likes - 1 : item.likes + 1 }
        : item
    ));
  };

  const handleMediaClick = (media: MediaItem) => {
    setSelectedMedia(media);
    setDialogOpen(true);
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'video': return '🎥';
      case 'image': return '📸';
      case 'audio': return '🎵';
      case 'document': return '📄';
      default: return '📁';
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case '4K': return 'success';
      case 'HD': return 'primary';
      default: return 'default';
    }
  };

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Please log in to access the media library.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
            Media Library
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchMedia}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Exclusive content curated by our admin team, available only to subscribers.
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Box mb={4}>
        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search media..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1 }}
          />
          
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              label="Category"
              onChange={(e) => setSelectedCategory(e.target.value)}
              startAdornment={
                <InputAdornment position="start">
                  <Category />
                </InputAdornment>
              }
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterList />
          <Typography variant="body2" color="text.secondary">
            {filteredItems.length} item(s) found
          </Typography>
        </Box>
      </Box>

      {/* Media Grid */}
      {loading ? (
        <Box 
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 3 
          }}
        >
          {[...Array(6)].map((_, index) => (
            <Card key={index}>
              <Skeleton variant="rectangular" height={200} />
              <CardContent>
                <Skeleton variant="text" sx={{ fontSize: '1.2rem' }} />
                <Skeleton variant="text" />
                <Skeleton variant="text" width="60%" />
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        <Box 
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 3 
          }}
        >
          {filteredItems.map((item) => (
            <Card 
              key={item.id}
              sx={{ 
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 8,
                }
              }}
              onClick={() => handleMediaClick(item)}
            >
              <Box sx={{ position: 'relative' }}>
                <CardMedia
                  component="div"
                  sx={{
                    height: 200,
                    background: 'linear-gradient(45deg, #4f46e5 30%, #f59e0b 90%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '4rem',
                    position: 'relative',
                  }}
                >
                  {getMediaIcon(item.type)}
                  
                  {/* Play overlay for videos */}
                  {item.type === 'video' && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        borderRadius: '50%',
                        width: 64,
                        height: 64,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '2rem',
                      }}
                    >
                      <PlayArrow />
                    </Box>
                  )}
                </CardMedia>
                
                <Chip
                  label={item.quality}
                  color={getQualityColor(item.quality) as any}
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    fontWeight: 600,
                  }}
                />
                
                {item.type === 'video' && item.duration && (
                  <Chip
                    label={item.duration}
                    size="small"
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      bgcolor: 'rgba(0,0,0,0.7)',
                      color: 'white',
                    }}
                  />
                )}
              </Box>
              
              <CardContent>
                <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                  {item.title}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {item.description}
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                  {item.tags.slice(0, 3).map((tag) => (
                    <Chip key={tag} label={tag} size="small" variant="outlined" />
                  ))}
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: '0.8rem' }}>
                      A
                    </Avatar>
                    <Typography variant="caption" color="text.secondary">
                      {item.uploadedBy}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(item.id);
                      }}
                      color={item.isLiked ? 'error' : 'default'}
                    >
                      {item.isLiked ? <Favorite /> : <FavoriteBorder />}
                    </IconButton>
                    <Typography variant="caption">
                      {item.likes}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {filteredItems.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" gutterBottom color="text.secondary">
            No media found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Try adjusting your search terms or filters.
          </Typography>
        </Box>
      )}

      {/* Media Detail Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedMedia && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600 }}>
              {selectedMedia.title}
              <IconButton onClick={() => setDialogOpen(false)}>
                <Close />
              </IconButton>
            </DialogTitle>
            
            <DialogContent>
              <Box sx={{ mb: 3 }}>
                {selectedMedia.type === 'video' ? (
                  <Box
                    sx={{
                      height: 300,
                      borderRadius: 2,
                      mb: 3,
                      backgroundColor: '#000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      MozUserSelect: 'none',
                      msUserSelect: 'none',
                      WebkitTouchCallout: 'none',
                      WebkitUserDrag: 'none',
                      KhtmlUserDrag: 'none',
                      MozUserDrag: 'none',
                      OUserDrag: 'none',
                      userDrag: 'none',
                      '&::before': {
                        content: '"UNDERCOVERED PREMIUM"',
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        color: 'rgba(255,255,255,0.6)',
                        padding: '4px 8px',
                        borderRadius: 1,
                        fontSize: '12px',
                        zIndex: 10,
                        pointerEvents: 'none',
                        userSelect: 'none',
                      },
                      '&::after': {
                        content: '"🔒"',
                        position: 'absolute',
                        bottom: '10px',
                        left: '10px',
                        color: 'rgba(255,255,255,0.4)',
                        fontSize: '16px',
                        zIndex: 10,
                        pointerEvents: 'none',
                        userSelect: 'none',
                      }
                    }}
                  >
                    <video
                      controls
                      controlsList="nodownload nofullscreen noremoteplayback"
                      disablePictureInPicture
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        userSelect: 'none',
                        pointerEvents: 'auto',
                      }}
                      poster="/api/placeholder/400/225"
                      onContextMenu={(e) => e.preventDefault()} // Disable right-click
                      onError={(e) => {
                        console.error('Video failed to load:', selectedMedia.url);
                        // Show error message
                        e.currentTarget.style.display = 'none';
                        const errorDiv = document.createElement('div');
                        errorDiv.innerHTML = `
                          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #666;">
                            <div style="font-size: 4rem; margin-bottom: 16px;">🎬</div>
                            <div style="font-size: 18px; margin-bottom: 8px;">Video not available</div>
                            <div style="font-size: 14px; opacity: 0.7;">This video is currently being processed or the file is missing</div>
                          </div>
                        `;
                        e.currentTarget.parentElement!.appendChild(errorDiv);
                      }}
                    >
                      <source src={selectedMedia.url} type="video/mp4" />
                      <source src={selectedMedia.url} type="video/webm" />
                      <source src={selectedMedia.url} type="video/mov" />
                      Your browser does not support the video tag.
                    </video>
                  </Box>
                ) : selectedMedia.type === 'audio' ? (
                  <Box
                    sx={{
                      height: 200,
                      background: 'linear-gradient(45deg, #4f46e5 30%, #f59e0b 90%)',
                      borderRadius: 2,
                      mb: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      gap: 2,
                    }}
                  >
                    <Box sx={{ fontSize: '4rem' }}>{getMediaIcon(selectedMedia.type)}</Box>
                    <audio controls style={{ width: '80%' }}>
                      <source src={selectedMedia.url} type="audio/mp3" />
                      <source src={selectedMedia.url} type="audio/wav" />
                      <source src={selectedMedia.url} type="audio/ogg" />
                      Your browser does not support the audio tag.
                    </audio>
                  </Box>
                ) : selectedMedia.type === 'image' ? (
                  <Box
                    sx={{
                      height: 300,
                      borderRadius: 2,
                      mb: 3,
                      backgroundColor: '#f5f5f5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    <img
                      src={selectedMedia.url}
                      alt={selectedMedia.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                      }}
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = `
                          <div style="font-size: 4rem; color: #666;">📸</div>
                          <div style="color: #666; margin-top: 8px;">Image not available</div>
                        `;
                      }}
                    />
                  </Box>
                ) : (
                  <Box
                    sx={{
                      height: 300,
                      background: 'linear-gradient(45deg, #4f46e5 30%, #f59e0b 90%)',
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '6rem',
                      mb: 3,
                    }}
                  >
                    {getMediaIcon(selectedMedia.type)}
                  </Box>
                )}
                
                <Typography variant="body1" paragraph>
                  {selectedMedia.description}
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {selectedMedia.tags.map((tag) => (
                    <Chip key={tag} label={tag} size="small" />
                  ))}
                </Box>
                
                <Typography variant="body2" color="text.secondary">
                  Category: {selectedMedia.category} • Size: {selectedMedia.size} • Quality: {selectedMedia.quality}
                </Typography>
                
                <Typography variant="body2" color="text.secondary">
                  Uploaded by {selectedMedia.uploadedBy} on {new Date(selectedMedia.uploadedAt).toLocaleDateString()}
                </Typography>
              </Box>
            </DialogContent>
            
            <DialogActions sx={{ p: 3, pt: 0 }}>
              <Button
                variant="outlined"
                onClick={() => setDialogOpen(false)}
              >
                Close
              </Button>
              
              {/* Only show view button for non-video content */}
              {selectedMedia.type !== 'video' && (
                <Button
                  variant="contained"
                  startIcon={<PlayArrow />}
                  onClick={() => {/* Handle play/view */}}
                >
                  {selectedMedia.type === 'audio' ? 'Play' : 'View'}
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default MediaLibrary;
