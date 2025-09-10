import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { decodeToken, isTokenExpired } from '../utils/tokenUtils';

export const useAuth = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const getTokenFromStorage = () => localStorage.getItem('token');
  
  const isTokenValid = (token) => {
    if (!token) return false;
    return !isTokenExpired(token);
  };

  const clearTokenAndRedirect = () => {
    localStorage.clear();
    navigate('/login');
  };

  const checkAuthentication = () => {
    const token = getTokenFromStorage();
    if (!token) return false;
    
    if (!isTokenValid(token)) {
      console.log('Token expired, clearing authentication data');
      localStorage.clear();
      return false;
    }
    
    const decodedToken = decodeToken(token);
    if (!decodedToken) return false;
    
    setCurrentUser(decodedToken);
    return true;
  };

  const getCurrentUser = () => {
    const token = getTokenFromStorage();
    return decodeToken(token);
  };

  const handleLogout = () => {
    console.log('🚪 Auth: Logout initiated');
    localStorage.clear();
    setIsAuthenticated(false);
    setCurrentUser(null);
    navigate('/login');
  };

  useEffect(() => {
    console.log('🔄 Auth: useEffect triggered - checking authentication');
    setAuthLoading(true);
    
    if (!checkAuthentication()) {
      console.log('🔄 Auth: Authentication failed, redirecting');
      navigate('/login');
      return;
    }
    
    console.log('🔄 Auth: Authentication successful');
    setIsAuthenticated(true);
    setAuthLoading(false);
  }, [navigate]);

  return {
    isAuthenticated,
    authLoading,
    currentUser,
    getTokenFromStorage,
    clearTokenAndRedirect,
    getCurrentUser,
    handleLogout,
    setIsAuthenticated
  };
};
