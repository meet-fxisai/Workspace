import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SocketTest from '../components/SocketTest';
import socketService from '../Services/socket.service';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  
  // State management
  const [selectedUser, setSelectedUser] = useState(null);
  const [workspaceMembers, setWorkspaceMembers] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [chatData, setChatData] = useState([]); // Store chat data
  const [currentChatId, setCurrentChatId] = useState(null); // Current chat ID
  const [sendingMessage, setSendingMessage] = useState(false); // Loading state for sending
  const [loadingMessages, setLoadingMessages] = useState(false); // Loading state for fetching messages

  // Utility functions
  const getTokenFromStorage = () => localStorage.getItem('token');
  
  const decodeToken = (token) => {
    if (!token) return null;
    
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window.atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  const isTokenValid = (decodedToken) => {
    if (!decodedToken) return false;
    const currentTime = Date.now() / 1000;
    return decodedToken.exp > currentTime;
  };

  const clearTokenAndRedirect = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Function to scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Helper function to get user initials
  const getUserInitials = (user) => {
    if (!user) return 'U';
    const name = user.name || user.username || 'User';
    return name.charAt(0).toUpperCase();
  };

  // Helper function to get user display name
  const getUserDisplayName = (user) => {
    if (!user) return 'User';
    return user.name || user.username || 'User';
  };

  // Helper function to find user by ID from workspace members
  const findUserById = (userId) => {
    return workspaceMembers.find(user => user.id === userId);
  };

  // Authentication functions
  const checkAuthentication = () => {
    const token = getTokenFromStorage();
    if (!token) return false;
    
    const decodedToken = decodeToken(token);
    if (!isTokenValid(decodedToken)) {
      localStorage.removeItem('token');
      return false;
    }
    
    return true;
  };

  const getCurrentUser = () => {
    const token = getTokenFromStorage();
    return decodeToken(token);
  };

  // Function to find chat ID between current user and selected user
  const findChatId = (selectedUserId) => {
    const currentUser = getCurrentUser();
    if (!currentUser || !selectedUserId) return null;

    const currentUserId = currentUser.id;
    
    // Find chat where current user is either user1 or user2, and selected user is the other
    const chat = chatData.find(chat => 
      (chat.user1Id === currentUserId && chat.user2Id === selectedUserId) ||
      (chat.user1Id === selectedUserId && chat.user2Id === currentUserId)
    );
    
    return chat ? chat.id : null;
  };

  // API functions
  const fetchWorkspaceMembers = async (workspaceId) => {
    if (!workspaceId) {
      setWorkspaceMembers([]);
      setChatData([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const token = getTokenFromStorage();
      const response = await fetch(`http://localhost:3000/api/userworkspaces/users/${workspaceId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      console.log("API Response:", response);

      if (response.status === 401 || response.status === 403) {
        clearTokenAndRedirect();
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Extract members and chat data from response
      const members = Array.isArray(data) ? data : (data.users || []);
      const chats = data.chats || data; // Assuming chat data is in the response
      
      setWorkspaceMembers(members);
      setChatData(Array.isArray(chats) ? chats : []); // Store chat data
      
    } catch (error) {
      console.error("Error fetching workspace members:", error);
      setError(error.message);
      setWorkspaceMembers([]);
      setChatData([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for a specific chat
  const fetchChatMessages = async (chatId) => {
    console.log('💬 Home: Fetching messages for chat:', chatId);
    
    if (!chatId) {
      console.log('💬 Home: No chat ID provided');
      setMessages([]);
      return;
    }

    setLoadingMessages(true);
    setError(null);
    
    try {
      const token = getTokenFromStorage();
      console.log('💬 Home: Making API request to fetch messages');
      
      const response = await fetch(`http://localhost:3000/api/messages/${chatId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      console.log('💬 Home: Messages API response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (response.status === 401 || response.status === 403) {
        console.log('💬 Home: Unauthorized, redirecting to login');
        clearTokenAndRedirect();
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('💬 Home: Raw API response:', responseData);

      // Extract messages from the data property
      const messagesArray = responseData.data || [];
      console.log('💬 Home: Messages array extracted:', {
        isArray: Array.isArray(messagesArray),
        length: messagesArray.length,
        firstMessage: messagesArray.length > 0 ? messagesArray[0] : null
      });

      // Transform the messages to match our local format
      const currentUser = getCurrentUser();
      const transformedMessages = messagesArray.map(msg => {
        const isOwnMessage = msg.authorId === currentUser.id;
        
        // Get sender name
        let senderName = "Unknown User";
        if (isOwnMessage) {
          senderName = "You";
        } else {
          // Try to get name from included author data first
          if (msg.author && msg.author.name) {
            senderName = msg.author.name;
          } else {
            // Find the user in workspace members
            const messageAuthor = findUserById(msg.authorId);
            if (messageAuthor) {
              senderName = messageAuthor.name || messageAuthor.username || "Unknown User";
            } else if (selectedUser && msg.authorId === selectedUser.id) {
              // Fallback to selected user if author is the person we're chatting with
              senderName = selectedUser.name || selectedUser.username || "Unknown User";
            }
          }
        }
        
        return {
          id: msg.id,
          sender: senderName,
          content: msg.message,
          timestamp: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isOwn: isOwnMessage,
          authorId: msg.authorId,
          createdAt: msg.createdAt
        };
      });

      // Messages are already ordered by createdAt ASC from backend
      console.log('💬 Home: Transformed messages:', transformedMessages);
      setMessages(transformedMessages);
      
    } catch (error) {
      console.error('💬 Home: Error fetching chat messages:', error);
      setError(`Failed to load messages: ${error.message}`);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
      console.log('💬 Home: Fetch messages completed');
    }
  };

  // Send message function
  const sendMessageAPI = async (messageContent, chatId, authorId) => {
    try {
      const token = getTokenFromStorage();
      const response = await fetch('http://localhost:3000/api/messages/sendMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: messageContent,
          contentType: "text",
          authorId: authorId,
          chatId: chatId
        })
      });

      if (response.status === 401 || response.status === 403) {
        clearTokenAndRedirect();
        return null;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  };

  // Event handlers
  const handleWorkspaceSelect = (workspace) => {
    console.log('🏢 Home: Workspace selected:', workspace);
    setSelectedWorkspace(workspace);
    setSelectedUser(null);
    setMessages([]);
    setCurrentChatId(null);
    
    if (workspace?.id) {
      fetchWorkspaceMembers(workspace.id);
    } else {
      setWorkspaceMembers([]);
      setChatData([]);
    }
  };

  const handleUserSelect = async (user) => {
    console.log('👤 Home: User selected:', {
      id: user.id,
      name: user.name,
      email: user.email
    });
    
    setSelectedUser(user);
    
    // Find and set the chat ID for this user
    const chatId = findChatId(user.id);
    setCurrentChatId(chatId);
    console.log('💬 Home: Chat ID found:', chatId);
    
    // Clear previous messages first
    setMessages([]);
    
    // Fetch messages for this chat if chat ID exists
    if (chatId) {
      await fetchChatMessages(chatId);
    } else {
      console.log('💬 Home: No chat found between users');
    }
  };

  const sendMessage = async () => {
    console.log('💬 Home: Send message attempt:', {
      hasMessage: !!newMessage.trim(),
      hasSelectedUser: !!selectedUser,
      hasChatId: !!currentChatId,
      message: newMessage
    });

    if (!newMessage.trim() || !selectedUser || !currentChatId) {
      console.log('💬 Home: Cannot send message - missing requirements');
      return;
    }
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
      console.error('💬 Home: No current user found');
      return;
    }

    setSendingMessage(true);
    
    try {
      console.log('💬 Home: Sending message via API and Socket');
      
      // Send message via API
      const result = await sendMessageAPI(newMessage, currentChatId, currentUser.id);
      
      if (result) {
        console.log('💬 Home: Message sent via API successfully:', result);
        
        // Create message object for socket
        const socketMessage = {
          id: result.id || Date.now(),
          content: newMessage,
          authorId: currentUser.id,
          senderName: currentUser.name || 'You',
          chatId: currentChatId,
          createdAt: new Date().toISOString()
        };
        
        // Send message via socket to the selected user
        if (socketService.getConnectionStatus()) {
          console.log('💬 Home: Sending message via socket to user:', selectedUser.id);
          socketService.sendMessage(socketMessage, selectedUser.id);
        } else {
          console.warn('💬 Home: Socket not connected, message sent via API only');
        }
        
        // Create local message object for immediate display
        const message = {
          id: socketMessage.id,
          sender: "You",
          content: newMessage,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isOwn: true,
          authorId: currentUser.id,
          createdAt: socketMessage.createdAt
        };
        
        // Add message to local state
        setMessages(prev => [...prev, message]);
        setNewMessage('');
        
        // Scroll to bottom to show the new message
        setTimeout(() => scrollToBottom(), 100);
      }
    } catch (error) {
      console.error('💬 Home: Failed to send message:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleLogout = () => {
    console.log('🚪 Home: Logout initiated');
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Effects
  useEffect(() => {
    console.log('🔄 Home: useEffect triggered - checking authentication');
    setAuthLoading(true);
    
    if (!checkAuthentication()) {
      console.log('🔄 Home: Authentication failed, redirecting');
      navigate('/login');
      return;
    }
    
    console.log('🔄 Home: Authentication successful');
    setIsAuthenticated(true);
    
    // Initialize socket connection and add user
    const currentUser = getCurrentUser();
    if (currentUser) {
      console.log('🔌 Home: Initializing socket connection for user:', currentUser.name);
      socketService.connect('http://localhost:3000');
      socketService.addUser(currentUser.id, currentUser.email, currentUser.name);
    }
    
    setAuthLoading(false);
  }, [navigate]);

  // Socket listeners effect
  useEffect(() => {
    if (!isAuthenticated) return;

    console.log('🔌 Home: Setting up socket listeners');
    
    // Listen for new messages
    const handleNewMessage = (message) => {
      console.log('📨 Home: Received new message via socket:', message);
      
      // Only add message if it belongs to the current chat
      if (!currentChatId || message.chatId !== currentChatId) {
        console.log('📨 Home: Message not for current chat, ignoring');
        return;
      }
      
      // Transform the message to match the expected format
      const transformedMessage = {
        id: message.id || Date.now(),
        sender: message.senderName || 'Unknown',
        content: message.content,
        timestamp: new Date(message.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: false,
        authorId: message.authorId,
        createdAt: message.createdAt || new Date().toISOString()
      };
      
      console.log('📨 Home: Adding socket message to chat:', transformedMessage);
      
      // Add message to current chat messages
      setMessages(prev => {
        // Check for duplicates more thoroughly
        const isDuplicate = prev.some(msg => 
          msg.id === transformedMessage.id || 
          (msg.content === transformedMessage.content && 
           msg.authorId === transformedMessage.authorId &&
           Math.abs(new Date(msg.createdAt) - new Date(transformedMessage.createdAt)) < 1000)
        );
        
        if (isDuplicate) {
          console.log('📨 Home: Duplicate message detected, skipping');
          return prev;
        }
        
        // Add new message and sort by timestamp
        const newMessages = [...prev, transformedMessage];
        return newMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      });
    };

    // Set up socket listeners
    socketService.onNewMessage(handleNewMessage);
    
    // Cleanup function
    return () => {
      console.log('🧹 Home: Cleaning up socket listeners');
      socketService.off('newMessage');
    };
  }, [isAuthenticated, currentChatId]); // Added currentChatId as dependency

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Render functions
  const renderLoadingScreen = () => (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      backgroundColor: '#000000',
      color: '#ffffff'
    }}>
      <div>
        <h3>Loading...</h3>
        <p>Checking authentication...</p>
      </div>
    </div>
  );

  const renderLeftNav = () => {
    const currentUser = getCurrentUser();
    
    return (
      <div className="left-nav">
        <div className="organization-header">
          <div className="org-initial">{getUserInitials(currentUser)}</div>
          <div className="org-name">
            {getUserDisplayName(currentUser)}
          </div>
        </div>
        
        <nav className="nav-items">
          {['🏠 Home'].map((item, index) => (
            <div key={index} className={`nav-item ${index === 0 ? 'active' : ''}`}>
              {item}
            </div>
          ))}
        </nav>

        <div className="channels-section">
          <div className="section-header">Channels</div>
          {['# 2025-batch-lunch', '# f-fx-fun', '# f-general'].map((channel, index) => (
            <div key={index} className="channel-item">{channel}</div>
          ))}
        </div>

        {selectedWorkspace && (
          <div className="dm-section">
            <div className="section-header">Active Members</div>
            {workspaceMembers.map((user, index) => (
              <div key={user.id || index} className="dm-item">
                <span className={`status-dot ${user.status || 'online'}`}></span>
                {user.name || user.username || `User ${index + 1}`}
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 'auto', padding: '20px' }}>
          <button 
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '12px 16px',
              backgroundColor: '#ffffff',
              color: '#000000',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px'
            }}
          >
            Logout
          </button>
        </div>
      </div>
    );
  };

  const renderUsersPanel = () => {
    if (!selectedWorkspace) {
      return (
        <div className="users-panel">
          <div className="panel-header">
            <h3>Select a Workspace</h3>
            <p style={{ fontSize: '12px', color: '#666', margin: '5px 0 0 0' }}>
              Choose a workspace from the navbar to view its members
            </p>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '200px',
            color: '#666'
          }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}>🏢</span>
              <p>No workspace selected</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="users-panel">
        <div className="panel-header">
          <h3>{selectedWorkspace.name} Members</h3>
          <p style={{ fontSize: '12px', color: '#666', margin: '5px 0 0 0' }}>
            Showing members of workspace: {selectedWorkspace.name}
          </p>
        </div>
        
        <div className="users-list">
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              Loading workspace members...
            </div>
          ) : error ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
              Error: {error}
            </div>
          ) : workspaceMembers.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              No members found in this workspace
            </div>
          ) : (
            workspaceMembers.map((user, index) => (
              <div 
                key={user.id || index} 
                className={`user-item ${selectedUser?.id === user.id ? 'selected' : ''}`}
                onClick={() => handleUserSelect(user)}
              >
                <div className="user-avatar">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name || 'User'} />
                  ) : (
                    <div className="avatar-placeholder">
                      {(user.name || user.username || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="user-info">
                  <div className="user-name">{user.name || user.username || `User ${index + 1}`}</div>
                  <div className={`user-status ${user.status || 'online'}`}>
                    <span className="status-dot"></span>
                    {user.status || 'online'}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderChatPanel = () => (
    <div className="chat-panel">
      {selectedUser ? (
        <>
          <div className="chat-header">
            <div className="user-avatar">
              {selectedUser.avatar ? (
                <img src={selectedUser.avatar} alt={selectedUser.name || selectedUser.username || 'User'} />
              ) : (
                <div className="avatar-placeholder">
                  {getUserInitials(selectedUser)}
                </div>
              )}
            </div>
            <h3>{selectedUser.name || selectedUser.username || 'User'}</h3>
          </div>
          <div className="messages-container">
            {loadingMessages ? (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '200px',
                color: '#666'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div>Loading messages...</div>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '200px',
                color: '#666'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}>💬</span>
                  <p>No messages yet. Start the conversation!</p>
                </div>
              </div>
            ) : (
              <>
                {messages.map(message => (
                  <div key={message.id} className={`message ${message.isOwn ? 'own' : 'other'}`}>
                    {!message.isOwn && (
                      <div className="message-avatar">
                        {message.sender.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="message-content">
                      <div className="message-text">{message.content}</div>
                      <div className="message-time">{message.timestamp}</div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
          <div className="message-input-container">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Message ${selectedUser.name || selectedUser.username || 'User'}`}
              onKeyPress={(e) => e.key === 'Enter' && !sendingMessage && sendMessage()}
              className="message-input"
              disabled={sendingMessage || !currentChatId}
            />
            <button 
              onClick={sendMessage} 
              className="send-button"
              disabled={sendingMessage || !currentChatId || !newMessage.trim()}
            >
              {sendingMessage ? 'Sending...' : 'Send'}
            </button>
          </div>
          {!currentChatId && (
            <div style={{ padding: '10px', color: 'red', fontSize: '14px' }}>
              No chat found between you and this user.
            </div>
          )}
        </>
      ) : (
        <div className="no-chat-selected">
          <h3>Select a user to start chatting</h3>
          <p>
            {selectedWorkspace 
              ? 'Choose someone from the workspace to begin a conversation.' 
              : 'Select a workspace first, then choose a user to chat with.'}
          </p>
        </div>
      )}
    </div>
  );

  // Main render
  if (authLoading) return renderLoadingScreen();
  if (!isAuthenticated) return null;

  const currentUser = getCurrentUser();

  return (
    <div>
      <Navbar 
        auth={isAuthenticated} 
        changeAuth={setIsAuthenticated} 
        user={currentUser}
        onWorkspaceSelect={handleWorkspaceSelect}
      />
      
      {/* Socket Test Component for testing */}
      {/* <SocketTest /> */}
      
      <div className="home-container" style={{ height: 'calc(100vh - 64px)' }}>
        {renderLeftNav()}
        {renderUsersPanel()}
        {renderChatPanel()}
      </div>
    </div>
  );
};

export default Home;
