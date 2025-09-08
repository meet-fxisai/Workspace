import React, { useEffect, useState, useMemo } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
  IconButton
} from "@mui/material";
import LogoutIcon from '@mui/icons-material/Logout';
import ChatIcon from "@mui/icons-material/Chat";
import WorkspacesIcon from '@mui/icons-material/Workspaces';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { deleteToken } from "../Services/auth.service";
import socketService from '../Services/socket.service';
import { useNavigate } from "react-router-dom";

export default function Navbar({ switchFn, auth, changeAuth, user, onWorkspaceSelect }) {
  const [open, setOpen] = useState(false);
  const [currAvatar, setcurrAvatar] = useState("");
  const [workspaces, setWorkspaces] = useState([]);
  const [workspaceMenuAnchor, setWorkspaceMenuAnchor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const navigate = useNavigate();

  // Function to get current user from token
  const getCurrentUser = () => {
    try {
      const token = localStorage.getItem('token');
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

  // Memoize currentUser to prevent unnecessary re-renders
  const currentUser = useMemo(() => getCurrentUser(), [auth]);
  const isAdmin = currentUser?.role === 'admin';

  // Function to fetch user workspaces - works for all users including admins
  const fetchUserWorkspaces = async () => {
    if (!currentUser?.id) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // console.log('Using token:', token);
      // console.log('Fetching workspaces for user:', currentUser.id, 'Role:', currentUser.role);
      
      const response = await fetch(`http://localhost:3000/api/userworkspaces/user/${currentUser.id}/workspaces`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Workspace API response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched workspaces:', data);
        // Extract workspaces array from the response object
        const workspacesArray = data.workspaces || [];
        setWorkspaces(workspacesArray);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch workspaces. Status:', response.status, 'Error:', errorText);
        // Set empty array on error - this will show "No workspaces available"
        setWorkspaces([]);
      }
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      // Set empty array on error - this will show "No workspaces available"
      setWorkspaces([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      if (user.gender === "Male") {
        setcurrAvatar("male.png");
      } else {
        setcurrAvatar("female.png");
      }
    }
  }, [user]);

  // Fetch workspaces for ALL authenticated users (including admins)
  useEffect(() => {
    if (auth && currentUser?.id) {
      fetchUserWorkspaces();
    }
  }, [auth, currentUser?.id]);

  const handleLogoClick = () => {
    if(auth)
      navigate("/home");
    else
      navigate('/') // Navigate to home page
  };

  const handleRegisterUser = () => {
    navigate('/register');
  };

  const handleWorkspaceMenuOpen = (event) => {
    setWorkspaceMenuAnchor(event.currentTarget);
  };

  const handleWorkspaceMenuClose = () => {
    setWorkspaceMenuAnchor(null);
  };

  const handleWorkspaceSelect = (workspace) => {
    // Set the selected workspace
    setSelectedWorkspace(workspace);
    console.log('Selected workspace:', workspace);
    
    // Call the callback function to notify parent component
    if (onWorkspaceSelect) {
      onWorkspaceSelect(workspace);
    }
    
    handleWorkspaceMenuClose();
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: "black" }}> 
      <Toolbar className="flex justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={handleLogoClick}>
          <ChatIcon  sx={{ color: "white" }} />
          <Typography variant="h5" sx={{ color: "white" }}>
            QuickChat
          </Typography>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {auth && (
            <>
              {/* Workspaces Dropdown - Show for ALL authenticated users */}
              <Button
                variant="outlined"
                onClick={handleWorkspaceMenuOpen}
                disabled={loading}
                startIcon={<WorkspacesIcon />}
                endIcon={<ExpandMoreIcon />}
                sx={{
                  color: '#ffffff',
                  borderColor: '#ffffff',
                  textTransform: 'none',
                  fontWeight: '600',
                  fontSize: '14px',
                  padding: '6px 16px',
                  '&:hover': {
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    borderColor: '#ffffff'
                  }
                }}
              >
                {loading ? 'Loading...' : (selectedWorkspace ? selectedWorkspace.name : 'Workspaces')}
              </Button>

              <Menu
                anchorEl={workspaceMenuAnchor}
                open={Boolean(workspaceMenuAnchor)}
                onClose={handleWorkspaceMenuClose}
                PaperProps={{
                  sx: {
                    maxHeight: 200,
                    minWidth: 200
                  }
                }}
              >
                {!Array.isArray(workspaces) || workspaces.length === 0 ? (
                  <MenuItem disabled>
                    {loading ? 'Loading workspaces...' : 'No workspaces available'}
                  </MenuItem>
                ) : (
                  workspaces.map((workspace) => (
                    <MenuItem
                      key={workspace.id}
                      onClick={() => handleWorkspaceSelect(workspace)}
                      selected={selectedWorkspace?.id === workspace.id}
                    >
                      {workspace.name}
                    </MenuItem>
                  ))
                )}
              </Menu>

              {/* Admin-only Register User button */}
              {isAdmin && (
                <Button
                  variant="outlined"
                  onClick={handleRegisterUser}
                  sx={{
                    color: '#ffffff',
                    borderColor: '#ffffff',
                    textTransform: 'none',
                    fontWeight: '600',
                    fontSize: '14px',
                    padding: '6px 16px',
                    '&:hover': {
                      backgroundColor: '#ffffff',
                      color: '#000000',
                      borderColor: '#ffffff'
                    }
                  }}
                >
                  Register User
                </Button>
              )}

              {/* Logout Button */}
              <IconButton
                onClick={() => {
                  console.log('Logout clicked from Navbar');
                  // Clear all localStorage data
                  localStorage.clear();
                  
                  // Disconnect socket
                  if (typeof socketService !== 'undefined' && socketService.disconnect) {
                    socketService.disconnect();
                  }
                  
                  // Update auth state
                  if (changeAuth) {
                    changeAuth(false);
                  }
                  
                  // Navigate to login
                  navigate('/login');
                }}
                sx={{
                  color: '#ffffff',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
                title="Logout"
              >
                <LogoutIcon />
              </IconButton>

            </>
          )}

         
        </div>
      </Toolbar>
    </AppBar>
  );
}
