import React from 'react';
import {
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Box,
  useTheme,
  Chip,
  Avatar,
} from '@mui/material';
import {
  PlayArrow,
  Security,
  Chat,
  AdminPanelSettings,
  Star,
  LibraryBooks,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const features = [
    {
      icon: <LibraryBooks sx={{ fontSize: 40 }} />,
      title: 'Premium Media Library',
      description: 'Access exclusive content curated by our admin team. High-quality media available only to subscribers.',
      color: 'primary.main',
    },
    {
      icon: <Chat sx={{ fontSize: 40 }} />,
      title: 'Community Chat Room',
      description: 'Connect with other members in our exclusive chat room. Share thoughts and engage with the community.',
      color: 'secondary.main',
    },
    {
      icon: <AdminPanelSettings sx={{ fontSize: 40 }} />,
      title: 'Admin-Curated Content',
      description: 'All content is carefully selected and uploaded by our admin team to ensure premium quality.',
      color: 'success.main',
    },
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: 'Secure & Private',
      description: 'Your privacy is our priority. Enjoy content in a secure, subscription-only environment.',
      color: 'error.main',
    },
  ];

  const plans = [
    {
      name: 'Monthly',
      price: '$10.99',
      period: '/month',
      features: [
        'Full Media Library Access',
        'Community Chat Room',
        'Admin Announcements',
        'Mobile & Desktop Access',
        'HD & 4K Streaming Quality',
        'Download for Offline',
        'Priority Support',
      ],
      popular: false,
      color: 'primary',
    },
    {
      name: '6-Month',
      price: '$59.99',
      period: '/6 months',
      originalPrice: '$65.94',
      features: [
        'Everything in Monthly',
        'Save $5.95 compared to monthly',
        'Early Access to New Content',
        'VIP Community Status',
        'Direct Admin Contact',
        'Custom Content Requests',
        'Priority Customer Support',
      ],
      popular: true,
      color: 'secondary',
    },
  ];

  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Box
        sx={{
          textAlign: 'center',
          py: { xs: 8, md: 12 },
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
          UNDERCOVERED
        </Typography>
        
        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          sx={{ 
            fontWeight: 400,
            color: 'text.secondary',
            mb: 4,
            maxWidth: 600,
            mx: 'auto'
          }}
        >
          Premium Media Library & Exclusive Community
        </Typography>

        <Typography
          variant="body1"
          sx={{ 
            mb: 6,
            fontSize: '1.2rem',
            color: 'text.secondary',
            maxWidth: 800,
            mx: 'auto'
          }}
        >
          Join our exclusive community and access premium content curated by our admin team. 
          Connect with members in our private chat room and stay updated with exclusive announcements.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<Star />}
            onClick={() => navigate('/register')}
            sx={{
              px: 4,
              py: 2,
              fontSize: '1.1rem',
              fontWeight: 600,
              borderRadius: 3,
              textTransform: 'none',
            }}
          >
            Start Subscription
          </Button>
          
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/login')}
            sx={{
              px: 4,
              py: 2,
              fontSize: '1.1rem',
              fontWeight: 600,
              borderRadius: 3,
              textTransform: 'none',
            }}
          >
            Member Login
          </Button>
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
          Why Choose Undercovered?
        </Typography>
        
        <Box 
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 4 
          }}
        >
          {features.map((feature, index) => (
            <Card 
              key={index}
              sx={{ 
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: theme.shadows[8],
                }
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box display="flex" alignItems="center" mb={3}>
                  <Avatar 
                    sx={{ 
                      bgcolor: feature.color,
                      width: 64,
                      height: 64,
                      mr: 2
                    }}
                  >
                    {feature.icon}
                  </Avatar>
                  <Typography variant="h5" component="h3" sx={{ fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {/* Pricing Section */}
      <Box mb={8}>
        <Typography
          variant="h3"
          component="h2"
          textAlign="center"
          gutterBottom
          sx={{ fontWeight: 700, mb: 2 }}
        >
          Choose Your Subscription
        </Typography>
        
        <Typography
          variant="body1"
          textAlign="center"
          color="text.secondary"
          sx={{ mb: 6, fontSize: '1.1rem' }}
        >
          Select the plan that works best for you. All plans include full access to our premium content.
        </Typography>
        
        <Box 
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 3 
          }}
        >
          {plans.map((plan, index) => (
            <Card 
              key={index}
              sx={{ 
                position: 'relative',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                border: plan.popular ? 2 : 1,
                borderColor: plan.popular ? 'secondary.main' : 'divider',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: theme.shadows[8],
                }
              }}
            >
              {plan.popular && (
                <Chip
                  label="Most Popular"
                  color="secondary"
                  sx={{
                    position: 'absolute',
                    top: -12,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontWeight: 600,
                  }}
                />
              )}
              
              <CardContent sx={{ p: 4, flexGrow: 1 }}>
                <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                  {plan.name}
                </Typography>
                
                <Box mb={3}>
                  <Box display="flex" alignItems="baseline" gap={1}>
                    <Typography variant="h3" component="span" sx={{ fontWeight: 800 }}>
                      {plan.price}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {plan.period}
                    </Typography>
                  </Box>
                  {plan.originalPrice && (
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ textDecoration: 'line-through' }}
                    >
                      Save from {plan.originalPrice}
                    </Typography>
                  )}
                </Box>
                
                <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                  {plan.features.map((feature, featureIndex) => (
                    <Box 
                      component="li" 
                      key={featureIndex}
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        mb: 2
                      }}
                    >
                      <Typography variant="body1">
                        ✓ {feature}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
              
              <CardActions sx={{ p: 4, pt: 0 }}>
                <Button
                  variant={plan.popular ? "contained" : "outlined"}
                  color={plan.color as any}
                  fullWidth
                  size="large"
                  onClick={() => navigate('/register')}
                  sx={{
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: 2,
                    textTransform: 'none',
                  }}
                >
                  Subscribe Now
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          textAlign: 'center',
          py: 8,
          background: `linear-gradient(135deg, ${theme.palette.secondary.main}20 0%, ${theme.palette.primary.main}20 100%)`,
          borderRadius: 4,
          mb: 4,
        }}
      >
        <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
          Ready to Join Undercovered?
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 4, fontSize: '1.1rem', color: 'text.secondary' }}>
          Start your journey with our premium content and exclusive community today.
        </Typography>
        
        <Button
          variant="contained"
          size="large"
          startIcon={<PlayArrow />}
          onClick={() => navigate('/register')}
          sx={{
            px: 6,
            py: 2,
            fontSize: '1.2rem',
            fontWeight: 600,
            borderRadius: 3,
            textTransform: 'none',
          }}
        >
          Get Started Now
        </Button>
      </Box>
    </Container>
  );
};

export default Home;