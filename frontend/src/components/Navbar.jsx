import React, { useEffect, useState, useMemo, useCallback } from "react";
import { 
  LogOut, 
  MessageCircle, 
  Layers, 
  ChevronDown, 
  Menu, 
  X 
} from 'lucide-react';
import socketService from '../Services/socket.service';
import { useNavigate } from "react-router-dom";

export default function Navbar({ switchFn, auth, changeAuth, user, onWorkspaceSelect }) {
  const [workspaces, setWorkspaces] = useState([]);
  const [workspaceMenuAnchor, setWorkspaceMenuAnchor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
  const currentUser = useMemo(() => getCurrentUser(), []);
  const isAdmin = currentUser?.role === 'admin';

  // Function to fetch user workspaces - works for all users including admins
  const fetchUserWorkspaces = useCallback(async () => {
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
  }, [currentUser?.id]);

  useEffect(() => {
    if (user) {
      // Avatar logic can be added here if needed in the future
    }
  }, [user]);

  // Fetch workspaces for ALL authenticated users (including admins)
  useEffect(() => {
    if (auth && currentUser?.id) {
      fetchUserWorkspaces();
    }
  }, [auth, currentUser?.id, fetchUserWorkspaces]);

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
    setMobileMenuOpen(false); // Close mobile menu on selection
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
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
    setMobileMenuOpen(false); // Close mobile menu
  };

  return (
    <nav className="bg-black text-white shadow-lg">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div 
            className="flex items-center gap-2 cursor-pointer hover:text-gray-300 transition-colors duration-200" 
            onClick={handleLogoClick}
          >
            <MessageCircle className="w-6 h-6 text-white" />
            <h1 className="text-xl font-semibold">QuickChat</h1>
          </div>

          {/* Desktop Navigation */}
          {auth && (
            <div className="hidden md:flex items-center space-x-4">
              {/* Workspaces Dropdown */}
              <div className="relative">
                <button
                  onClick={handleWorkspaceMenuOpen}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 border border-white rounded-md text-white text-sm font-medium hover:bg-white hover:text-black transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Layers className="w-4 h-4" />
                  {loading ? 'Loading...' : (selectedWorkspace ? selectedWorkspace.name : 'Workspaces')}
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* Dropdown Menu */}
                {workspaceMenuAnchor && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
                    <div className="py-1">
                      {!Array.isArray(workspaces) || workspaces.length === 0 ? (
                        <div className="px-4 py-2 text-sm text-gray-500 cursor-not-allowed">
                          {loading ? 'Loading workspaces...' : 'No workspaces available'}
                        </div>
                      ) : (
                        workspaces.map((workspace) => (
                          <button
                            key={workspace.id}
                            onClick={() => handleWorkspaceSelect(workspace)}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors duration-150 ${
                              selectedWorkspace?.id === workspace.id ? 'bg-gray-100 text-black font-medium' : 'text-gray-700'
                            }`}
                          >
                            {workspace.name}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Admin-only Register User button */}
              {isAdmin && (
                <button
                  onClick={handleRegisterUser}
                  className="px-4 py-2 border border-white rounded-md text-white text-sm font-medium hover:bg-white hover:text-black transition-colors duration-200"
                >
                  Register User
                </button>
              )}

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-2 rounded-md text-white hover:bg-white hover:bg-opacity-10 transition-colors duration-200"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Mobile menu button */}
          {auth && (
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-md text-white hover:bg-white hover:bg-opacity-10 transition-colors duration-200"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Mobile Navigation Menu */}
        {auth && mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-700">
              {/* Mobile Workspaces Section */}
              <div className="space-y-2">
                <button
                  onClick={handleWorkspaceMenuOpen}
                  disabled={loading}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-md text-white text-sm font-medium border border-white hover:bg-white hover:text-black transition-colors duration-200 disabled:opacity-50"
                >
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    {loading ? 'Loading...' : (selectedWorkspace ? selectedWorkspace.name : 'Workspaces')}
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* Mobile Workspaces Dropdown */}
                {workspaceMenuAnchor && (
                  <div className="bg-gray-800 rounded-md max-h-48 overflow-y-auto">
                    {!Array.isArray(workspaces) || workspaces.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-gray-400">
                        {loading ? 'Loading workspaces...' : 'No workspaces available'}
                      </div>
                    ) : (
                      workspaces.map((workspace) => (
                        <button
                          key={workspace.id}
                          onClick={() => handleWorkspaceSelect(workspace)}
                          className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors duration-150 ${
                            selectedWorkspace?.id === workspace.id 
                              ? 'bg-gray-600 text-white font-medium' 
                              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          }`}
                        >
                          {workspace.name}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Mobile Admin Register Button */}
              {isAdmin && (
                <button
                  onClick={() => {
                    handleRegisterUser();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-white text-sm font-medium border border-white hover:bg-white hover:text-black transition-colors duration-200"
                >
                  Register User
                </button>
              )}

              {/* Mobile Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-white text-sm font-medium hover:bg-red-600 transition-colors duration-200"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Backdrop for closing dropdown */}
      {workspaceMenuAnchor && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={handleWorkspaceMenuClose}
        />
      )}
    </nav>
  );
}
