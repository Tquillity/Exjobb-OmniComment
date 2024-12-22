// Frontend/extension/src/services/api.js
const API_BASE_URL = 'http://localhost:3000/api';

// Helper to get auth token from chrome.storage
const getAuthToken = async () => {
  const result = await chrome.storage.local.get(['token']);
  return result.token;
};

// Helper to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json();
    
    // Handle token expiration
    if (response.status === 401) {
      // Clear stored token
      await chrome.storage.local.remove(['token', 'user']);
      // You might want to trigger a logout event here
      throw new Error('Session expired. Please login again.');
    }
    
    throw new Error(errorData.error || 'API request failed');
  }
  
  return response.json();
};

// Helper to make authenticated requests
const authenticatedRequest = async (endpoint, options = {}) => {
  const token = await getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return handleResponse(response);
};

// Comment-related API calls
export const fetchComments = async (url) => {
  try {
    return await authenticatedRequest(`/comments?url=${encodeURIComponent(url)}`, {
      method: 'GET',
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};

export const postComment = async (data) => {
  try {
    console.log('Posting new comment with data:', data);
    const result = await authenticatedRequest('/comments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    console.log('New comment response:', result);
    return result;
  } catch (error) {
    console.error('Error posting comment:', error);
    throw error;
  }
};

// User settings API calls
export const updateUserSettings = async (walletAddress, settings) => {
  try {
    return await authenticatedRequest(`/users/${walletAddress}/settings`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
};

export const getUserSettings = async (walletAddress) => {
  try {
    return await authenticatedRequest(`/users/${walletAddress}`);
  } catch (error) {
    console.error('Error fetching user settings:', error);
    throw error;
  }
};

// Authentication API calls
export const loginUser = async (identifier, password) => {
  try {
    return await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ identifier, password }),
    }).then(handleResponse);
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const connectWallet = async (walletAddress, signature, message) => {
  try {
    return await fetch(`${API_BASE_URL}/auth/connect-wallet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ walletAddress, signature, message }),
    }).then(handleResponse);
  } catch (error) {
    console.error('Wallet connection error:', error);
    throw error;
  }
};

export const setupCredentials = async (password, username) => {
  try {
    return await authenticatedRequest('/auth/setup-credentials', {
      method: 'POST',
      body: JSON.stringify({ password, username }),
    });
  } catch (error) {
    console.error('Credential setup error:', error);
    throw error;
  }
};

export const updateDisplayPreference = async (preference) => {
  try {
    return await authenticatedRequest('/auth/display-preference', {
      method: 'PUT',
      body: JSON.stringify({ preference }),
    });
  } catch (error) {
    console.error('Display preference update error:', error);
    throw error;
  }
};