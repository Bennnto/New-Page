import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  LinearProgress,
  Paper,
} from '@mui/material';
import { CloudUpload, Delete, Image, VideoFile, Description } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../../contexts/AuthContext';

const MediaUpload: React.FC = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    visibility: 'public',
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
    setError('');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.webm', '.mov'],
      'application/pdf': ['.pdf'],
    },
    maxSize: user?.subscription.plan === 'enterprise' ? 500 * 1024 * 1024 : // 500MB
             user?.subscription.plan === 'premium' ? 100 * 1024 * 1024 : // 100MB
             user?.subscription.plan === 'basic' ? 25 * 1024 * 1024 : // 25MB
             5 * 1024 * 1024, // 5MB for free
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (files.length === 0) {
      setError('Please select at least one file to upload');
      return;
    }

    setIsUploading(true);
    setError('');
    setSuccess('');

    try {
      const uploadData = new FormData();
      
      files.forEach((file, index) => {
        uploadData.append('media', file);
        uploadData.append(`title_${index}`, formData.title || file.name);
        uploadData.append(`description_${index}`, formData.description);
        uploadData.append(`tags_${index}`, JSON.stringify(formData.tags));
      });
      
      uploadData.append('visibility', formData.visibility);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // Real API call to upload media
      const API_BASE_URL = process.env.REACT_APP_API_URL || 
        (process.env.NODE_ENV === 'production' ? window.location.origin : 'http://localhost:5001');
      
      const response = await fetch(`${API_BASE_URL}/api/media`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: uploadData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setUploadProgress(100);
      clearInterval(progressInterval);
      
      setSuccess(`Successfully uploaded ${files.length} file(s)! Check the Media Library to see your uploads.`);
      setFiles([]);
      setFormData({
        title: '',
        description: '',
        visibility: 'public',
        tags: [],
      });
      setUploadProgress(0);
      
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image />;
    if (file.type.startsWith('video/')) return <VideoFile />;
    return <Description />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const maxFileSize = user?.subscription.plan === 'enterprise' ? '500MB' :
                      user?.subscription.plan === 'premium' ? '100MB' :
                      user?.subscription.plan === 'basic' ? '25MB' : '5MB';

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
        Upload Media
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Share your images, videos, and documents with the community
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      
        {/* Upload Area */}
        
          <Card>
            <CardContent>
              {/* Drop Zone */}
              <Paper
                {...getRootProps()}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  border: '2px dashed',
                  borderColor: isDragActive ? 'primary.main' : 'divider',
                  backgroundColor: isDragActive ? 'action.hover' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  mb: 3,
                }}
              >
                <input {...getInputProps()} />
                <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                {isDragActive ? (
                  <Typography variant="h6">Drop the files here...</Typography>
                ) : (
                  <>
                    <Typography variant="h6" gutterBottom>
                      Drag & drop files here, or click to select
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Max file size: {maxFileSize} | Supported: Images, Videos, PDFs
                    </Typography>
                  </>
                )}
              </Paper>

              {/* Selected Files */}
              {files.length > 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Selected Files ({files.length})
                  </Typography>
                  {files.map((file, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 2,
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1,
                        mb: 1,
                      }}
                    >
                      {getFileIcon(file)}
                      <Box sx={{ ml: 2, flexGrow: 1 }}>
                        <Typography variant="body1">{file.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatFileSize(file.size)}
                        </Typography>
                      </Box>
                      <Button
                        onClick={() => removeFile(index)}
                        color="error"
                        startIcon={<Delete />}
                      >
                        Remove
                      </Button>
                    </Box>
                  ))}
                </Box>
              )}

              {/* Upload Progress */}
              {isUploading && (
                <Box mt={3}>
                  <Typography variant="body2" gutterBottom>
                    Uploading... {uploadProgress}%
                  </Typography>
                  <LinearProgress variant="determinate" value={uploadProgress} />
                </Box>
              )}
            </CardContent>
          </Card>
        

        {/* Form Fields */}
        
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Media Details
              </Typography>
              
              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  margin="normal"
                  placeholder="Enter a descriptive title"
                />

                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  margin="normal"
                  multiline
                  rows={3}
                  placeholder="Describe your media..."
                />

                <FormControl fullWidth margin="normal">
                  <InputLabel>Visibility</InputLabel>
                  <Select
                    value={formData.visibility}
                    onChange={(e) => setFormData(prev => ({ ...prev, visibility: e.target.value }))}
                    label="Visibility"
                  >
                    <MenuItem value="public">Public</MenuItem>
                    <MenuItem value="unlisted">Unlisted</MenuItem>
                    <MenuItem value="private">Private</MenuItem>
                  </Select>
                </FormControl>

                {/* Tags */}
                <Box mt={2}>
                  <Typography variant="body2" gutterBottom>
                    Tags
                  </Typography>
                  <Box display="flex" gap={1} mb={1}>
                    <TextField
                      size="small"
                      placeholder="Add tag..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      sx={{ flexGrow: 1 }}
                    />
                    <Button onClick={addTag} variant="outlined" size="small">
                      Add
                    </Button>
                  </Box>
                  <Box display="flex" flexWrap="wrap" gap={0.5}>
                    {formData.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        onDelete={() => removeTag(tag)}
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isUploading || files.length === 0}
                  sx={{ mt: 3 }}
                >
                  {isUploading ? 'Uploading...' : `Upload ${files.length} File(s)`}
                </Button>
              </Box>
            </CardContent>
          </Card>
        
      
    </Box>
  );
};

export default MediaUpload;
