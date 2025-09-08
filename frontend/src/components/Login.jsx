import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  CircularProgress, 
  IconButton, 
  InputAdornment,
  Box,
  Typography
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { loginService } from '../Services/auth.service';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import socketService from '../Services/socket.service';

export default function Login({ changeAuth, switchFn }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Function to save token and user data to localStorage
  const saveToStorage = (token, user) => {
    try {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      console.log('Token and user data saved to localStorage');
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  };

  // Function to connect to socket after login
  const connectToSocket = (user) => {
    try {
      // Connect to socket server
      socketService.connect('http://localhost:3000');
      
      // Add user to online users list
      socketService.addUser(user.id, user.email, user.name);
      
      // Listen for online users updates
      socketService.onOnlineUsers((onlineUsers) => {
        console.log('Online users updated:', onlineUsers);
      });

      console.log('Socket connection established for user:', user.name);
      return true;
    } catch (error) {
      console.error('Error connecting to socket:', error);
      return false;
    }
  };

  // Function to verify token and user data are saved
  const verifyDataSaved = () => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    console.log('Data verification - token:', !!savedToken, 'user:', !!savedUser);
    return !!savedToken && !!savedUser;
  };

  // Validation function
  const validateForm = () => {
    const tempErrors = {};
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      tempErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      tempErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      tempErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Handle input changes
  const handleChange = (event) => {
    const { name, value } = event.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for the field being modified
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);
    
    try {
      const payload = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      };

      console.log('Sending login request with payload:', payload);
      const response = await loginService(payload);
      console.log('Login response received:', response);
      
      // Check if response contains token and user data
      if (response && response.token && response.user) {
        console.log('Token and user data found in response');
        
        // Save token and user data to localStorage
        const dataSaved = saveToStorage(response.token, response.user);
        
        if (dataSaved) {
          // Verify data was actually saved
          const isVerified = verifyDataSaved();
          
          if (isVerified) {
            // Connect to socket
            const socketConnected = connectToSocket(response.user);
            
            if (socketConnected) {
              toast.success(response.message || 'Login successful! Connected to chat.');
            } else {
              toast.success(response.message || 'Login successful!');
              toast.warning('Chat connection failed, but you can still use the app.');
            }
            
            // Reset form
            setFormData({
              email: '',
              password: ''
            });
            
            // Update auth state
            if (changeAuth) {
              changeAuth(true);
            }
            if (switchFn) {
              switchFn(true);
            }
            
            // Navigate to home page
            console.log('Navigating to /home');
            navigate('/home');
          } else {
            throw new Error('Failed to verify data storage');
          }
        } else {
          throw new Error('Failed to save data to localStorage');
        }
      } else {
        console.error('Incomplete response data:', response);
        throw new Error('Incomplete authentication data received from server');
      }
      
    } catch (error) {
      console.error('Login error:', error);
      
      // Clear any existing token on error
      localStorage.removeItem('token');
      
      let errorMessage;
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      } else {
        errorMessage = 'Login failed. Please try again.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Debug function to check localStorage
  const checkLocalStorage = () => {
    const token = localStorage.getItem('token');
    console.log('Current token in localStorage:', token);
    return token;
  };

  // Optional: Add a useEffect to check localStorage on component mount
  React.useEffect(() => {
    console.log('Login component mounted, checking existing token...');
    checkLocalStorage();
  }, []);

  return (
    <div>
      <Navbar switchFn={switchFn} auth={false} changeAuth={changeAuth} user={null} />
      
      <Box 
        sx={{ 
          minHeight: 'calc(100vh - 64px)', // Subtract navbar height
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          padding: 2
        }}
      >
        <Box className="flex flex-col items-center bg-white justify-center p-6 border-2 rounded-lg shadow-lg max-w-md w-full">
          <Typography variant="h4" className="text-black font-bold mb-6 underline">
            Login
          </Typography>

          <Box component="form" className="space-y-4 w-full mt-4" onSubmit={handleSubmit} noValidate>
            {/* Email Field */}
            <TextField
              name="email"
              type="email"
              label="Email Address"
              variant="outlined"
              fullWidth
              required
              error={!!errors.email}
              helperText={errors.email}
              onChange={handleChange}
              value={formData.email}
              disabled={loading}
            />

            {/* Password Field */}
            <TextField
              name="password"
              type={showPassword ? "text" : "password"}
              label="Password"
              variant="outlined"
              fullWidth
              required
              error={!!errors.password}
              helperText={errors.password}
              onChange={handleChange}
              value={formData.password}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            {/* Submit Button */}
            <Button 
              type="submit" 
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 3,
                py: 1.5,
                backgroundColor: "black",
                color: "white",
                "&:hover": {
                  backgroundColor: "gray.800",
                },
                "&:disabled": {
                  backgroundColor: "gray.400",
                }
              }}
            >
              {loading ? (
                <>
                  <CircularProgress size={20} sx={{ color: 'white', mr: 1 }} />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </Box>

          {/* Switch to Register */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              Don't have an account?{' '}
              <Button 
                variant="text" 
                onClick={() => switchFn(false)}
                sx={{ textTransform: 'none', fontWeight: 'bold' }}
              >
                Register here
              </Button>
            </Typography>
          </Box>

          {/* Debug button - remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <Button 
              onClick={checkLocalStorage}
              size="small"
              sx={{ mt: 2, color: 'gray' }}
            >
              Debug: Check Token
            </Button>
          )}
        </Box>
      </Box>
    </div>
  );
}
