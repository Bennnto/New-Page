import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  Tabs,
  Tab,
  Divider,
  Chip,
} from '@mui/material';
import { Save, Refresh, Edit, Preview } from '@mui/icons-material';

interface ContentSection {
  id: string;
  title: string;
  content: string;
  section: string;
}

const ContentEditor: React.FC = () => {
  const [content, setContent] = useState<ContentSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  const contentSections = [
    { section: 'home', label: 'Home Page' },
    { section: 'landing', label: 'Landing/Hero' },
    { section: 'features', label: 'Features' },
    { section: 'pricing', label: 'Pricing' },
    { section: 'about', label: 'About' },
  ];

  useEffect(() => {
    fetchContent();
  }, []);

  const getApiBaseUrl = () => {
    if (process.env.NODE_ENV === 'production') {
      return '';
    }
    return process.env.REACT_APP_API_URL || 'http://localhost:5001';
  };

  const fetchContent = async () => {
    try {
      const API_BASE_URL = getApiBaseUrl();
      const response = await fetch(`${API_BASE_URL}/api/admin/content`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setContent(data.content || []);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      // Set default content if API fails
      setContent([
        {
          id: 'hero-title',
          title: 'Hero Title',
          content: 'Welcome to Undercovered',
          section: 'landing'
        },
        {
          id: 'hero-subtitle',
          title: 'Hero Subtitle',
          content: 'Premium content for exclusive members',
          section: 'landing'
        },
        {
          id: 'hero-description',
          title: 'Hero Description',
          content: 'Access premium media, join our community, and enjoy exclusive content curated just for you.',
          section: 'landing'
        },
        {
          id: 'feature-1-title',
          title: 'Feature 1 - Premium',
          content: 'Premium Quality Content',
          section: 'features'
        },
        {
          id: 'feature-2-title',
          title: 'Feature 2 - Private',
          content: 'Private & Secure',
          section: 'features'
        },
        {
          id: 'feature-3-title',
          title: 'Feature 3 - Secure',
          content: 'Advanced Security',
          section: 'features'
        },
        {
          id: 'feature-4-title',
          title: 'Feature 4 - Community',
          content: 'Exclusive Community',
          section: 'features'
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const saveContent = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const API_BASE_URL = getApiBaseUrl();
      const response = await fetch(`${API_BASE_URL}/api/admin/content`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (response.ok) {
        setSuccess('Content updated successfully! Changes will appear on the website.');
      } else {
        throw new Error('Failed to save content');
      }
    } catch (error) {
      setError('Failed to save content. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateContent = (id: string, newContent: string) => {
    setContent(prev => prev.map(item => 
      item.id === id ? { ...item, content: newContent } : item
    ));
  };

  const getCurrentSectionContent = () => {
    const currentSection = contentSections[activeTab];
    return content.filter(item => item.section === currentSection.section);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Loading content editor...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            <Edit sx={{ mr: 1, verticalAlign: 'middle' }} />
            Content Editor
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Edit website content that appears on your landing page and throughout the site
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchContent}
            disabled={saving}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={saveContent}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
          >
            {contentSections.map((section, index) => (
              <Tab
                key={section.section}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {section.label}
                    <Chip 
                      size="small" 
                      label={content.filter(item => item.section === section.section).length}
                      color="primary"
                    />
                  </Box>
                }
              />
            ))}
          </Tabs>

          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Preview />
              {contentSections[activeTab].label} Content
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Edit the text content that appears in the {contentSections[activeTab].label.toLowerCase()} section of your website.
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              {getCurrentSectionContent().map((item) => (
                <Card variant="outlined" key={item.id}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                      {item.title}
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      value={item.content}
                      onChange={(e) => updateContent(item.id, e.target.value)}
                      placeholder={`Enter ${item.title.toLowerCase()}...`}
                      sx={{ mt: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      ID: {item.id}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>

            {getCurrentSectionContent().length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">
                  No content sections found for {contentSections[activeTab].label}.
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
          💡 How to use the Content Editor:
        </Typography>
        <Typography variant="body2" component="div">
          1. **Select a section** using the tabs above<br/>
          2. **Edit the text** in the fields you want to change<br/>
          3. **Click "Save Changes"** to update your website<br/>
          4. **Changes appear immediately** on your live site after saving
        </Typography>
      </Alert>
    </Container>
  );
};

export default ContentEditor;
