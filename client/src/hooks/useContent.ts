import { useState, useEffect } from 'react';

interface ContentItem {
  id: string;
  title: string;
  content: string;
  section: string;
}

export const useContent = () => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

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
      const response = await fetch(`${API_BASE_URL}/api/content`);
      
      if (response.ok) {
        const data = await response.json();
        setContent(data.content || []);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      // Fallback to default content
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
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getContent = (id: string): string => {
    const item = content.find(c => c.id === id);
    return item?.content || '';
  };

  const getContentBySection = (section: string): ContentItem[] => {
    return content.filter(c => c.section === section);
  };

  return {
    content,
    loading,
    getContent,
    getContentBySection,
    refresh: fetchContent
  };
};
