import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  Button, 
  FormControl, 
  FormLabel, 
  RadioGroup, 
  FormControlLabel, 
  Radio, 
  Select, 
  MenuItem, 
  InputLabel, 
  CircularProgress, 
  IconButton, 
  InputAdornment,
  Box,
  Typography,
  Alert,
  Chip,
  OutlinedInput,
  Paper,
  Container
} from '@mui/material';
import { Visibility, VisibilityOff, CheckCircle, Error } from '@mui/icons-material';
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
      case 'success': return <CheckCircle color="success" />;
      case 'error': return <Error color="error" />;
      case 'loading': return <CircularProgress size={20} />;
      default: return null;
    }
  };

  const getStepColor = (status) => {
    switch (status) {
      case 'success': return 'success';
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'loading': return 'info';
      default: return 'default';
    }
  };

  return (
    <div>
      <Navbar auth={true} changeAuth={() => {}} user={currentUser} />
      
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
            Register New User
          </Typography>

          <Alert severity="info" sx={{ mb: 3 }}>
            You are registering a new user for your organization. This will create the user, assign them to selected workspaces, and create necessary chats.
          </Alert>

          {apiError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {apiError}
            </Alert>
          )}

          {/* Registration Progress */}
          {loading && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>Registration Progress:</Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                {getStepIcon(registrationSteps.user.status)}
                <Typography sx={{ ml: 1 }}>
                  User Creation: {registrationSteps.user.message || 'Waiting...'}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                {getStepIcon(registrationSteps.workspaces.status)}
                <Typography sx={{ ml: 1 }}>
                  Workspace Assignment: {registrationSteps.workspaces.message || 'Waiting...'}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                {getStepIcon(registrationSteps.chats.status)}
                <Typography sx={{ ml: 1 }}>
                  Chat Creation: {registrationSteps.chats.message || 'Waiting...'}
                </Typography>
              </Box>
            </Box>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            {/* Name Field */}
            <TextField
              name="name"
              label="Full Name"
              variant="outlined"
              fullWidth
              required
              error={!!errors.name}
              helperText={errors.name}
              onChange={handleChange}
              value={formData.name}
              disabled={isFormDisabled}
              sx={{ mb: 2 }}
            />

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
              disabled={isFormDisabled}
              sx={{ mb: 2 }}
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
              disabled={isFormDisabled}
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={isFormDisabled}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            {/* Confirm Password Field */}
            <TextField
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              label="Confirm Password"
              variant="outlined"
              fullWidth
              required
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              onChange={handleChange}
              value={formData.confirmPassword}
              disabled={isFormDisabled}
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                      disabled={isFormDisabled}
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            {/* Role Selection */}
            <FormControl component="fieldset" error={!!errors.role} fullWidth sx={{ mb: 2 }}>
              <FormLabel component="legend" required>Role</FormLabel>
              <RadioGroup
                row
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <FormControlLabel 
                  value="member" 
                  control={<Radio />} 
                  label="Member" 
                  disabled={isFormDisabled}
                />
                <FormControlLabel 
                  value="admin" 
                  control={<Radio />} 
                  label="Admin" 
                  disabled={isFormDisabled}
                />
              </RadioGroup>
              {errors.role && (
                <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                  {errors.role}
                </Typography>
              )}
            </FormControl>

            {/* Organization Selection */}
            <FormControl fullWidth error={!!errors.organization} sx={{ mb: 2 }}>
              <InputLabel id="organization-label">Organization *</InputLabel>
              <Select
                labelId="organization-label"
                name="organization"
                value={formData.organization}
                label="Organization *"
                onChange={handleChange}
                disabled={isFormDisabled}
              >
                {loadingOrgs ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} sx={{ mr: 1 }} /> Loading organizations...
                  </MenuItem>
                ) : organizations.length === 0 ? (
                  <MenuItem disabled>No organizations available</MenuItem>
                ) : (
                  organizations.map(org => (
                    <MenuItem key={org.id} value={org.id}>
                      {org.name}
                    </MenuItem>
                  ))
                )}
              </Select>
              {errors.organization && (
                <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                  {errors.organization}
                </Typography>
              )}
            </FormControl>

            {/* Workspace Selection */}
            <FormControl fullWidth error={!!errors.workspaces} sx={{ mb: 3 }}>
              <InputLabel id="workspaces-label">Workspaces *</InputLabel>
              <Select
                labelId="workspaces-label"
                multiple
                value={formData.workspaces}
                onChange={handleWorkspaceChange}
                input={<OutlinedInput label="Workspaces *" />}
                disabled={isFormDisabled || !formData.organization}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const workspace = workspaces.find(w => w.id === value);
                      return (
                        <Chip 
                          key={value} 
                          label={workspace?.name || value} 
                          size="small" 
                        />
                      );
                    })}
                  </Box>
                )}
              >
                {!formData.organization ? (
                  <MenuItem disabled>Please select an organization first</MenuItem>
                ) : loadingWorkspaces ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} sx={{ mr: 1 }} /> Loading workspaces...
                  </MenuItem>
                ) : workspaces.length === 0 ? (
                  <MenuItem disabled>No workspaces available for this organization</MenuItem>
                ) : (
                  workspaces.map(workspace => (
                    <MenuItem key={workspace.id} value={workspace.id}>
                      {workspace.name}
                    </MenuItem>
                  ))
                )}
              </Select>
              {errors.workspaces && (
                <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                  {errors.workspaces}
                </Typography>
              )}
            </FormControl>

            {/* Submit Button */}
            <Button 
              type="submit" 
              fullWidth
              variant="contained"
              disabled={isFormDisabled}
              sx={{
                py: 1.5,
                backgroundColor: "primary.main",
                "&:disabled": {
                  backgroundColor: "grey.400",
                }
              }}
            >
              {loading ? (
                <>
                  <CircularProgress size={20} sx={{ color: 'white', mr: 1 }} />
                  Processing Registration...
                </>
              ) : (
                'Register User'
              )}
            </Button>
          </Box>

          {/* Navigation */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button 
              variant="text" 
              onClick={() => navigate('/home')}
              disabled={loading}
              sx={{ textTransform: 'none' }}
            >
              Back to Home
            </Button>
          </Box>
        </Paper>
      </Container>
    </div>
  );
};

export default Register;