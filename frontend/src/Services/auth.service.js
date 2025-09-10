import axios from "axios";
import { jwtDecode as jwt_decode } from "jwt-decode";
import { isTokenExpired, decodeToken as decodeTokenUtil } from "../utils/tokenUtils";

export const baseUrl = process.env.REACT_APP_API_BASE_URL;

// Token management functions
export const saveToken = (token) => {
  localStorage.setItem("token", token);
};

export const deleteToken = () => {
  localStorage.clear();
};

export const token = () => localStorage.getItem("token");

export const decodeToken = () => {
  const currToken = token();
  if (!currToken) {
    return null;
  }
  
  try {
    // Check if token is expired using our utility function
    if (isTokenExpired(currToken)) {
      console.log("Token expired, clearing authentication data");
      deleteToken();
      // Instead of alert, we'll let the app handle the redirect
      return null;
    }
    
    const currUser = jwt_decode(currToken);
    return currUser;
  } catch (error) {
    console.error("Error decoding token:", error);
    deleteToken();
    return null;
  }
};

// Register service function
export const registerService = async (userDto) => {
  try {
    const response = await axios.post(
      `${baseUrl}/api/users/register-user`,
      {
        name: userDto.name,
        email: userDto.email,
        password: userDto.password,
        role: userDto.role,
        OrganizationId: userDto.OrganizationId
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      }
    );
    
    return response.data;
  } catch (error) {
    console.error("Registration error:", error);
    
    if (error.response) {
      // Server responded with error status
      throw error;
    } else if (error.request) {
      // Request was made but no response received
      throw new Error("Network error. Please check your connection.");
    } else {
      // Something else happened
      throw new Error("An unexpected error occurred.");
    }
  }
};

// Account verification service
export const verifyAccountService = async (verifyDto) => {
  try {
    const response = await axios.post(
      `${baseUrl}/api/users/verify`,
      verifyDto,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Verification error:", error);
    throw error;
  }
};

// Login service function
export const loginService = async (loginDto) => {
  console.log('🔐 AuthService: Attempting login for:', loginDto.email);
  
  try {
    const response = await axios.post(
      `${baseUrl}/api/users/login`,
      loginDto,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    console.log('🔐 AuthService: Login response received:', {
      success: response.data.success,
      hasToken: !!response.data.token,
      hasUser: !!response.data.user
    });

    if (response.data.success) {
      console.log('✅ AuthService: Login successful, storing user data');
      
      // Store token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      console.log('🔐 AuthService: User data stored in localStorage');
    } else {
      console.log('❌ AuthService: Login failed - success flag is false');
    }

    return response.data;
  } catch (error) {
    console.error("❌ AuthService: Login error:", error);
    throw error;
  }
};

// Create axios instance with default config for authenticated requests
const createAuthenticatedRequest = () => {
  const t = localStorage.getItem("token");
  return {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${t}`,
    },
    timeout: 10000,
  };
};

// Get user by email
export const getUserByEmail = async (email) => {
  try {
    const config = createAuthenticatedRequest();
    const response = await axios.get(
      `${baseUrl}/api/users/getByEmail/${email}`,
      config
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

// Search users
export const searchQuery = async (query) => {
  try {
    const config = createAuthenticatedRequest();
    const response = await axios.get(
      `${baseUrl}/api/users/search?query=${encodeURIComponent(query)}`,
      config
    );
    return response.data;
  } catch (error) {
    console.error("Search error:", error);
    throw error;
  }
};

// Logout function
export const logout = () => {
  console.log('🔐 AuthService: Logging out user');
  
  // Clear all localStorage data
  localStorage.clear();
  console.log('🔐 AuthService: All localStorage data cleared');
  
  console.log('✅ AuthService: Logout completed');
};
