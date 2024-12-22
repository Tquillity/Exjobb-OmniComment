// Frontend/extension/src/background.js

// Constants
const API_BASE_URL = 'http://localhost:3000/api';
const TOKEN_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

// State management
let authState = {
  isAuthenticated: false,
  user: null,
  token: null
};

// Initialize authentication state
const initializeAuth = async () => {
  try {
    const data = await chrome.storage.local.get(['token', 'user']);
    if (data.token && data.user) {
      authState = {
        isAuthenticated: true,
        user: data.user,
        token: data.token
      };
      
      // Start token refresh interval
      startTokenRefresh();
      
      // Broadcast auth state to all tabs
      broadcastAuthState();
    }
  } catch (error) {
    console.error('Error initializing auth:', error);
  }
};

// Token refresh mechanism
let tokenRefreshInterval = null;

const startTokenRefresh = () => {
  // Clear existing interval if any
  if (tokenRefreshInterval) {
    clearInterval(tokenRefreshInterval);
  }
  
  // Start new refresh interval
  tokenRefreshInterval = setInterval(refreshToken, TOKEN_REFRESH_INTERVAL);
};

const refreshToken = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authState.token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    
    // Update storage and state with new token
    await chrome.storage.local.set({ token: data.token });
    authState.token = data.token;
    
  } catch (error) {
    console.error('Token refresh failed:', error);
    // Handle failed refresh by logging out
    handleLogout();
  }
};

// Authentication state broadcast
const broadcastAuthState = async () => {
  const tabs = await chrome.tabs.query({});
  
  tabs.forEach(tab => {
    chrome.tabs.sendMessage(tab.id, {
      type: 'AUTH_STATE_CHANGED',
      data: {
        isAuthenticated: authState.isAuthenticated,
        user: authState.user
      }
    }).catch(error => {
      // Ignore errors for tabs that can't receive messages
      console.debug('Could not send auth state to tab:', tab.id, error);
    });
  });
};

// Handle login
const handleLogin = async (token, user) => {
  try {
    // Update storage
    await chrome.storage.local.set({ token, user });
    
    // Update state
    authState = {
      isAuthenticated: true,
      user,
      token
    };
    
    // Start token refresh
    startTokenRefresh();
    
    // Broadcast new state
    broadcastAuthState();
    
    // Show notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: '/icons/icon48.png',
      title: 'OmniComment',
      message: 'Successfully logged in!'
    });
  } catch (error) {
    console.error('Login handler error:', error);
  }
};

// Handle logout
const handleLogout = async () => {
  try {
    // Clear storage
    await chrome.storage.local.remove(['token', 'user']);
    
    // Clear state
    authState = {
      isAuthenticated: false,
      user: null,
      token: null
    };
    
    // Clear token refresh
    if (tokenRefreshInterval) {
      clearInterval(tokenRefreshInterval);
      tokenRefreshInterval = null;
    }
    
    // Broadcast new state
    broadcastAuthState();
    
  } catch (error) {
    console.error('Logout handler error:', error);
  }
};

// Message handlers
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'GET_AUTH_STATE':
      sendResponse({ authState: {
        isAuthenticated: authState.isAuthenticated,
        user: authState.user
      }});
      break;

    case 'LOGIN':
      handleLogin(request.data.token, request.data.user)
        .then(() => sendResponse({ success: true }))
        .catch(error => sendResponse({ error: error.message }));
      return true; // Will respond asynchronously

    case 'LOGOUT':
      handleLogout()
        .then(() => sendResponse({ success: true }))
        .catch(error => sendResponse({ error: error.message }));
      return true; // Will respond asynchronously

    case 'CHECK_AUTH':
      // Check if token is still valid
      fetch(`${API_BASE_URL}/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${authState.token}`
        }
      })
        .then(response => response.ok)
        .then(isValid => {
          if (!isValid) {
            return handleLogout().then(() => false);
          }
          return true;
        })
        .then(isValid => sendResponse({ isValid }))
        .catch(() => {
          handleLogout().then(() => sendResponse({ isValid: false }));
        });
      return true; // Will respond asynchronously
  }
});

// Handle installed/updated event
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Show welcome notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: '/icons/icon48.png',
      title: 'Welcome to OmniComment!',
      message: 'Thank you for installing OmniComment. Click to get started!'
    });
  } else if (details.reason === 'update') {
    // Handle update if needed
  }
});

// Initialize on startup
initializeAuth();