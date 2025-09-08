export const decodeToken = (token) => {
  try {
    if (!token) return null;
    
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

export const isTokenExpired = (token) => {
  try {
    if (!token) return true;
    
    const decodedToken = decodeToken(token);
    if (!decodedToken || !decodedToken.exp) return true;
    
    const currentTime = Date.now() / 1000; // Convert to seconds
    return decodedToken.exp < currentTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

export const getTokenExpirationTime = (token) => {
  try {
    const decodedToken = decodeToken(token);
    if (!decodedToken || !decodedToken.exp) return null;
    
    return new Date(decodedToken.exp * 1000); // Convert to milliseconds
  } catch (error) {
    console.error('Error getting token expiration time:', error);
    return null;
  }
};

export const getTimeUntilExpiration = (token) => {
  try {
    const expirationTime = getTokenExpirationTime(token);
    if (!expirationTime) return null;
    
    const currentTime = new Date();
    const timeUntilExpiration = expirationTime.getTime() - currentTime.getTime();
    
    if (timeUntilExpiration <= 0) return 0;
    
    return timeUntilExpiration; // Returns milliseconds
  } catch (error) {
    console.error('Error calculating time until expiration:', error);
    return null;
  }
};

export const getOrgIdFromToken = () => {
  const token = localStorage.getItem('token');
  const decodedToken = decodeToken(token);
  return decodedToken?.orgId || null;
};

export const getUserIdFromToken = () => {
  const token = localStorage.getItem('token');
  const decodedToken = decodeToken(token);
  return decodedToken?.id || null;
};