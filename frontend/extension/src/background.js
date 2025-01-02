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
  if (tokenRefreshInterval) {
    clearInterval(tokenRefreshInterval);
  }
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
    await chrome.storage.local.set({ token: data.token });
    authState.token = data.token;
  } catch (error) {
    console.error('Token refresh failed:', error);
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
      console.debug('Could not send auth state to tab:', tab.id, error);
    });
  });
};

// Handle login
const handleLogin = async (token, user) => {
  try {
    await chrome.storage.local.set({ token, user });
    authState = {
      isAuthenticated: true,
      user,
      token
    };
    startTokenRefresh();
    broadcastAuthState();
    
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
    await chrome.storage.local.remove(['token', 'user']);
    authState = {
      isAuthenticated: false,
      user: null,
      token: null
    };
    if (tokenRefreshInterval) {
      clearInterval(tokenRefreshInterval);
      tokenRefreshInterval = null;
    }
    broadcastAuthState();
  } catch (error) {
    console.error('Logout handler error:', error);
  }
};

// Check for comments and update badge
const checkForComments = async (url) => {
  try {
    if (!url || !url.startsWith('http')) {
      return;
    }
    
    console.log('Checking comments for URL:', url);
    const response = await fetch(`${API_BASE_URL}/comments?url=${encodeURIComponent(url)}`);
    const comments = await response.json();
    console.log('Comments response:', comments);
    
    // Always update badge if there are any comments
    if (comments && comments.length > 0) {
      console.log('Setting badge notification');
      chrome.action.setBadgeText({ text: "!" });
      chrome.action.setBadgeBackgroundColor({ color: '#EF4444' }); // Red color
      chrome.action.setBadgeTextColor({ color: '#FFFFFF' }); // White text
    } else {
      console.log('Clearing badge');
      chrome.action.setBadgeText({ text: '' });
    }
  } catch (error) {
    console.error('Error checking comments:', error);
  }
};

// Listen for tab updates and activation
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
    console.log('Tab updated:', tab.url);
    chrome.storage.local.get(['user'], async (result) => {
      console.log('Retrieved user settings:', result.user?.settings);
      const notificationMode = result.user?.settings?.notificationMode || 'silent';
      console.log('Notification mode:', notificationMode);
      if (notificationMode === 'notify') {
        await checkForComments(tab.url);
      } else {
        chrome.action.setBadgeText({ text: '' });
      }
    });
  }
});

// Also check when switching tabs
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  if (tab.url && tab.url.startsWith('http')) {
    chrome.storage.local.get(['user'], async (result) => {
      const notificationMode = result.user?.settings?.notificationMode || 'silent';
      if (notificationMode === 'notify') {
        await checkForComments(tab.url);
      } else {
        chrome.action.setBadgeText({ text: '' });
      }
    });
  }
});

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
      return true;

    case 'LOGOUT':
      handleLogout()
        .then(() => sendResponse({ success: true }))
        .catch(error => sendResponse({ error: error.message }));
      return true;

    case 'CHECK_AUTH':
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
      return true;

    case 'CHECK_COMMENTS':
      checkForComments(request.data.url)
        .then(() => sendResponse({ success: true }))
        .catch(error => sendResponse({ error: error.message }));
      return true;
  }
});

// Handle installed/updated event
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: '/icons/icon48.png',
      title: 'Welcome to OmniComment!',
      message: 'Thank you for installing OmniComment. Click to get started!'
    });
  }
});

// Initialize on startup
initializeAuth();

const initializeNotifications = async () => {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentTab = tabs[0];
    if (currentTab?.url && currentTab.url.startsWith('http')) {
      const { preferences } = await chrome.storage.local.get(['preferences']);
      const notificationMode = preferences?.notificationMode || 'silent';
      console.log('Current notification mode:', notificationMode);
      
      if (notificationMode === 'notify') {
        await checkForComments(currentTab.url);
      }
    }
  } catch (error) {
    console.error('Error initializing notifications:', error);
  }
};