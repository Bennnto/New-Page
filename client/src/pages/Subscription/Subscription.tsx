import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  LinearProgress,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Star,
  Check,
  Cancel,
  CreditCard,
  Download,
  Receipt,
  CalendarToday,
  TrendingUp,
  Security,
  Speed,
  CloudUpload,
  Group,
  Support,
  VideoLibrary,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  originalPrice?: string;
  features: string[];
  popular: boolean;
  color: 'primary' | 'secondary' | 'success';
  icon: React.ReactNode;
}

interface BillingHistory {
  id: string;
  date: string;
  amount: string;
  plan: string;
  status: 'paid' | 'pending' | 'failed';
  invoice: string;
}

const Subscription: React.FC = () => {
  const { user } = useAuth();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const plans: SubscriptionPlan[] = [
    {
      id: 'monthly',
      name: 'Monthly',
      price: '$10.99',
      period: '/month',
      features: [
        'Full premium content library',
        'HD & 4K video quality',
        'Community chat access',
        'Download for offline viewing',
        'Priority support',
        'Ad-free experience',
        'Mobile & desktop access',
      ],
      popular: false,
      color: 'primary',
      icon: <VideoLibrary />,
    },
    {
      id: 'sixmonth',
      name: '6-Month',
      price: '$59.99',
      period: '/6 months',
      originalPrice: '$65.94',
      features: [
        'Everything in Monthly',
        'Save $5.95 compared to monthly',
        'Early access to new content',
        'VIP community status',
        'Direct admin contact',
        'Custom content requests',
        'Priority customer support',
      ],
      popular: true,
      color: 'secondary',
      icon: <Star />,
    },
  ];

  const billingHistory: BillingHistory[] = [
    {
      id: 'inv_001',
      date: '2024-09-01',
      amount: '$19.99',
      plan: 'Premium',
      status: 'paid',
      invoice: 'INV-2024-001',
    },
    {
      id: 'inv_002',
      date: '2024-08-01',
      amount: '$19.99',
      plan: 'Premium',
      status: 'paid',
      invoice: 'INV-2024-002',
    },
    {
      id: 'inv_003',
      date: '2024-07-01',
      amount: '$19.99',
      plan: 'Premium',
      status: 'paid',
      invoice: 'INV-2024-003',
    },
  ];

  const handlePlanChange = async (plan: SubscriptionPlan) => {
    setLoading(true);
    try {
      await axios.post('/api/subscription/change', { planId: plan.id });
      setSuccessMessage(`Successfully upgraded to ${plan.name} plan!`);
      setShowUpgradeDialog(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to change plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setLoading(true);
    try {
      await axios.post('/api/subscription/cancel');
      setSuccessMessage('Subscription cancelled successfully');
      setShowCancelDialog(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getCurrentPlan = () => {
    return plans.find(plan => plan.id === user?.subscription?.plan) || plans[0];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const currentPlan = getCurrentPlan();

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Subscription & Billing
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your subscription, billing, and plan details
          </Typography>
        </Box>

        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
          {/* Current Subscription */}
          <Box sx={{ flex: { xs: 1, md: 2 } }}>
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Current Subscription
                  </Typography>
                  <Chip 
                    label={user?.subscription?.status?.toUpperCase() || 'ACTIVE'}
                    color="success"
                    size="small"
                  />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    width: 60,
                    height: 60,
                    borderRadius: 2,
                    bgcolor: `${currentPlan.color}.main`,
                    color: 'white',
                    mr: 3
                  }}>
                    {currentPlan.icon}
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {currentPlan.name} Plan
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                      {currentPlan.price}{currentPlan.period}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Next billing: September 30, 2024
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ mb: 3 }} />

                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Plan Features
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  {currentPlan.features.slice(0, 6).map((feature, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
                      <Check color="success" sx={{ mr: 1, fontSize: '1.2rem' }} />
                      <Typography variant="body2">{feature}</Typography>
                    </Box>
                  ))}
                </Box>

                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<TrendingUp />}
                    onClick={() => setShowUpgradeDialog(true)}
                  >
                    Upgrade Plan
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Cancel />}
                    onClick={() => setShowCancelDialog(true)}
                  >
                    Cancel Subscription
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Billing History */}
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Billing History
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Plan</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Invoice</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {billingHistory.map((bill) => (
                        <TableRow key={bill.id}>
                          <TableCell>{formatDate(bill.date)}</TableCell>
                          <TableCell>{bill.plan}</TableCell>
                          <TableCell>{bill.amount}</TableCell>
                          <TableCell>
                            <Chip 
                              label={bill.status.toUpperCase()}
                              color={getStatusColor(bill.status) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              startIcon={<Download />}
                              onClick={() => console.log('Download invoice:', bill.invoice)}
                            >
                              Download
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Box>

          {/* Sidebar */}
          <Box sx={{ flex: { xs: 1, md: 1 }, minWidth: { md: 300 } }}>
            {/* Payment Method */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Payment Method
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CreditCard sx={{ mr: 2, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2">•••• •••• •••• 4242</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Expires 12/26
                    </Typography>
                  </Box>
                </Box>
                <Button variant="outlined" size="small" fullWidth>
                  Update Payment Method
                </Button>
              </CardContent>
            </Card>

            {/* Usage Stats */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  This Month's Usage
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <VideoLibrary />
                    </ListItemIcon>
                    <ListItemText
                      primary="Content Viewed"
                      secondary="24 videos watched"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Download />
                    </ListItemIcon>
                    <ListItemText
                      primary="Downloads"
                      secondary="12 items downloaded"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Group />
                    </ListItemIcon>
                    <ListItemText
                      primary="Chat Messages"
                      secondary="156 messages sent"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            {/* Support */}
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Need Help?
                </Typography>
                <List dense>
                  <ListItem disablePadding>
                    <ListItemButton>
                      <ListItemIcon>
                        <Support />
                      </ListItemIcon>
                      <ListItemText primary="Contact Support" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton>
                      <ListItemIcon>
                        <Receipt />
                      </ListItemIcon>
                      <ListItemText primary="Billing Questions" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton>
                      <ListItemIcon>
                        <Security />
                      </ListItemIcon>
                      <ListItemText primary="Account Security" />
                    </ListItemButton>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Upgrade Dialog */}
        <Dialog 
          open={showUpgradeDialog} 
          onClose={() => setShowUpgradeDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Choose Your Plan</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3, mt: 1 }}>
              {plans.map((plan) => (
                <Box key={plan.id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      border: plan.popular ? 2 : 1,
                      borderColor: plan.popular ? 'secondary.main' : 'divider',
                      position: 'relative',
                      cursor: 'pointer',
                      '&:hover': { boxShadow: 4 }
                    }}
                    onClick={() => setSelectedPlan(plan)}
                  >
                    {plan.popular && (
                      <Chip
                        label="Most Popular"
                        color="secondary"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: -12,
                          left: '50%',
                          transform: 'translateX(-50%)',
                        }}
                      />
                    )}
                    <CardContent>
                      <Box sx={{ textAlign: 'center', mb: 2 }}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          width: 50,
                          height: 50,
                          borderRadius: 2,
                          bgcolor: `${plan.color}.main`,
                          color: 'white',
                          mx: 'auto',
                          mb: 2
                        }}>
                          {plan.icon}
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {plan.name}
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                          {plan.price}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {plan.period}
                        </Typography>
                      </Box>
                      <List dense>
                        {plan.features.slice(0, 4).map((feature, index) => (
                          <ListItem key={index} sx={{ px: 0 }}>
                            <ListItemIcon sx={{ minWidth: 30 }}>
                              <Check color="success" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText 
                              primary={feature}
                              primaryTypographyProps={{ variant: 'body2' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowUpgradeDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={() => selectedPlan && handlePlanChange(selectedPlan)}
              disabled={!selectedPlan || loading}
            >
              {selectedPlan ? `Upgrade to ${selectedPlan.name}` : 'Select Plan'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Cancel Dialog */}
        <Dialog 
          open={showCancelDialog} 
          onClose={() => setShowCancelDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Cancel Subscription</DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Are you sure you want to cancel your subscription? You'll lose access to:
            </Typography>
            <List>
              {currentPlan.features.slice(0, 4).map((feature, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <Cancel color="error" />
                  </ListItemIcon>
                  <ListItemText primary={feature} />
                </ListItem>
              ))}
            </List>
            <Alert severity="info" sx={{ mt: 2 }}>
              Your subscription will remain active until the end of your billing period.
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowCancelDialog(false)}>
              Keep Subscription
            </Button>
            <Button 
              variant="contained" 
              color="error"
              onClick={handleCancelSubscription}
              disabled={loading}
            >
              Cancel Subscription
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default Subscription;