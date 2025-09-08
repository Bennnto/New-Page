import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
} from '@mui/material';
import {
  Email,
  Phone,
  Person,
  Payment,
  Schedule,
  CheckCircle,
  AccountBalance,
  CloudUpload,
  AttachFile,
} from '@mui/icons-material';

const PaymentContact: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    phone: '',
    selectedPlan: 'monthly',
    paymentMethod: 'interac',
    paymentConfirmation: '',
  });
  const [confirmationFile, setConfirmationFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type (allow images)
      if (file.type.startsWith('image/')) {
        setConfirmationFile(file);
      } else {
        alert('Please select an image file (PNG, JPG, etc.) for your payment confirmation screenshot.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create FormData to handle file upload
      const submitData = new FormData();
      
      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value);
      });
      
      // Add confirmation file if present
      if (confirmationFile) {
        submitData.append('confirmationFile', confirmationFile);
      }
      
      // Add timestamp
      submitData.append('submittedAt', new Date().toISOString());

      // Send to backend API - force empty string in production
      const getApiBaseUrl = () => {
        if (process.env.NODE_ENV === 'production') {
          return '';
        }
        return process.env.REACT_APP_API_URL || 'http://localhost:5001';
      };
      const API_BASE_URL = getApiBaseUrl();
      
      console.log('📋 Submitting to:', `${API_BASE_URL}/api/contact/payment`);
      
      const response = await fetch(`${API_BASE_URL}/api/contact/payment`, {
        method: 'POST',
        body: submitData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Submission successful:', result);
      
      setIsSubmitting(false);
      setSubmitSuccess(true);
    } catch (error) {
      console.error('❌ Submission error:', error);
      alert('There was an error submitting your form. Please try again.');
      setIsSubmitting(false);
    }
  };

  const plans = [
    { id: 'monthly', name: 'Monthly', price: '$10.99 CAD', period: '/month' },
    { id: 'sixmonth', name: '6-Month', price: '$59.99 CAD', period: '/6 months', savings: 'Save $5.95' }
  ];

  if (submitSuccess) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Card sx={{ textAlign: 'center', p: 4 }}>
          <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            Payment Form Submitted Successfully!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Thank you for your submission. We have received your payment confirmation form.
          </Typography>
          <Alert severity="info" sx={{ textAlign: 'left', mb: 3 }}>
            <Typography variant="body2">
              <strong>Next Steps:</strong><br />
              • Account confirmation will be sent within 2 hours (Eastern Time, 10AM-12AM)<br />
              • If submitted outside business hours, confirmation will be sent the next business day<br />
              • Check your email: <strong>{formData.email}</strong>
            </Typography>
          </Alert>
          <Button variant="contained" href="/" size="large">
            Return to Home
          </Button>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, textAlign: 'center', mb: 2 }}>
        Subscribe to Undercovered
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mb: 6 }}>
        Complete your payment and submit this form to create your premium account
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 4 }}>
        
        {/* Payment Instructions */}
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              💳 Payment Instructions
            </Typography>

            {/* Plan Selection */}
            <FormControl component="fieldset" sx={{ mb: 4, width: '100%' }}>
              <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600 }}>
                Select Your Plan:
              </FormLabel>
              <RadioGroup
                value={formData.selectedPlan}
                onChange={(e) => setFormData(prev => ({ ...prev, selectedPlan: e.target.value }))}
              >
                {plans.map((plan) => (
                  <Paper key={plan.id} sx={{ p: 2, mb: 2, border: formData.selectedPlan === plan.id ? 2 : 1, borderColor: formData.selectedPlan === plan.id ? 'primary.main' : 'divider' }}>
                    <FormControlLabel
                      value={plan.id}
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {plan.name} - {plan.price}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {plan.period} {plan.savings && `• ${plan.savings}`}
                          </Typography>
                        </Box>
                      }
                    />
                  </Paper>
                ))}
              </RadioGroup>
            </FormControl>

            <Divider sx={{ mb: 3 }} />

            {/* Payment Methods */}
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Payment Methods:
            </Typography>
            
            <List>
              <ListItem>
                <ListItemIcon>
                  <Email color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Interac e-Transfer"
                  secondary="Send to: vissarut.rod@gmail.com"
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <AccountBalance color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="PayPal"
                  secondary="Send to: vissarut.rod@gmail.com"
                />
              </ListItem>
            </List>

            <Alert severity="warning" sx={{ mt: 3 }}>
              <Typography variant="body2">
                <strong>Important:</strong> After sending payment, complete the form on the right with your payment confirmation details.
              </Typography>
            </Alert>

            {/* Timing Information */}
            <Box sx={{ mt: 3, p: 2, backgroundColor: 'background.paper', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Schedule sx={{ mr: 1, color: 'info.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Account Confirmation Timing
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                • Confirmation sent within 2 hours (Eastern Time)<br />
                • Business hours: 10AM - 12AM Eastern<br />
                • Outside hours: Next business day + 1 day<br />
                • Check your email for account details
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Registration Form */}
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              📝 Account Registration Form
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
              
              {/* Username */}
              <TextField
                fullWidth
                required
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                margin="normal"
                InputProps={{
                  startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />

              {/* Password */}
              <TextField
                fullWidth
                required
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                margin="normal"
                helperText="Minimum 8 characters"
              />

              {/* Email */}
              <TextField
                fullWidth
                required
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                margin="normal"
                InputProps={{
                  startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />

              {/* Phone */}
              <TextField
                fullWidth
                label="Phone Number (Optional)"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                margin="normal"
                InputProps={{
                  startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />

              <Divider sx={{ my: 3 }} />

              {/* Payment Method */}
              <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
                <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600 }}>
                  Payment Method Used: *
                </FormLabel>
                <RadioGroup
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  row
                >
                  <FormControlLabel value="interac" control={<Radio />} label="Interac e-Transfer" />
                  <FormControlLabel value="paypal" control={<Radio />} label="PayPal" />
                </RadioGroup>
              </FormControl>

              {/* Payment Confirmation */}
              <TextField
                fullWidth
                required
                label="Payment Confirmation Details"
                name="paymentConfirmation"
                value={formData.paymentConfirmation}
                onChange={handleInputChange}
                margin="normal"
                multiline
                rows={3}
                placeholder="Enter transaction ID, reference number, or payment confirmation details..."
                InputProps={{
                  startAdornment: <Payment sx={{ mr: 1, color: 'text.secondary', alignSelf: 'flex-start', mt: 1 }} />
                }}
              />

              {/* Payment Confirmation Screenshot Upload */}
              <Box sx={{ mt: 3, mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
                  Upload Payment Confirmation Screenshot: *
                </Typography>
                <Box
                  sx={{
                    border: '2px dashed',
                    borderColor: confirmationFile ? 'success.main' : 'divider',
                    borderRadius: 2,
                    p: 3,
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: confirmationFile ? 'success.light' : 'background.paper',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'action.hover',
                    },
                  }}
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                  
                  {confirmationFile ? (
                    <Box>
                      <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                      <Typography variant="body1" sx={{ fontWeight: 600, color: 'success.main' }}>
                        File Selected: {confirmationFile.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Size: {(confirmationFile.size / 1024 / 1024).toFixed(2)} MB
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ mt: 1 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmationFile(null);
                        }}
                      >
                        Remove File
                      </Button>
                    </Box>
                  ) : (
                    <Box>
                      <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        Click to upload screenshot
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Upload a screenshot of your payment confirmation
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Supported: PNG, JPG, JPEG (Max 10MB)
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              <Alert severity="info" sx={{ mt: 3, mb: 3 }}>
                <Typography variant="body2">
                  <strong>After submitting this form:</strong><br />
                  Your account will be created and confirmation sent to your email within 2 hours during business hours (10AM-12AM Eastern Time). Outside business hours, confirmation will be sent the next business day plus 1 additional day.
                </Typography>
              </Alert>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isSubmitting || !formData.username || !formData.password || !formData.email || !formData.paymentConfirmation || !confirmationFile}
                sx={{ mt: 2, py: 2, fontSize: '1.1rem', fontWeight: 600 }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Registration Form'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default PaymentContact;
