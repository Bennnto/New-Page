import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  Container,
  InputAdornment,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Chip,
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Email, 
  Lock, 
  Person,
  AccountBox,
  CreditCard,
  Star,
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [activeStep, setActiveStep] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState('quarterly');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    firstName: '',
    lastName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCVC: '',
    cardName: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const steps = ['Choose Plan', 'Payment Info', 'Account Details'];

  const plans = [
    {
      id: 'monthly',
      name: 'Monthly',
      price: '$19.99',
      period: '/month',
      features: ['Full Media Library', 'Community Chat', 'Admin Announcements'],
    },
    {
      id: 'quarterly',
      name: 'Quarterly',
      price: '$49.99',
      period: '/3 months',
      originalPrice: '$59.97',
      features: ['Everything in Monthly', 'Priority Support', 'Early Access'],
      popular: true,
    },
    {
      id: 'annual',
      name: 'Annual',
      price: '$159.99',
      period: '/year',
      originalPrice: '$239.88',
      features: ['Everything in Quarterly', 'VIP Status', 'Exclusive Events'],
    },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNext = () => {
    if (activeStep === 0) {
      setActiveStep(1);
    } else if (activeStep === 1) {
      // Validate payment info
      if (!formData.cardNumber || !formData.cardExpiry || !formData.cardCVC || !formData.cardName) {
        setError('Please fill in all payment details');
        return;
      }
      setActiveStep(2);
    }
    setError('');
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      await register({
        email: formData.email,
        password: formData.password,
        username: formData.username,
        firstName: formData.firstName,
        lastName: formData.lastName,
        subscription: {
          plan: selectedPlan,
          cardDetails: {
            number: formData.cardNumber,
            expiry: formData.cardExpiry,
            cvc: formData.cardCVC,
            name: formData.cardName,
          }
        }
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              Choose Your Subscription Plan
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {plans.map((plan) => (
                <Card 
                  key={plan.id}
                  sx={{ 
                    cursor: 'pointer',
                    border: 2,
                    borderColor: selectedPlan === plan.id ? 'primary.main' : 'divider',
                    position: 'relative',
                    '&:hover': {
                      borderColor: 'primary.main',
                    }
                  }}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.popular && (
                    <Chip
                      label="Most Popular"
                      color="secondary"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: 16,
                        fontWeight: 600,
                      }}
                    />
                  )}
                  
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {plan.name}
                        </Typography>
                        <Box display="flex" alignItems="baseline" gap={1}>
                          <Typography variant="h5" sx={{ fontWeight: 700 }}>
                            {plan.price}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
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
                      
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {plan.features.join(' • ')}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              Payment Information
            </Typography>

            <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 2, border: 1, borderColor: 'divider' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Selected Plan:
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {plans.find(p => p.id === selectedPlan)?.name} - {plans.find(p => p.id === selectedPlan)?.price}
              </Typography>
            </Box>

            <TextField
              fullWidth
              label="Card Number"
              name="cardNumber"
              value={formData.cardNumber}
              onChange={handleChange}
              required
              margin="normal"
              placeholder="1234 5678 9012 3456"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CreditCard color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <TextField
                label="Expiry Date"
                name="cardExpiry"
                value={formData.cardExpiry}
                onChange={handleChange}
                required
                placeholder="MM/YY"
                sx={{ flex: 1 }}
              />
              
              <TextField
                label="CVC"
                name="cardCVC"
                value={formData.cardCVC}
                onChange={handleChange}
                required
                placeholder="123"
                sx={{ flex: 1 }}
              />
            </Box>

            <TextField
              fullWidth
              label="Cardholder Name"
              name="cardName"
              value={formData.cardName}
              onChange={handleChange}
              required
              margin="normal"
              placeholder="John Doe"
            />
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              Create Your Account
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <TextField
              fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              margin="normal"
              helperText="Username must be 3-30 characters and alphanumeric"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountBox color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              required
              margin="normal"
              helperText="Password must be at least 6 characters"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Card 
        sx={{ 
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box textAlign="center" mb={4}>
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(45deg, #4f46e5 30%, #f59e0b 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Join Undercovered
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Get instant access to our premium media library and exclusive community
            </Typography>
          </Box>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            {renderStepContent()}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="outlined"
              >
                Back
              </Button>

              {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isLoading}
                  startIcon={<Star />}
                  sx={{
                    px: 4,
                    fontWeight: 600,
                  }}
                >
                  {isLoading ? 'Creating Account...' : 'Complete Subscription'}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  variant="contained"
                  sx={{
                    px: 4,
                    fontWeight: 600,
                  }}
                >
                  Next
                </Button>
              )}
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link 
                  component={RouterLink} 
                  to="/login" 
                  color="primary"
                  sx={{ textDecoration: 'none', fontWeight: 600 }}
                >
                  Sign in here
                </Link>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Register;