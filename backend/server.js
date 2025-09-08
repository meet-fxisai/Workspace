
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require('socket.io');

const userRoutes = require('./routes/userRoutes');
const organizationRoutes = require('./routes/organizationRoutes');
const workspaceRoutes = require('./routes/workspaceRoutes');
const chatRoutes = require('./routes/chatRoutes')
const messageRoutes = require('./routes/messageRoutes');

const { syncModels } = require('./models');
const CORS =  require('cors');

const app = express();
const server = http.createServer(app);

// Configure Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5000", // Frontend URL
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Store online users
let onlineUsers = [];

// Socket connection handling
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // User joins
  socket.on("addNewUser", (userId, userEmail, userName) => {
    const existingUser = onlineUsers.find(u => u.userId === userId);
    if (!existingUser) {
      onlineUsers.push({
        userId,
        socketId: socket.id,
        userEmail,
        userName,
        joinedAt: new Date()
      });
      console.log(`User ${userName} (${userEmail}) joined. Online users: ${onlineUsers.length}`);
    } else {
      // Update socket ID if user reconnects
      existingUser.socketId = socket.id;
      console.log(`User ${userName} reconnected with new socket ID`);
    }
    
    // Broadcast updated online users list
    io.emit('onlineUsers', onlineUsers);
  });

  // Send message directly between users
  socket.on('sendMessage', (newMessage, recipientId) => {
    console.log('📤 Socket: Sending message to recipient:', recipientId);
    const recipient = onlineUsers.find(u => u.userId === recipientId);
    if (recipient) {
      console.log(`📨 Socket: Delivering message to ${recipient.userEmail}`);
      io.to(recipient.socketId).emit("newMessage", newMessage);
    } else {
      console.log(`⚠️ Socket: Recipient ${recipientId} not online`);
    }
  });

  // Listen for messages broadcast from API
  socket.on('messageToUser', (data) => {
    const { recipientId, message } = data;
    console.log('📤 Socket: Broadcasting API message to recipient:', recipientId);
    const recipient = onlineUsers.find(u => u.userId === recipientId);
    if (recipient) {
      console.log(`📨 Socket: Delivering API message to ${recipient.userEmail}`);
      io.to(recipient.socketId).emit("newMessage", message);
    } else {
      console.log(`⚠️ Socket: API message recipient ${recipientId} not online`);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    const disconnectedUser = onlineUsers.find(u => u.socketId === socket.id);
    if (disconnectedUser) {
      console.log(`User ${disconnectedUser.userName} disconnected`);
    }
    onlineUsers = onlineUsers.filter(u => u.socketId !== socket.id);
    io.emit('onlineUsers', onlineUsers);
  });

  // Handle typing events
  socket.on('typing', (data) => {
    socket.broadcast.emit('userTyping', data);
  });

  socket.on('stopTyping', (data) => {
    socket.broadcast.emit('userStoppedTyping', data);
  });
});

// Global function to broadcast messages from API
const broadcastMessage = (recipientId, message) => {
  const recipient = onlineUsers.find(u => u.userId === recipientId);
  if (recipient) {
    console.log(`📡 Global: Broadcasting to ${recipient.userEmail}`);
    io.to(recipient.socketId).emit("newMessage", message);
    return true;
  }
  return false;
};

// Make broadcast function available globally
global.broadcastMessage = broadcastMessage;

// Make io accessible to routes
app.set('io', io);

app.use(CORS());
app.use(bodyParser.json());

app.use('/api/users', userRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/userworkspaces', require('./routes/userworkspaceRoutes'));
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes)

const PORT = process.env.PORT || 3000;

syncModels().then(() => {
	server.listen(PORT, () => {
		console.log(`Server running on port ${PORT}`);
		console.log(`Socket.io server ready for connections`);
	});
});
