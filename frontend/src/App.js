import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import socketService from './Services/socket.service';
import { isAuthenticated } from './utils/userUtils';

// Import your components
import Login from './components/Login';
import Register from './components/Register';
import Home from './pages/Home';
import Landing from './pages/Landing';
import Chat from './pages/Chat';
import Account from './pages/Account';
import Explore from './pages/Explore';
import Requests from './pages/Requests';
import PageNotFound from './pages/PageNotFound';

// Protected Route Component (for authenticated users only)
const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  // Validate token expiration
  try {
    const token = localStorage.getItem('token');
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const decodedToken = JSON.parse(jsonPayload);
    
    // Check if token is expired
    const currentTime = Date.now() / 1000;
    if (decodedToken.exp < currentTime) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return <Navigate to="/login" replace />;
    }
  } catch (error) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Public Route Component (redirects to home if already logged in)
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window.atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const decodedToken = JSON.parse(jsonPayload);
      
      // Check if token is not expired
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp > currentTime) {
        return <Navigate to="/home" replace />;
      }
    } catch (error) {
      localStorage.removeItem('token');
    }
  }
  
  return children;
};

function App() {
  useEffect(() => {
    console.log('🚀 App: Component mounted');
    
    // Check if user is already logged in and connect to socket
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      console.log('🔐 App: Found existing token and user data');
      
      try {
        const userData = JSON.parse(user);
        console.log('🔐 App: Parsed user data:', { id: userData.id, email: userData.email });
        
        // Connect to socket if user is already logged in
        if (!socketService.getConnectionStatus()) {
          console.log('🔌 App: Connecting to socket for existing user');
          socketService.connect('http://localhost:3000');
          socketService.addUser(userData.id, userData.email, userData.name);
          
          // Listen for online users
          socketService.onOnlineUsers((onlineUsers) => {
            console.log('👥 App: Online users updated:', onlineUsers.length);
          });
        }
      } catch (error) {
        console.error('❌ App: Error parsing user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    } else {
      console.log('🔐 App: No existing login found');
    }

    // Cleanup function
    return () => {
      console.log('🧹 App: Component unmounting, cleaning up socket');
    };
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes (only accessible when NOT logged in) */}
          <Route 
            path="/" 
            element={
              <PublicRoute>
                <Landing />
              </PublicRoute>
            } 
          />
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          
          {/* Protected Routes (only accessible when logged in) */}
          <Route 
            path="/register" 
            element={
              <ProtectedRoute>
                <Register />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/home" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/chat" 
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/account" 
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/explore" 
            element={
              <ProtectedRoute>
                <Explore />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/requests" 
            element={
              <ProtectedRoute>
                <Requests />
              </ProtectedRoute>
            } 
          />
          
          {/* 404 Page */}
          <Route path="*" element={<PageNotFound />} />
        </Routes>
        
        {/* Toast Container for notifications */}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </Router>
  );
}

export default App;
