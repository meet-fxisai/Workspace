import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';

const Register = () => {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'member',
    organization: '',
    workspaces: []
  });

  // UI state
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Data state
  const [organizations, setOrganizations] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(false);
  const [apiError, setApiError] = useState('');

  // Registration process state
  const [registrationSteps, setRegistrationSteps] = useState({
    user: { status: 'pending', message: '' },
    workspaces: { status: 'pending', message: '' },
    chats: { status: 'pending', message: '' }
  });

  // Utility functions
  const getCurrentUser = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No token found in localStorage');
        return null;
      }

      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.warn('Invalid token format');
        return null;
      }

      const base64Url = tokenParts[1];
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

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found. Please login again.');
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const updateRegistrationStep = (step, status, message) => {
    setRegistrationSteps(prev => ({
      ...prev,
      [step]: { status, message }
    }));
  };

  // Validation
  const validateForm = () => {
    const tempErrors = {};

    // Name validation
    if (!formData.name?.trim()) {
      tempErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      tempErrors.name = 'Name must be at least 2 characters';
    } else if (formData.name.trim().length > 50) {
      tempErrors.name = 'Name must be less than 50 characters';
    }

    // Email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!formData.email?.trim()) {
      tempErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      tempErrors.email = 'Please enter a valid email address';
    } else if (formData.email.trim().length > 100) {
      tempErrors.email = 'Email must be less than 100 characters';
    }

    // Password validation
    if (!formData.password) {
      tempErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
    } else if (formData.password.length > 100) {
      tempErrors.password = 'Password must be less than 100 characters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      tempErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.confirmPassword !== formData.password) {
      tempErrors.confirmPassword = 'Passwords do not match';
    }

    // Role validation
    if (!formData.role) {
      tempErrors.role = 'Please select a role';
    } else if (!['member', 'admin'].includes(formData.role)) {
      tempErrors.role = 'Invalid role selected';
    }

    // Organization validation
    if (!formData.organization) {
      tempErrors.organization = 'Please select an organization';
    } else if (!organizations.find(org => org.id === formData.organization)) {
      tempErrors.organization = 'Invalid organization selected';
    }

    // Workspaces validation
    if (!formData.workspaces || formData.workspaces.length === 0) {
      tempErrors.workspaces = 'Please select at least one workspace';
    } else {
      const invalidWorkspaces = formData.workspaces.filter(
        wsId => !workspaces.find(ws => ws.id === wsId)
      );
      if (invalidWorkspaces.length > 0) {
        tempErrors.workspaces = 'Some selected workspaces are invalid';
      }
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Data fetching
  useEffect(() => {
    // Validate environment variables
    if (!process.env.REACT_APP_API_BASE_URL) {
      console.error('REACT_APP_API_BASE_URL is not defined');
      setApiError('Application configuration error. Please contact support.');
      toast.error('Application configuration error. Please contact support.');
      return;
    }

    const fetchOrganizations = async () => {
      try {
        setLoadingOrgs(true);
        setApiError('');

        const headers = getAuthHeaders();
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/organizations`,
          { headers }
        );

        const orgsData = response.data;
        if (!Array.isArray(orgsData)) {
          console.warn('Organizations response is not an array:', orgsData);
          setOrganizations([]);
          toast.warning('Unexpected data format for organizations');
        } else {
          setOrganizations(orgsData);
        }
      } catch (error) {
        console.error('Error fetching organizations:', error);

        if (error.response?.status === 401) {
          setApiError('Authentication failed. Please login again.');
          toast.error('Session expired. Please login again.');
          setTimeout(() => navigate('/login'), 2000);
        } else if (error.message.includes('No authentication token')) {
          setApiError('Authentication required');
          toast.error('Please login to access this page.');
          setTimeout(() => navigate('/login'), 2000);
        } else {
          setApiError('Failed to load organizations');
          toast.error('Failed to load organizations');
        }
        setOrganizations([]);
      } finally {
        setLoadingOrgs(false);
      }
    };

    fetchOrganizations();
  }, [navigate]);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      if (!formData.organization) {
        setWorkspaces([]);
        return;
      }

      try {
        setLoadingWorkspaces(true);
        setApiError('');

        const headers = getAuthHeaders();
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/workspaces/organization/${formData.organization}`,
          { headers }
        );

        const workspacesData = response.data;
        if (!Array.isArray(workspacesData)) {
          console.warn('Workspaces response is not an array:', workspacesData);
          setWorkspaces([]);
        } else {
          setWorkspaces(workspacesData);
        }

      } catch (error) {
        console.error('Error fetching workspaces:', error);

        if (error.response?.status === 404) {
          setWorkspaces([]);
          toast.info('No workspaces found for this organization');
        } else if (error.response?.status === 401) {
          setApiError('Authentication failed');
          toast.error('Authentication failed. Please login again.');
        } else {
          setApiError('Failed to load workspaces');
          toast.error('Failed to load workspaces');
          setWorkspaces([]);
        }
      } finally {
        setLoadingWorkspaces(false);
      }
    };

    fetchWorkspaces();
  }, [formData.organization]);

  // API calls
  const registerUser = async (payload) => {
    try {
      console.log('Registering user with payload:', payload);
      updateRegistrationStep('user', 'loading', 'Creating user account...');

      const headers = getAuthHeaders();
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/users/register-user`,
        payload,
        { headers }
      );

      console.log('User registration response:', response.data);
      updateRegistrationStep('user', 'success', 'User account created successfully');
      return response.data;
    } catch (error) {
      console.error('Error registering user:', error);

      let errorMessage = 'Failed to register user';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.status === 409) {
        errorMessage = 'A user with this email already exists';
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid user data provided';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
      }

      updateRegistrationStep('user', 'error', errorMessage);
      throw new Error(errorMessage);
    }
  };

  const assignUserToWorkspaces = async (userId, workspaceIds) => {
    try {
      console.log('Assigning user to workspaces:', { userId, workspaceIds });
      updateRegistrationStep('workspaces', 'loading', 'Assigning user to workspaces...');

      const headers = getAuthHeaders();
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/userworkspaces/admin/assign-workspaces`,
        {
          userId: userId,
          workspaceIds: workspaceIds
        },
        { headers }
      );

      console.log('Workspace assignment response:', response.data);
      updateRegistrationStep('workspaces', 'success', 'User assigned to workspaces successfully');
      return response.data;
    } catch (error) {
      console.error('Error assigning user to workspaces:', error);

      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        'Failed to assign user to workspaces';

      updateRegistrationStep('workspaces', 'error', errorMessage);
      throw new Error(errorMessage);
    }
  };

  const createChatsForUser = async (userId, workspaceIds) => {
    try {
      console.log('Creating chats for user in workspaces:', { userId, workspaceIds });
      updateRegistrationStep('chats', 'loading', 'Creating chats for user...');

      const chatResults = [];
      const headers = getAuthHeaders();

      for (const workspaceId of workspaceIds) {
        try {
          console.log(`Creating chats for user ${userId} in workspace ${workspaceId}`);

          const response = await axios.post(
            `${process.env.REACT_APP_API_BASE_URL}/api/chats/workspace/create-chats`,
            {
              userId: userId,
              workspaceId: workspaceId
            },
            { headers }
          );

          console.log(`Chat creation response for workspace ${workspaceId}:`, response.data);
          chatResults.push({
            workspaceId,
            success: true,
            data: response.data
          });
        } catch (chatError) {
          console.error(`Error creating chats for workspace ${workspaceId}:`, chatError);
          chatResults.push({
            workspaceId,
            success: false,
            error: chatError.response?.data?.message || chatError.message
          });
        }
      }

      const successfulChats = chatResults.filter(result => result.success);
      const failedChats = chatResults.filter(result => !result.success);

      if (successfulChats.length === workspaceIds.length) {
        updateRegistrationStep('chats', 'success', 'All chats created successfully');
      } else if (successfulChats.length > 0) {
        updateRegistrationStep('chats', 'warning',
          `Chats created for ${successfulChats.length}/${workspaceIds.length} workspaces`);
      } else {
        updateRegistrationStep('chats', 'error', 'Failed to create chats for any workspace');
      }

      return chatResults;
    } catch (error) {
      console.error('Error in chat creation process:', error);
      updateRegistrationStep('chats', 'error', 'Failed to create chats for user');
      throw new Error('Failed to create chats for user');
    }
  };

  // Event handlers
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData(prev => {
      const newFormData = {
        ...prev,
        [name]: value
      };

      if (name === 'organization') {
        newFormData.workspaces = [];
      }

      return newFormData;
    });

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    if (name === 'organization' && errors.workspaces) {
      setErrors(prev => ({
        ...prev,
        workspaces: ''
      }));
    }
  };

  const handleWorkspaceChange = (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      workspaces: typeof value === 'string' ? value.split(',') : value
    }));

    if (errors.workspaces) {
      setErrors(prev => ({
        ...prev,
        workspaces: ''
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'member',
      organization: '',
      workspaces: []
    });
    setErrors({});
    setRegistrationSteps({
      user: { status: 'pending', message: '' },
      workspaces: { status: 'pending', message: '' },
      chats: { status: 'pending', message: '' }
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);
    setApiError('');

    try {
      // Step 1: Register the user
      const userPayload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role,
        OrganizationId: formData.organization
      };

      const registerResponse = await registerUser(userPayload);

      // Extract user ID from response
      let userId = null;
      if (registerResponse.user?.id) {
        userId = registerResponse.user.id;
      } else if (registerResponse.id) {
        userId = registerResponse.id;
      } else if (registerResponse.data?.id) {
        userId = registerResponse.data.id;
      } else if (registerResponse.data?.user?.id) {
        userId = registerResponse.data.user.id;
      }

      if (!userId) {
        console.error('Full registration response:', registerResponse);
        throw new Error('User ID not found in registration response. Please check the response format.');
      }

      console.log('User registered successfully with ID:', userId);

      // Step 2: Assign user to workspaces
      if (formData.workspaces.length > 0) {
        try {
          await assignUserToWorkspaces(userId, formData.workspaces);

          // Step 3: Create chats for user in workspaces
          try {
            await createChatsForUser(userId, formData.workspaces);
          } catch (chatError) {
            console.error('Error creating chats:', chatError);
            // Don't fail the entire process for chat errors
          }

        } catch (assignError) {
          console.error('Error assigning user to workspaces:', assignError);
          // Don't attempt chat creation if workspace assignment failed
        }
      }

      toast.success('User registration process completed successfully!');
      resetForm();

    } catch (error) {
      console.error('Registration process error:', error);
      const errorMessage = error.message || 'Registration failed. Please try again.';
      setApiError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Computed values
  const currentUser = getCurrentUser();
  const isFormDisabled = loading || loadingOrgs || loadingWorkspaces;

  const getStepIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'loading': return '⏳';
      default: return '⏸️';
    }
  };

  const getStepColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'loading': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div>
      <Navbar auth={true} changeAuth={() => { }} user={currentUser} />


      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 pt-auto">
        <div className="flex flex-col items-center bg-white justify-center p-6 border-2 rounded-lg shadow-lg max-w-2xl w-full max-h-screen overflow-y-auto">
          <h1 className="text-3xl text-black font-bold mb-4 underline">
            Register New User
          </h1>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 w-full">
            <div className="flex items-start">
              <div className="text-blue-600 mr-2">ℹ️</div>
              <p className="text-blue-800 text-xs">
                You are registering a new user for your organization. This will create the user, assign them to selected workspaces, and create necessary chats.
              </p>
            </div>
          </div>

          {apiError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 w-full">
              <div className="flex items-start">
                <div className="text-red-600 mr-2">❌</div>
                <p className="text-red-800 text-xs">{apiError}</p>
              </div>
            </div>
          )}

          {/* Registration Progress */}
          {loading && (
            <div className="mb-4 w-full">
              <h2 className="text-sm font-semibold mb-2 text-gray-800">Registration Progress:</h2>

              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="mr-2 text-sm">{getStepIcon(registrationSteps.user.status)}</span>
                  <span className={`text-xs ${getStepColor(registrationSteps.user.status)}`}>
                    User Creation: {registrationSteps.user.message || 'Waiting...'}
                  </span>
                </div>

                <div className="flex items-center">
                  <span className="mr-2 text-sm">{getStepIcon(registrationSteps.workspaces.status)}</span>
                  <span className={`text-xs ${getStepColor(registrationSteps.workspaces.status)}`}>
                    Workspace Assignment: {registrationSteps.workspaces.message || 'Waiting...'}
                  </span>
                </div>

                <div className="flex items-center">
                  <span className="mr-2 text-sm">{getStepIcon(registrationSteps.chats.status)}</span>
                  <span className={`text-xs ${getStepColor(registrationSteps.chats.status)}`}>
                    Chat Creation: {registrationSteps.chats.message || 'Waiting...'}
                  </span>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 w-full">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  } ${isFormDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                value={formData.name}
                onChange={handleChange}
                disabled={isFormDisabled}
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

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
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  } ${isFormDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                value={formData.email}
                onChange={handleChange}
                disabled={isFormDisabled}
                placeholder="Enter your email address"
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
                  className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    } ${isFormDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isFormDisabled}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isFormDisabled}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    } ${isFormDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isFormDisabled}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isFormDisabled}
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
              <div className="flex space-x-6">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="member"
                    checked={formData.role === 'member'}
                    onChange={handleChange}
                    disabled={isFormDisabled}
                    className="h-4 w-4 text-black focus:ring-black border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Member</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={formData.role === 'admin'}
                    onChange={handleChange}
                    disabled={isFormDisabled}
                    className="h-4 w-4 text-black focus:ring-black border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Admin</span>
                </label>
              </div>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role}</p>
              )}
            </div>

            {/* Organization Selection */}
            <div>
              <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-1">
                Organization *
              </label>
              <select
                id="organization"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                disabled={isFormDisabled}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${errors.organization ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  } ${isFormDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              >
                <option value="">Select an organization</option>
                {loadingOrgs ? (
                  <option disabled>⏳ Loading organizations...</option>
                ) : organizations.length === 0 ? (
                  <option disabled>No organizations available</option>
                ) : (
                  organizations.map(org => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))
                )}
              </select>
              {errors.organization && (
                <p className="mt-1 text-sm text-red-600">{errors.organization}</p>
              )}
            </div>

            {/* Workspace Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Workspaces *
              </label>
              <div className={`border rounded-md p-3 max-h-32 overflow-y-auto ${errors.workspaces ? 'border-red-500 bg-red-50' : 'border-gray-300'} ${isFormDisabled || !formData.organization ? 'bg-gray-100' : 'bg-white'
                }`}>
                {!formData.organization ? (
                  <p className="text-gray-500 text-sm">Please select an organization first</p>
                ) : loadingWorkspaces ? (
                  <p className="text-gray-500 text-sm">⏳ Loading workspaces...</p>
                ) : workspaces.length === 0 ? (
                  <p className="text-gray-500 text-sm">No workspaces available for this organization</p>
                ) : (
                  <div className="space-y-2">
                    {workspaces.map(workspace => (
                      <label key={workspace.id} className="flex items-center">
                        <input
                          type="checkbox"
                          value={workspace.id}
                          checked={formData.workspaces.includes(workspace.id)}
                          onChange={(e) => {
                            const value = e.target.value;
                            const isChecked = e.target.checked;
                            setFormData(prev => ({
                              ...prev,
                              workspaces: isChecked
                                ? [...prev.workspaces, value]
                                : prev.workspaces.filter(id => id !== value)
                            }));
                            if (errors.workspaces) {
                              setErrors(prev => ({ ...prev, workspaces: '' }));
                            }
                          }}
                          disabled={isFormDisabled}
                          className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{workspace.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected workspaces display */}
              {formData.workspaces.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-600 mb-1">Selected: {formData.workspaces.length} workspace(s)</p>
                  <div className="flex flex-wrap gap-1">
                    {formData.workspaces.slice(0, 3).map(wsId => {
                      const workspace = workspaces.find(w => w.id === wsId);
                      return (
                        <span
                          key={wsId}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {workspace?.name || wsId}
                        </span>
                      );
                    })}
                    {formData.workspaces.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        +{formData.workspaces.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {errors.workspaces && (
                <p className="mt-1 text-sm text-red-600">{errors.workspaces}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isFormDisabled}
              className={`w-full mt-6 py-3 px-4 font-medium rounded-md text-white transition-colors duration-200 ${isFormDisabled
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2'
                }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing Registration...
                </div>
              ) : (
                'Register User'
              )}
            </button>
          </form>

          {/* Navigation */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => navigate('/home')}
              disabled={loading}
              className={`font-bold text-black hover:text-gray-800 underline focus:outline-none ${loading ? 'cursor-not-allowed opacity-50' : ''
                }`}
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;