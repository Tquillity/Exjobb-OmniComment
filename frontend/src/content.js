// src/content.js
console.log('OmniComment content script loaded');

// Function that will be injected into the page
function injectedFunction() {
  // Just check for MetaMask existence
  const hasMetaMask = !!window.ethereum;
  window.postMessage({
    type: 'OMNICOMMENT_METAMASK_STATUS',
    hasMetaMask
  }, '*');
}

// Initialize the content script
async function initialize() {
  try {
    // Create container and toggle button
    const container = document.createElement('div');
    container.id = 'omnicomment-root';
    document.body.appendChild(container);

    const toggleButton = document.createElement('button');
    toggleButton.id = 'omnicomment-toggle';
    toggleButton.className = 'fixed bottom-5 right-5 w-12 h-12 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 z-50';
    toggleButton.innerHTML = '💬';
    document.body.appendChild(toggleButton);

    // Notify background script that content script is ready
    chrome.runtime.sendMessage({ type: 'CONTENT_SCRIPT_READY' });
  } catch (error) {
    console.error('Initialization error:', error);
  }
}

// Start initialization after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

// Listen for MetaMask status from injected script
let hasMetaMask = false;
window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  
  if (event.data.type === 'OMNICOMMENT_METAMASK_STATUS') {
    console.log('Received MetaMask status:', event.data.hasMetaMask);
    hasMetaMask = event.data.hasMetaMask;
    chrome.runtime.sendMessage({
      type: 'METAMASK_STATUS',
      hasMetaMask: event.data.hasMetaMask
    });
  }
});

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Received message:', request.type);
  
  if (request.type === 'PING') {
    sendResponse({ status: 'OK' });
    return;
  }

  if (request.type === 'CHECK_METAMASK') {
    sendResponse({ hasMetaMask });
    return;
  }
});