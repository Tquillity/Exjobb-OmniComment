// src/utils/metamaskDetector.js

// Function that will be injected into the page
export function injectMetaMaskDetector() {
  // Define all functions within the injection scope
  function detectMetaMask() {
    const hasMetaMask = !!window.ethereum;
    
    // Set up message listener for wallet connection requests
    window.addEventListener('message', async (event) => {
      if (event.data.type === 'OMNICOMMENT_CONNECT_REQUEST') {
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
          });
          
          window.postMessage({
            type: 'OMNICOMMENT_CONNECT_RESPONSE',
            success: true,
            account: accounts[0]
          }, '*');
        } catch (error) {
          window.postMessage({
            type: 'OMNICOMMENT_CONNECT_RESPONSE',
            success: false,
            error: error.message
          }, '*');
        }
      }
    });

    return hasMetaMask;
  }

  // Execute detection and send result
  const hasMetaMask = detectMetaMask();
  window.postMessage({
    type: 'OMNICOMMENT_METAMASK_STATUS',
    hasMetaMask
  }, '*');
}