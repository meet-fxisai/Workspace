import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.pendingUserData = null;
  }

  // Initialize socket connection
  connect(serverUrl = 'http://localhost:3000') {
    if (!this.socket) {
      this.socket = io(serverUrl, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
      });

      this.socket.on('connect', () => {
        console.log('Connected to server:', this.socket.id);
        this.isConnected = true;
        
        // If user data was stored for adding, add them now
        if (this.pendingUserData) {
          console.log('Adding pending user after connection:', this.pendingUserData);
          this.socket.emit('addNewUser', this.pendingUserData.userId, this.pendingUserData.userEmail, this.pendingUserData.userName);
          this.pendingUserData = null;
        }
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from server');
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        this.isConnected = false;
      });
    }
    return this.socket;
  }

  // Add user to online users list
  addUser(userId, userEmail, userName) {
    if (this.socket && this.isConnected) {
      console.log('Adding user to socket:', { userId, userEmail, userName });
      this.socket.emit('addNewUser', userId, userEmail, userName);
    } else {
      console.log('Socket not connected, storing user data for later:', { userId, userEmail, userName });
      // Store user data to add after connection
      this.pendingUserData = { userId, userEmail, userName };
    }
  }

  // Listen for online users updates
  onOnlineUsers(callback) {
    if (this.socket) {
      this.socket.on('onlineUsers', callback);
    }
  }

  // Send message
  sendMessage(message, recipientId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('sendMessage', message, recipientId);
    }
  }

  // Listen for new messages
  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on('newMessage', callback);
    }
  }

  // Typing indicators
  startTyping(data) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing', data);
    }
  }

  stopTyping(data) {
    if (this.socket && this.isConnected) {
      this.socket.emit('stopTyping', data);
    }
  }

  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('userTyping', callback);
    }
  }

  onUserStoppedTyping(callback) {
    if (this.socket) {
      this.socket.on('userStoppedTyping', callback);
    }
  }

  // Remove event listeners
  off(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('Socket disconnected');
    }
  }

  // Get connection status
  getConnectionStatus() {
    return this.isConnected;
  }

  // Get socket instance
  getSocket() {
    return this.socket;
  }
}

// Create a singleton instance
const socketService = new SocketService();
export default socketService;
