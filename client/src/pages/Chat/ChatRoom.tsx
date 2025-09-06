import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Chip,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Badge,
  Paper,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Send,
  EmojiEmotions,
  AttachFile,
  MoreVert,
  Circle,
  VolumeUp,
  VolumeOff,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file';
  isAdmin?: boolean;
}

interface User {
  id: string;
  username: string;
  avatar: string;
  status: 'online' | 'away' | 'offline';
  isAdmin?: boolean;
  subscription: string;
}

const ChatRoom: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock data - in real app, this would come from socket.io
  useEffect(() => {
    const mockMessages: ChatMessage[] = [
      {
        id: '1',
        userId: 'admin',
        username: 'Admin',
        avatar: 'A',
        message: 'Welcome to the Undercovered community chat! 🎉',
        timestamp: new Date(Date.now() - 3600000),
        type: 'text',
        isAdmin: true,
      },
      {
        id: '2',
        userId: 'user1',
        username: 'John_Premium',
        avatar: 'J',
        message: 'Hey everyone! Loving the new content in the library!',
        timestamp: new Date(Date.now() - 1800000),
        type: 'text',
      },
      {
        id: '3',
        userId: 'user2',
        username: 'Sarah_VIP',
        avatar: 'S',
        message: 'The 4K quality is amazing! Thanks admin!',
        timestamp: new Date(Date.now() - 900000),
        type: 'text',
      },
    ];

    const mockUsers: User[] = [
      {
        id: 'admin',
        username: 'Admin',
        avatar: 'A',
        status: 'online',
        isAdmin: true,
        subscription: 'Admin',
      },
      {
        id: 'user1',
        username: 'John_Premium',
        avatar: 'J',
        status: 'online',
        subscription: 'Quarterly',
      },
      {
        id: 'user2',
        username: 'Sarah_VIP',
        avatar: 'S',
        status: 'online',
        subscription: 'Annual',
      },
      {
        id: 'user3',
        username: 'Mike_Member',
        avatar: 'M',
        status: 'away',
        subscription: 'Monthly',
      },
    ];

    setMessages(mockMessages);
    setOnlineUsers(mockUsers);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !user) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: user._id,
      username: user.username,
      avatar: user.username[0].toUpperCase(),
      message: newMessage,
      timestamp: new Date(),
      type: 'text',
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Play sound notification
    if (soundEnabled) {
      // In real app, play notification sound
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getStatusIcon = (status: string) => {
    const colors = {
      online: '#4caf50',
      away: '#ff9800',
      offline: '#9e9e9e',
    };
    return <Circle sx={{ fontSize: 12, color: colors[status as keyof typeof colors] }} />;
  };

  const getSubscriptionColor = (subscription: string) => {
    switch (subscription) {
      case 'Admin': return 'error';
      case 'Annual': return 'success';
      case 'Quarterly': return 'secondary';
      case 'Monthly': return 'primary';
      default: return 'default';
    }
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Please log in to access the chat room.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', gap: 3, height: '70vh' }}>
        {/* Chat Area */}
        <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Chat Header */}
          <CardContent sx={{ borderBottom: 1, borderColor: 'divider', pb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Community Chat
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {onlineUsers.filter(u => u.status === 'online').length} members online
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton 
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  color={soundEnabled ? 'primary' : 'default'}
                >
                  {soundEnabled ? <VolumeUp /> : <VolumeOff />}
                </IconButton>
                
                <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                  <MoreVert />
                </IconButton>
                
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                >
                  <MenuItem onClick={() => setAnchorEl(null)}>Chat Rules</MenuItem>
                  <MenuItem onClick={() => setAnchorEl(null)}>Report Message</MenuItem>
                  <MenuItem onClick={() => setAnchorEl(null)}>Mute Notifications</MenuItem>
                </Menu>
              </Box>
            </Box>
          </CardContent>

          {/* Messages */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {messages.map((message) => (
              <Box key={message.id} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: message.isAdmin ? 'error.main' : 'primary.main',
                      width: 40,
                      height: 40,
                    }}
                  >
                    {message.avatar}
                  </Avatar>
                  
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {message.username}
                      </Typography>
                      
                      {message.isAdmin && (
                        <Chip label="Admin" size="small" color="error" sx={{ height: 20 }} />
                      )}
                      
                      <Typography variant="caption" color="text.secondary">
                        {formatTime(message.timestamp)}
                      </Typography>
                    </Box>
                    
                    <Paper 
                      sx={{ 
                        p: 2, 
                        bgcolor: message.isAdmin ? 'error.light' : 'background.paper',
                        color: message.isAdmin ? 'error.contrastText' : 'text.primary',
                        maxWidth: '80%',
                      }}
                    >
                      <Typography variant="body2">
                        {message.message}
                      </Typography>
                    </Paper>
                  </Box>
                </Box>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>

          {/* Message Input */}
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
              <TextField
                fullWidth
                multiline
                maxRows={3}
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                variant="outlined"
                size="small"
              />
              
              <IconButton color="primary">
                <EmojiEmotions />
              </IconButton>
              
              <IconButton color="primary">
                <AttachFile />
              </IconButton>
              
              <Button
                variant="contained"
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                sx={{ minWidth: 'auto', px: 2 }}
              >
                <Send />
              </Button>
            </Box>
          </Box>
        </Card>

        {/* Online Users Sidebar */}
        <Card sx={{ width: 280, overflow: 'auto' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Members ({onlineUsers.length})
            </Typography>
            
            <List dense>
              {onlineUsers.map((onlineUser) => (
                <ListItem key={onlineUser.id} sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      badgeContent={getStatusIcon(onlineUser.status)}
                    >
                      <Avatar 
                        sx={{ 
                          bgcolor: onlineUser.isAdmin ? 'error.main' : 'primary.main',
                          width: 32,
                          height: 32,
                        }}
                      >
                        {onlineUser.avatar}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {onlineUser.username}
                        </Typography>
                        {onlineUser.isAdmin && (
                          <Chip label="Admin" size="small" color="error" sx={{ height: 16, fontSize: '0.65rem' }} />
                        )}
                      </Box>
                    }
                    secondary={
                      <Chip 
                        label={onlineUser.subscription}
                        size="small"
                        color={getSubscriptionColor(onlineUser.subscription) as any}
                        variant="outlined"
                        sx={{ height: 16, fontSize: '0.65rem' }}
                      />
                    }
                  />
                </ListItem>
              ))}
            </List>

            <Divider sx={{ my: 2 }} />
            
            <Typography variant="caption" color="text.secondary">
              💡 Chat Rules: Be respectful, no spam, enjoy the community!
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Welcome Message */}
      {messages.length === 3 && (
        <Card sx={{ mt: 3, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Welcome to the Undercovered Chat! 🎉
            </Typography>
            <Typography variant="body2">
              Connect with other premium members, share thoughts about the content, and stay updated with community news. 
              Remember to be respectful and follow our community guidelines.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default ChatRoom;
