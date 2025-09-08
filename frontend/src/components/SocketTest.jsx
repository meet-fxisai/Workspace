import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Chip } from '@mui/material';
import socketService from '../Services/socket.service';
import { getUser } from '../utils/userUtils';

const SocketTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = getUser();
    setCurrentUser(user);

    // Check initial connection status
    const checkConnection = () => {
      const status = socketService.getConnectionStatus();
      setConnectionStatus(status ? 'Connected' : 'Disconnected');
    };

    // Check connection status every second
    const interval = setInterval(checkConnection, 1000);

    // Listen for online users updates
    socketService.onOnlineUsers((users) => {
      setOnlineUsers(users);
      console.log('Online users updated in test component:', users);
    });

    return () => {
      clearInterval(interval);
      socketService.off('onlineUsers');
    };
  }, []);

  const handleConnect = () => {
    if (currentUser) {
      socketService.connect('http://localhost:3000');
      socketService.addUser(currentUser.id, currentUser.email, currentUser.name);
    }
  };

  const handleDisconnect = () => {
    socketService.disconnect();
    setOnlineUsers([]);
  };

  const sendTestMessage = () => {
    if (onlineUsers.length > 1) {
      // Send message to the first other user
      const otherUser = onlineUsers.find(u => u.userId !== currentUser?.id);
      if (otherUser) {
        const testMessage = {
          content: 'Hello from socket test!',
          authorId: currentUser.id,
          timestamp: new Date().toISOString()
        };
        socketService.sendMessage(testMessage, otherUser.userId);
        console.log('Test message sent to:', otherUser.userEmail);
      }
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, m: 2, maxWidth: 600 }}>
      <Typography variant="h5" gutterBottom>
        Socket Connection Test
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body1">
          <strong>Connection Status:</strong>{' '}
          <Chip 
            label={connectionStatus} 
            color={connectionStatus === 'Connected' ? 'success' : 'error'}
            size="small"
          />
        </Typography>
      </Box>

      {currentUser && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Current User:</strong> {currentUser.name} ({currentUser.email})
          </Typography>
        </Box>
      )}

      <Box sx={{ mb: 2 }}>
        <Typography variant="body1" gutterBottom>
          <strong>Online Users ({onlineUsers.length}):</strong>
        </Typography>
        {onlineUsers.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No online users
          </Typography>
        ) : (
          onlineUsers.map((user, index) => (
            <Chip
              key={user.socketId}
              label={`${user.userName} (${user.userEmail})`}
              variant={user.userId === currentUser?.id ? 'filled' : 'outlined'}
              color={user.userId === currentUser?.id ? 'primary' : 'default'}
              size="small"
              sx={{ mr: 1, mb: 1 }}
            />
          ))
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Button 
          variant="contained" 
          onClick={handleConnect}
          disabled={connectionStatus === 'Connected'}
        >
          Connect
        </Button>
        <Button 
          variant="outlined" 
          onClick={handleDisconnect}
          disabled={connectionStatus === 'Disconnected'}
        >
          Disconnect
        </Button>
        <Button 
          variant="contained" 
          color="secondary"
          onClick={sendTestMessage}
          disabled={connectionStatus === 'Disconnected' || onlineUsers.length <= 1}
        >
          Send Test Message
        </Button>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" color="text.secondary">
          This component helps test the socket connection. You should see your name appear in the online users list when connected.
        </Typography>
      </Box>
    </Paper>
  );
};

export default SocketTest;
