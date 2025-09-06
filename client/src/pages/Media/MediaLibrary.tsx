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

  // Mock data - in real app, this would come from API
  useEffect(() => {
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
      {
        id: '2',
        title: 'Premium Photo Collection',
        description: 'High-quality photography collection curated by our team.',
        type: 'image',
        thumbnail: '/api/placeholder/400/300',
        url: '/api/media/image/2',
        category: 'Photography',
        uploadedBy: 'Admin',
        uploadedAt: '2024-01-14',
        likes: 89,
        isLiked: true,
        tags: ['photography', 'collection', 'premium'],
        size: '12.5 MB',
        quality: '4K',
      },
      {
        id: '3',
        title: 'Exclusive Audio Content',
        description: 'Premium audio content available only to subscribers.',
        type: 'audio',
        thumbnail: '/api/placeholder/400/400',
        url: '/api/media/audio/3',
        category: 'Audio',
        uploadedBy: 'Admin',
        uploadedAt: '2024-01-13',
        likes: 56,
        isLiked: false,
        tags: ['audio', 'exclusive', 'music'],
        duration: '45:20',
        size: '128 MB',
        quality: 'HD',
      },
      {
        id: '4',
        title: 'Member Resources',
        description: 'Important documents and resources for our community members.',
        type: 'document',
        thumbnail: '/api/placeholder/400/300',
        url: '/api/media/document/4',
        category: 'Resources',
        uploadedBy: 'Admin',
        uploadedAt: '2024-01-12',
        likes: 34,
        isLiked: false,
        tags: ['resources', 'documents', 'community'],
        size: '5.2 MB',
        quality: 'HD',
      },
    ];

    setTimeout(() => {
      setMediaItems(mockData);
      setLoading(false);
    }, 1000);
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
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Media Library
        </Typography>
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
                  }}
                >
                  {getMediaIcon(item.type)}
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
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {selectedMedia.title}
              </Typography>
              <IconButton onClick={() => setDialogOpen(false)}>
                <Close />
              </IconButton>
            </DialogTitle>
            
            <DialogContent>
              <Box sx={{ mb: 3 }}>
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
                startIcon={<Share />}
                onClick={() => {/* Handle share */}}
              >
                Share
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={() => {/* Handle download */}}
              >
                Download
              </Button>
              
              <Button
                variant="contained"
                startIcon={<PlayArrow />}
                onClick={() => {/* Handle play/view */}}
              >
                {selectedMedia.type === 'video' || selectedMedia.type === 'audio' ? 'Play' : 'View'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default MediaLibrary;
