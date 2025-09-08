import socketService from '../Services/socket.service';
import { isTokenExpired } from './tokenUtils';

// Utility functions for handling user data and tokens

export const getToken = () => {
  try {
    return localStorage.getItem('token');
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

export const getUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

export const isAuthenticated = () => {
  const token = getToken();
  const user = getUser();
  
  // Check if token exists and is not expired
  if (!token || isTokenExpired(token)) {
    // Clear expired token and user data
    clearUserData();
    return false;
  }
  
  return !!(token && user);
};

export const clearUserData = () => {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Disconnect socket when clearing user data
    socketService.disconnect();
    
    return true;
  } catch (error) {
    console.error('Error clearing user data:', error);
    return false;
  }
};

export const setUserData = (token, user) => {
  try {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    return true;
  } catch (error) {
    console.error('Error setting user data:', error);
    return false;
  }
};

export const logout = () => {
  console.log('Logging out user...');
  const success = clearUserData();
  if (success) {
    console.log('User logged out successfully');
  }
  return success;
};
