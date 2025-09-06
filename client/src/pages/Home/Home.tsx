import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  useTheme,
} from '@mui/material';
import {
  CloudUpload,
  Payment,
  Announcement,
  Security,
  Speed,
  Group,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Home: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      icon: <CloudUpload sx={{ fontSize: 40 }} />,
      title: 'Media Upload & Management',
      description: 'Upload, organize, and share your images, videos, and documents with ease.',
      color: theme.palette.primary.main,
    },
    {
      icon: <Payment sx={{ fontSize: 40 }} />,
      title: 'Flexible Payment System',
      description: 'Secure payment processing with Stripe integration for subscriptions and one-time payments.',
      color: theme.palette.success.main,
    },
    {
      icon: <Announcement sx={{ fontSize: 40 }} />,
      title: 'Smart Announcements',
      description: 'Stay informed with targeted announcements and important updates.',
      color: theme.palette.info.main,
    },
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: 'Secure & Private',
      description: 'Advanced security features with customizable privacy controls for your content.',
      color: theme.palette.warning.main,
    },
    {
      icon: <Speed sx={{ fontSize: 40 }} />,
      title: 'High Performance',
      description: 'Fast uploads, quick access, and optimized media delivery for the best experience.',
      color: theme.palette.secondary.main,
    },
    {
      icon: <Group sx={{ fontSize: 40 }} />,
      title: 'Community Features',
      description: 'Connect with other users, like and comment on media, and build your network.',
      color: theme.palette.error.main,
    },
  ];

  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Box 
        textAlign="center" 
        py={8}
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main}20 0%, ${theme.palette.secondary.main}20 100%)`,
          borderRadius: 4,
          mb: 8,
        }}
      >
        <Typography 
          variant="h2" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 800,
            background: 'linear-gradient(45deg, #4f46e5 30%, #f59e0b 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 3,
          }}
        >
          Welcome to Page Project
        </Typography>
        <Typography 
          variant="h5" 
          color="text.secondary" 
          paragraph
          sx={{ maxWidth: '600px', mx: 'auto', mb: 4 }}
        >
          The complete solution for media management, payments, and user engagement. 
          Upload, share, and monetize your content with powerful tools.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          {user ? (
            <>
              <Button 
                variant="contained" 
                size="large"
                onClick={() => navigate('/dashboard')}
                sx={{ px: 4, py: 1.5, borderRadius: 3 }}
              >
                Go to Dashboard
              </Button>
              <Button 
                variant="outlined" 
                size="large"
                onClick={() => navigate('/upload')}
                sx={{ px: 4, py: 1.5, borderRadius: 3 }}
              >
                Upload Media
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="contained" 
                size="large"
                onClick={() => navigate('/register')}
                sx={{ px: 4, py: 1.5, borderRadius: 3 }}
              >
                Get Started Free
              </Button>
              <Button 
                variant="outlined" 
                size="large"
                onClick={() => navigate('/login')}
                sx={{ px: 4, py: 1.5, borderRadius: 3 }}
              >
                Sign In
              </Button>
            </>
          )}
        </Box>
      </Box>

      {/* Features Section */}
      <Box mb={8}>
        <Typography 
          variant="h3" 
          component="h2" 
          textAlign="center" 
          gutterBottom
          sx={{ fontWeight: 700, mb: 6 }}
        >
          Powerful Features
        </Typography>
        
        
          {features.map((feature, index) => (
            
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
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box 
                    sx={{ 
                      color: feature.color,
                      mb: 2,
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography 
                    variant="h6" 
                    component="h3" 
                    gutterBottom
                    textAlign="center"
                    sx={{ fontWeight: 600 }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    textAlign="center"
                    sx={{ lineHeight: 1.6 }}
                  >
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            
          ))}
        
      </Box>

      {/* Pricing Section */}
      <Box mb={8}>
        <Typography 
          variant="h3" 
          component="h2" 
          textAlign="center" 
          gutterBottom
          sx={{ fontWeight: 700, mb: 6 }}
        >
          Simple Pricing
        </Typography>
        
        
          {[
            {
              plan: 'Free',
              price: '$0',
              features: ['10 Media Uploads', '100MB Storage', 'Basic Support', '5MB Upload Size'],
              popular: false,
            },
            {
              plan: 'Premium',
              price: '$19.99',
              features: ['1,000 Media Uploads', '10GB Storage', 'Priority Support', '100MB Upload Size', 'Analytics'],
              popular: true,
            },
            {
              plan: 'Enterprise',
              price: '$49.99',
              features: ['Unlimited Uploads', 'Unlimited Storage', '24/7 Support', '500MB Upload Size', 'API Access'],
              popular: false,
            },
          ].map((tier, index) => (
            
              <Card 
                sx={{ 
                  position: 'relative',
                  height: '100%',
                  border: tier.popular ? 2 : 1,
                  borderColor: tier.popular ? 'primary.main' : 'divider',
                }}
              >
                {tier.popular && (
                  <Chip 
                    label="Most Popular" 
                    color="primary" 
                    sx={{ 
                      position: 'absolute',
                      top: -12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                    }}
                  />
                )}
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                    {tier.plan}
                  </Typography>
                  <Typography variant="h3" color="primary" gutterBottom sx={{ fontWeight: 700 }}>
                    {tier.price}
                    <Typography component="span" variant="body1" color="text.secondary">
                      /month
                    </Typography>
                  </Typography>
                  <Box mt={3}>
                    {tier.features.map((feature, featureIndex) => (
                      <Typography 
                        key={featureIndex} 
                        variant="body2" 
                        sx={{ mb: 1 }}
                      >
                        ✓ {feature}
                      </Typography>
                    ))}
                  </Box>
                </CardContent>
                <CardActions sx={{ p: 3, pt: 0 }}>
                  <Button 
                    fullWidth 
                    variant={tier.popular ? 'contained' : 'outlined'}
                    size="large"
                    onClick={() => navigate(user ? '/subscription' : '/register')}
                  >
                    {tier.plan === 'Free' ? 'Get Started' : 'Subscribe'}
                  </Button>
                </CardActions>
              </Card>
            
          ))}
        
      </Box>
    </Container>
  );
};

export default Home;
