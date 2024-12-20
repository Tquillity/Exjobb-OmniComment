// Frontend/webapp/src/services/auth.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const isAuthenticated = () => {
  const token = localStorage.getItem('authToken');
  if (!token) return false;
  
  try {
    // Decode the JWT token
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    
    // Check if token is expired
    return payload.exp > Date.now() / 1000;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};

export const authenticateWithWallet = async (walletAddress, signature, message) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/connect-wallet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ walletAddress, signature, message }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Authentication failed');
    }

    const data = await response.json();
    localStorage.setItem('authToken', data.token);
    return data;
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
};

export const setupCredentials = async (password, username = null) => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_BASE_URL}/auth/setup-credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ password, username }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to setup credentials');
    }

    return response.json();
  } catch (error) {
    console.error('Credential setup error:', error);
    throw error;
  }
};

export const loginWithPassword = async (identifier, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ identifier, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    localStorage.setItem('authToken', data.token);
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const updateDisplayPreference = async (preference) => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_BASE_URL}/auth/display-preference`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ preference }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update display preference');
    }

    return response.json();
  } catch (error) {
    console.error('Display preference update error:', error);
    throw error;
  }
};