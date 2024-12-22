// Frontend/extension/src/content.js
// Initialize message handlers
let authState = {
  isAuthenticated: false,
  user: null
};

// Listen for authentication state changes from the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'GET_URL':
      sendResponse({ url: window.location.href });
      break;

    case 'AUTH_STATE_CHANGED':
      handleAuthStateChange(request.data);
      sendResponse({ success: true });
      break;

    case 'COMMENT_ADDED':
      handleNewComment(request.data);
      sendResponse({ success: true });
      break;

    case 'SHOW_COMMENT_SECTION':
      toggleCommentSection(request.data);
      sendResponse({ success: true });
      break;

    default:
      sendResponse({ error: 'Unknown message type' });
  }
  
  // Return true to indicate we will send a response asynchronously
  return true;
});

// Handle authentication state changes
const handleAuthStateChange = (newAuthState) => {
  authState = newAuthState;
  
  // Update UI elements based on auth state
  updateUIForAuthState();
  
  // Notify the webpage about auth state change if needed
  window.postMessage(
    { 
      type: 'OMNICOMMENT_AUTH_STATE', 
      data: {
        isAuthenticated: authState.isAuthenticated,
        // Only send safe user data
        user: authState.user ? {
          username: authState.user.username,
          displayPreference: authState.user.displayPreference
        } : null
      }
    }, 
    '*'
  );
};

// Handle new comments
const handleNewComment = (commentData) => {
  // Update UI to show new comment
  if (commentSidebarElement) {
    updateCommentSection(commentData);
  }

  // Notify the webpage about new comment
  window.postMessage(
    { 
      type: 'OMNICOMMENT_NEW_COMMENT', 
      data: commentData 
    }, 
    '*'
  );
};

// Create and manage comment sidebar
let commentSidebarElement = null;

const createCommentSidebar = () => {
  if (commentSidebarElement) return;

  commentSidebarElement = document.createElement('div');
  commentSidebarElement.id = 'omnicomment-sidebar';
  commentSidebarElement.className = 'omnicomment-sidebar';
  
  // Add base styles
  const style = document.createElement('style');
  style.textContent = `
    .omnicomment-sidebar {
      position: fixed;
      top: 0;
      right: -384px; /* Start hidden */
      width: 384px;
      height: 100vh;
      background: white;
      box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
      transition: right 0.3s ease;
      z-index: 2147483647;
    }
    .omnicomment-sidebar.visible {
      right: 0;
    }
    @media (prefers-color-scheme: dark) {
      .omnicomment-sidebar {
        background: #1a1a1a;
        color: #ffffff;
      }
    }
  `;
  
  document.head.appendChild(style);
  document.body.appendChild(commentSidebarElement);
};

const toggleCommentSection = ({ visible, data = null }) => {
  if (!commentSidebarElement) {
    createCommentSidebar();
  }

  if (visible) {
    commentSidebarElement.classList.add('visible');
    if (data) {
      updateCommentSection(data);
    }
  } else {
    commentSidebarElement.classList.remove('visible');
  }
};

const updateCommentSection = (data) => {
  if (!commentSidebarElement) return;

  // Update comment section content
  // This would be handled by the React app mounted in the sidebar
  window.postMessage(
    { 
      type: 'OMNICOMMENT_UPDATE_CONTENT', 
      data 
    }, 
    '*'
  );
};

// Update UI elements based on authentication state
const updateUIForAuthState = () => {
  const elements = document.querySelectorAll('[data-omnicomment]');
  elements.forEach(element => {
    if (authState.isAuthenticated) {
      element.classList.add('authenticated');
      // Update user-specific elements
      const userElements = element.querySelectorAll('[data-omnicomment-user]');
      userElements.forEach(userEl => {
        if (authState.user?.username) {
          userEl.textContent = authState.user.username;
        }
      });
    } else {
      element.classList.remove('authenticated');
    }
  });
};

// Initialize
const init = () => {
  // Create comment section container
  createCommentSidebar();
  
  // Request initial auth state
  chrome.runtime.sendMessage({ type: 'GET_AUTH_STATE' }, (response) => {
    if (response?.authState) {
      handleAuthStateChange(response.authState);
    }
  });
};

// Start initialization
init();

// Listen for web messages (e.g., from injected scripts)
window.addEventListener('message', (event) => {
  // Only accept messages from the same origin
  if (event.source !== window) return;
  
  if (event.data.type && event.data.type.startsWith('OMNICOMMENT_')) {
    // Handle various message types
    switch (event.data.type) {
      case 'OMNICOMMENT_REQUEST_AUTH_STATE':
        // Respond with current auth state
        window.postMessage(
          { 
            type: 'OMNICOMMENT_AUTH_STATE', 
            data: {
              isAuthenticated: authState.isAuthenticated,
              user: authState.user ? {
                username: authState.user.username,
                displayPreference: authState.user.displayPreference
              } : null
            }
          }, 
          '*'
        );
        break;
    }
  }
});