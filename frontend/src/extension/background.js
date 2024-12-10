chrome.runtime.onMessageExternal.addListener(async (message, sender, sendResponse) => {
  // Log the received message properly
  console.log('External message received:', message);
  
  if (message.type === 'WALLET_CONNECTED') {
    console.log('Received wallet connection message:', { message, sender });
    
    // Verify the sender is our local development service
    if (!sender.url.startsWith('http://localhost:5173')) {
      console.error('Invalid sender URL:', sender.url);
      return;
    }
    
    try {
      // Get the pending session ID
      const { pendingConnection } = await chrome.storage.local.get('pendingConnection');
      console.log('Pending connection:', pendingConnection);
      
      if (pendingConnection !== message.sessionId) {
        console.error('Session ID mismatch:', {
          pending: pendingConnection,
          received: message.sessionId
        });
        return;
      }
      
      // Forward the connection to the extension
      chrome.runtime.sendMessage({
        type: 'WALLET_CONNECTED',
        sessionId: message.sessionId,
        account: message.account
      });

      // Clean up the pending connection
      await chrome.storage.local.remove('pendingConnection');
      
      // Send response to confirm message was handled
      sendResponse({ success: true });
    } catch (error) {
      console.error('Error handling wallet connection:', error);
      sendResponse({ success: false, error: error.message });
    }
  }
  
  return true;
});

// Handle extension button clicks
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_COMMENTS' });
});

// Handle tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome:')) {
    console.log('Tab updated:', tab.url);
  }
});

// Log that background script has loaded
console.log('Background script loaded');