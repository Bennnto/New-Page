import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Visibility,
  CheckCircle,
  Cancel,
  PersonAdd,
  Download,
  Email,
  Phone,
  Payment,
  Refresh,
} from '@mui/icons-material';

interface ContactSubmission {
  _id: string;
  username: string;
  email: string;
  phone?: string;
  selectedPlan: string;
  paymentMethod: string;
  paymentConfirmation: string;
  confirmationFile?: {
    filename: string;
    originalName: string;
    size: number;
    mimetype: string;
  };
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'account_created';
  processedAt?: string;
  notes?: string;
}

const UserRequests: React.FC = () => {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [notes, setNotes] = useState('');

  const fetchSubmissions = async () => {
    try {
      const getApiBaseUrl = () => {
        if (process.env.NODE_ENV === 'production') {
          return '';
        }
        return process.env.REACT_APP_API_URL || 'http://localhost:5001';
      };
      const API_BASE_URL = getApiBaseUrl();
      
      console.log('📋 Fetching submissions from:', `${API_BASE_URL}/api/contact/submissions`);
      
      const response = await fetch(`${API_BASE_URL}/api/contact/submissions`);
      const data = await response.json();
      
      console.log('📋 Submissions response:', data);
      
      if (data.success) {
        setSubmissions(data.data);
        console.log('📋 Submissions loaded:', data.data.length);
      } else {
        console.error('❌ Failed to fetch submissions:', data.message);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleAction = async (submissionId: string, action: 'approve' | 'reject' | 'create_account') => {
    setActionLoading(true);
    try {
      const getApiBaseUrl = () => {
        if (process.env.NODE_ENV === 'production') {
          return '';
        }
        return process.env.REACT_APP_API_URL || 'http://localhost:5001';
      };
      const API_BASE_URL = getApiBaseUrl();
      
      const response = await fetch(`${API_BASE_URL}/api/contact/submissions/${submissionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          notes: notes || undefined
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh submissions
        await fetchSubmissions();
        setDialogOpen(false);
        setSelectedSubmission(null);
        setNotes('');
        
        // Show success message
        if (action === 'create_account') {
          alert(`✅ Account created successfully! Login credentials sent to ${selectedSubmission?.email}`);
        } else {
          alert(`✅ Submission ${action === 'approve' ? 'approved' : 'rejected'} successfully!`);
        }
      } else {
        alert(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error processing action:', error);
      alert('❌ Error processing request. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'info';
      case 'account_created': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending Review';
      case 'approved': return 'Approved';
      case 'account_created': return 'Account Created';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  const pendingCount = submissions.filter(s => s.status === 'pending').length;

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Loading submissions...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            User Account Requests
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage contact form submissions and create user accounts
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Badge badgeContent={pendingCount} color="error">
            <Chip 
              label={`${pendingCount} Pending`} 
              color={pendingCount > 0 ? 'warning' : 'default'}
              variant={pendingCount > 0 ? 'filled' : 'outlined'}
            />
          </Badge>
          
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchSubmissions}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      <Card>
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>User Details</strong></TableCell>
                  <TableCell><strong>Plan</strong></TableCell>
                  <TableCell><strong>Payment</strong></TableCell>
                  <TableCell><strong>Submitted</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {submissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        No submissions yet
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  submissions.map((submission) => (
                    <TableRow key={submission._id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {submission.username}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              {submission.email}
                            </Typography>
                          </Box>
                          {submission.phone && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">
                                {submission.phone}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Chip 
                          label={submission.selectedPlan === 'monthly' ? 'Monthly ($10.99)' : '6-Month ($59.99)'} 
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {submission.paymentMethod === 'interac' ? 'Interac e-Transfer' : 'PayPal'}
                          </Typography>
                          {submission.confirmationFile && (
                            <Chip 
                              label="Screenshot Attached" 
                              size="small" 
                              color="success" 
                              variant="outlined"
                              sx={{ mt: 0.5 }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(submission.submittedAt).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(submission.submittedAt).toLocaleTimeString()}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Chip 
                          label={getStatusText(submission.status)}
                          color={getStatusColor(submission.status) as any}
                          size="small"
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton 
                              size="small"
                              onClick={() => {
                                setSelectedSubmission(submission);
                                setDialogOpen(true);
                              }}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          
                          {submission.status === 'pending' && (
                            <>
                              <Tooltip title="Approve">
                                <IconButton 
                                  size="small" 
                                  color="success"
                                  onClick={() => handleAction(submission._id, 'approve')}
                                >
                                  <CheckCircle />
                                </IconButton>
                              </Tooltip>
                              
                              <Tooltip title="Reject">
                                <IconButton 
                                  size="small" 
                                  color="error"
                                  onClick={() => handleAction(submission._id, 'reject')}
                                >
                                  <Cancel />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                          
                          {submission.status === 'approved' && (
                            <Tooltip title="Create Account">
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => handleAction(submission._id, 'create_account')}
                              >
                                <PersonAdd />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Submission Details Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        {selectedSubmission && (
          <>
            <DialogTitle>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Submission Details - {selectedSubmission.username}
              </Typography>
            </DialogTitle>
            
            <DialogContent>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
                
                {/* User Information */}
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      👤 User Information
                    </Typography>
                    <Box sx={{ space: 1 }}>
                      <Typography><strong>Username:</strong> {selectedSubmission.username}</Typography>
                      <Typography><strong>Email:</strong> {selectedSubmission.email}</Typography>
                      <Typography><strong>Phone:</strong> {selectedSubmission.phone || 'Not provided'}</Typography>
                    </Box>
                  </CardContent>
                </Card>

                {/* Payment Information */}
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      💳 Payment Information
                    </Typography>
                    <Box sx={{ space: 1 }}>
                      <Typography><strong>Plan:</strong> {selectedSubmission.selectedPlan}</Typography>
                      <Typography><strong>Method:</strong> {selectedSubmission.paymentMethod}</Typography>
                      <Typography><strong>Status:</strong> 
                        <Chip 
                          label={getStatusText(selectedSubmission.status)}
                          color={getStatusColor(selectedSubmission.status) as any}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Box>

              {/* Payment Confirmation */}
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    📋 Payment Confirmation
                  </Typography>
                  <Typography sx={{ p: 2, backgroundColor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'divider' }}>
                    {selectedSubmission.paymentConfirmation}
                  </Typography>
                  
                  {selectedSubmission.confirmationFile && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                        📎 Attached Screenshot:
                      </Typography>
                      <Chip 
                        label={`${selectedSubmission.confirmationFile.originalName} (${(selectedSubmission.confirmationFile.size / 1024 / 1024).toFixed(2)} MB)`}
                        icon={<Download />}
                        clickable
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>

              {/* Admin Notes */}
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Admin Notes (Optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this submission..."
              />
            </DialogContent>
            
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setDialogOpen(false)}>
                Close
              </Button>
              
              {selectedSubmission.status === 'pending' && (
                <>
                  <Button 
                    color="error"
                    variant="outlined"
                    onClick={() => handleAction(selectedSubmission._id, 'reject')}
                    disabled={actionLoading}
                  >
                    Reject
                  </Button>
                  
                  <Button 
                    color="success"
                    variant="outlined"
                    onClick={() => handleAction(selectedSubmission._id, 'approve')}
                    disabled={actionLoading}
                  >
                    Approve
                  </Button>
                </>
              )}
              
              {selectedSubmission.status === 'approved' && (
                <Button 
                  color="primary"
                  variant="contained"
                  startIcon={<PersonAdd />}
                  onClick={() => handleAction(selectedSubmission._id, 'create_account')}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Creating Account...' : 'Create User Account'}
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default UserRequests;
