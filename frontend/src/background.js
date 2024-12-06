// src/background.js

// Keep track of MetaMask status for each tab
const tabStates = new Map();

// Function to handle MetaMask connection
async function connectToMetaMask(tabId) {
  try {
    // Inject the provider connection script
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: async () => {
        try {
          if (!window.ethereum) {
            throw new Error('MetaMask not found');
          }

          // Request account access
          const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
          });

          // Listen for account changes
          window.ethereum.on('accountsChanged', (accounts) => {
            window.postMessage({
              type: 'OMNICOMMENT_ACCOUNT_CHANGED',
              account: accounts[0]
            }, '*');
          });

          // Listen for chain changes
          window.ethereum.on('chainChanged', () => {
            window.postMessage({
              type: 'OMNICOMMENT_CHAIN_CHANGED'
            }, '*');
          });

          return { success: true, account: accounts[0] };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },
      world: "MAIN"
    });

    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Message handlers
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const tabId = sender.tab?.id;
  
  if (message.type === 'CONTENT_SCRIPT_READY' && tabId) {
    chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        const hasMetaMask = !!window.ethereum;
        window.postMessage({
          type: 'OMNICOMMENT_METAMASK_STATUS',
          hasMetaMask
        }, '*');
      },
      world: "MAIN"
    }).catch(console.error);
  }
  
  if (message.type === 'METAMASK_STATUS' && tabId) {
    tabStates.set(tabId, { hasMetaMask: message.hasMetaMask });
    chrome.runtime.sendMessage({
      type: 'METAMASK_STATUS_UPDATE',
      hasMetaMask: message.hasMetaMask
    });
  }
  
  if (message.type === 'CHECK_METAMASK') {
    if (!sender.tab) {
      chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        const state = tabStates.get(tab?.id);
        sendResponse({ hasMetaMask: state?.hasMetaMask || false });
      });
      return true;
    }
    const state = tabStates.get(sender.tab.id);
    sendResponse({ hasMetaMask: state?.hasMetaMask || false });
  }
  
  if (message.type === 'CONNECT_WALLET') {
    if (!sender.tab) {
      chrome.tabs.query({ active: true, currentWindow: true }, async ([tab]) => {
        const result = await connectToMetaMask(tab.id);
        sendResponse(result);
      });
      return true;
    }
  }
});

// Clean up tab state when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  tabStates.delete(tabId);
});