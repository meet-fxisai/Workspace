import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
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
      
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 pt-20">
        <div className="flex flex-col items-center bg-white justify-center p-6 border-2 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-3xl text-black font-bold mb-6 underline">
            Login
          </h1>

          <form className="space-y-4 w-full mt-4" onSubmit={handleSubmit} noValidate>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                disabled={loading}
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                  errors.email 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300 hover:border-gray-400'
                } ${loading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={loading}
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                    errors.password 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  } ${loading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-6 py-3 px-4 bg-black text-white font-medium rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Logging in...
                </div>
              ) : (
                'Login'
              )}
            </button>
          </form>

          {/* Switch to Register */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button 
                type="button"
                onClick={() => switchFn(false)}
                className="font-bold text-black hover:text-gray-800 underline focus:outline-none"
              >
                Register here
              </button>
            </p>
          </div>

          {/* Debug button - remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <button 
              onClick={checkLocalStorage}
              className="mt-4 text-xs text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              Debug: Check Token
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
