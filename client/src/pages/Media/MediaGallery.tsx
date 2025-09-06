import React, { useState } from 'react';
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Avatar,
  IconButton,
  Pagination,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  Visibility,
  Share,
  Search,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const MediaGallery: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);

  // Mock data - in real app, this would come from API
  const mediaItems = [
    {
      id: 1,
      title: 'Sunset Over Mountains',
      category: 'image',
      url: '/api/placeholder/400/300',
      thumbnail: '/api/placeholder/400/300',
      owner: { username: 'photographer123', avatar: '' },
      stats: { views: 245, likes: 12 },
      createdAt: '2024-01-15',
      tags: ['landscape', 'sunset', 'mountains']
    },
    {
      id: 2,
      title: 'Product Demo Video',
      category: 'video',
      url: '/api/placeholder/400/300',
      thumbnail: '/api/placeholder/400/300',
      owner: { username: 'creator456', avatar: '' },
      stats: { views: 1024, likes: 67 },
      createdAt: '2024-01-14',
      tags: ['product', 'demo', 'tech']
    },
    // Add more mock items...
  ];

  const handleLike = (mediaId: number) => {
    // Handle like functionality
    console.log('Like media:', mediaId);
  };

  const handleShare = (mediaId: number) => {
    // Handle share functionality
    console.log('Share media:', mediaId);
  };

  return (
    <Box>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          Media Gallery
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Discover and explore amazing content from our community
        </Typography>
      </Box>

      {/* Filters */}
      <Box mb={4}>
        
          
            <TextField
              fullWidth
              placeholder="Search media..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          
          
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                label="Category"
                onChange={(e) => setCategory(e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="image">Images</MenuItem>
                <MenuItem value="video">Videos</MenuItem>
                <MenuItem value="document">Documents</MenuItem>
              </Select>
            </FormControl>
          
          
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="newest">Newest</MenuItem>
                <MenuItem value="oldest">Oldest</MenuItem>
                <MenuItem value="popular">Most Popular</MenuItem>
                <MenuItem value="views">Most Viewed</MenuItem>
              </Select>
            </FormControl>
          
          
            <Button 
              variant="contained" 
              size="large"
              onClick={() => navigate('/upload')}
              sx={{ height: 56 }}
            >
              Upload Media
            </Button>
          
        
      </Box>

      {/* Media Grid */}
      
        {mediaItems.map((item) => (
          
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)',
                },
                cursor: 'pointer',
              }}
              onClick={() => navigate(`/media/${item.id}`)}
            >
              <CardMedia
                component="img"
                height="200"
                image={item.thumbnail}
                alt={item.title}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ flexGrow: 1, p: 2 }}>
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 600,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {item.title}
                </Typography>
                
                {/* Owner Info */}
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar 
                    src={item.owner.avatar} 
                    sx={{ width: 24, height: 24, mr: 1 }}
                  >
                    {item.owner.username[0].toUpperCase()}
                  </Avatar>
                  <Typography variant="body2" color="text.secondary">
                    {item.owner.username}
                  </Typography>
                </Box>

                {/* Tags */}
                <Box mb={2}>
                  {item.tags.slice(0, 2).map((tag) => (
                    <Chip 
                      key={tag} 
                      label={tag} 
                      size="small" 
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </Box>

                {/* Stats and Actions */}
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" gap={2}>
                    <Box display="flex" alignItems="center">
                      <Visibility sx={{ fontSize: 16, mr: 0.5 }} />
                      <Typography variant="caption">
                        {item.stats.views}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center">
                      <Favorite sx={{ fontSize: 16, mr: 0.5 }} />
                      <Typography variant="caption">
                        {item.stats.likes}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box>
                    <IconButton 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(item.id);
                      }}
                    >
                      <FavoriteBorder fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(item.id);
                      }}
                    >
                      <Share fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          
        ))}
      

      {/* Pagination */}
      <Box display="flex" justifyContent="center">
        <Pagination 
          count={10} 
          page={page} 
          onChange={(e, value) => setPage(value)}
          color="primary" 
          size="large"
        />
      </Box>
    </Box>
  );
};

export default MediaGallery;
