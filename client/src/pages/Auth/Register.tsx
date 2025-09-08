import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Button,
  Typography,
  Alert,
  Link,
  Container,
} from '@mui/material';
import { 
  Email, 
  Star,
  ContactMail,
  Payment,
  AccountCircle,
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

const Register: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Card 
        sx={{ 
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        }}
      >
        <CardContent sx={{ p: 6, textAlign: 'center' }}>
          <Box mb={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <Star sx={{ fontSize: 48, color: 'primary.main', mr: 2 }} />
              <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
                Join Undercovered
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem', mb: 4 }}>
              To create your premium account, please use our contact form with payment confirmation
            </Typography>
          </Box>

          <Alert severity="info" sx={{ mb: 4, textAlign: 'left' }}>
            <Typography variant="body2">
              <strong>New Registration Process:</strong><br />
              1. 💳 Send payment via Interac e-Transfer or PayPal to: <strong>vissarut.rod@gmail.com</strong><br />
              2. 📋 Fill out our contact form with payment confirmation<br />
              3. 📷 Upload your payment screenshot<br />
              4. ⏱️ We'll create your account within 2 hours (10AM-12AM Eastern)!
            </Typography>
          </Alert>

          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
            gap: 3, 
            mb: 4 
          }}>
            {/* Pricing Plans */}
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  📅 Monthly Plan
                </Typography>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
                  $10.99 CAD
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Perfect for trying out our premium content
                </Typography>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  🎯 6-Month Plan
                </Typography>
                <Typography variant="h4" color="secondary" sx={{ fontWeight: 700, mb: 1 }}>
                  $59.99 CAD
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Best value • Save $5.95
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Process Steps */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              How It Works:
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <Payment sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  1. Send Payment
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Interac e-Transfer or PayPal
                </Typography>
              </Box>
              
              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <ContactMail sx={{ fontSize: 48, color: 'secondary.main', mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  2. Fill Contact Form
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  With payment confirmation
                </Typography>
              </Box>
              
              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <AccountCircle sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  3. Get Account
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Within 2 hours
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/contact-payment')}
              startIcon={<Email />}
              sx={{
                px: 6,
                py: 2,
                fontSize: '1.2rem',
                fontWeight: 600,
                mb: 2
              }}
            >
              Start Registration Process
            </Button>
          </Box>

          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link 
                component={RouterLink} 
                to="/login"
                sx={{ 
                  fontWeight: 600,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Sign In
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Register;