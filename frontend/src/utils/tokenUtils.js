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