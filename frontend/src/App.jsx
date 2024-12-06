import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

function App() {
  const [account, setAccount] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [isExtension] = useState(!!chrome?.runtime?.id)
  const [isValidTab, setIsValidTab] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMetaMask, setHasMetaMask] = useState(false)

  // Check if able to inject content script on the current tab
  useEffect(() => {
    if (isExtension) {
      chrome.tabs.query({ active: true, currentWindow: true }, async ([tab]) => {
        // Check if on a valid URL
        const isValidUrl = tab?.url && !tab.url.startsWith('chrome:') && 
                          !tab.url.startsWith('chrome-extension:') &&
                          !tab.url.startsWith('about:');
        setIsValidTab(isValidUrl);

        if (isValidUrl) {
          try {
            // Ensure content script is loaded
            await ensureContentScript(tab.id);
            // Check MetaMask status
            const response = await chrome.runtime.sendMessage({ type: 'CHECK_METAMASK' });
            setHasMetaMask(response?.hasMetaMask || false);
          } catch (error) {
            console.error('Error ensuring content script:', error);
          }
        }
      });

      // Listen for MetaMask status updates
      const statusListener = (message) => {
        if (message.type === 'METAMASK_STATUS_UPDATE') {
          setHasMetaMask(message.hasMetaMask);
        }
      };
      chrome.runtime.onMessage.addListener(statusListener);
      return () => chrome.runtime.onMessage.removeListener(statusListener);
    }
  }, [isExtension]);

  const ensureContentScript = async (tabId) => {
    try {
      // Try to send a test message
      await chrome.tabs.sendMessage(tabId, { type: 'PING' });
    } catch (error) {
      // If content script isn't loaded, inject it
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['src/content.js']
      });
      
      // Wait a bit for the script to initialize
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  };

  const connectWallet = async () => {
    try {
      setIsLoading(true);
  
      if (!isValidTab) {
        throw new Error('Cannot connect wallet on this page');
      }
  
      if (isExtension) {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab) throw new Error('No active tab found');
  
        // Ensure content script is loaded
        await ensureContentScript(tab.id);
  
        if (!hasMetaMask) {
          throw new Error('Please install MetaMask!');
        }
  
        // Try to connect wallet through background script
        const response = await chrome.runtime.sendMessage({ type: 'CONNECT_WALLET' });
        
        if (!response.success) {
          throw new Error(response.error || 'Failed to connect wallet');
        }
  
        // After successful connection, switch to Polygon network
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x89' }]
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x89',
                chainName: 'Polygon Mainnet',
                nativeCurrency: {
                  name: 'MATIC',
                  symbol: 'MATIC',
                  decimals: 18
                },
                rpcUrls: ['https://polygon-rpc.com/'],
                blockExplorerUrls: ['https://polygonscan.com/']
              }]
            });
          }
        }
  
        setAccount(response.account);
        setIsConnected(true);
      } else {
        // Regular web app flow
        if (typeof window.ethereum === 'undefined') {
          throw new Error('Please install MetaMask!');
        }
  
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x89' }]
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x89',
                chainName: 'Polygon Mainnet',
                nativeCurrency: {
                  name: 'MATIC',
                  symbol: 'MATIC',
                  decimals: 18
                },
                rpcUrls: ['https://polygon-rpc.com/'],
                blockExplorerUrls: ['https://polygonscan.com/']
              }]
            });
          }
        }
  
        setAccount(accounts[0]);
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isExtension) {
      // Listen for account updates from content script
      const listener = (request, sender, sendResponse) => {
        if (request.type === 'ACCOUNT_CHANGED') {
          setAccount(request.account);
          setIsConnected(Boolean(request.account));
        }
        if (request.type === 'CHAIN_CHANGED') {
          window.location.reload();
        }
      };

      chrome.runtime.onMessage.addListener(listener);

      return () => {
        chrome.runtime.onMessage.removeListener(listener);
      };
    } else {
      if (window.ethereum) {
        window.ethereum.on('accountsChanged', accounts => {
          setAccount(accounts[0]);
          setIsConnected(Boolean(accounts[0]));
        });

        window.ethereum.on('chainChanged', () => {
          window.location.reload();
        });

        return () => {
          window.ethereum.removeListener('accountsChanged', accounts => {
            setAccount(accounts[0]);
            setIsConnected(Boolean(accounts[0]));
          });
          window.ethereum.removeListener('chainChanged', () => {
            window.location.reload();
          });
        };
      }
    }
  }, [isExtension]);

  return (
    <div className="w-96 h-96 bg-gray-100"> 
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            OmniComment
          </h1>
          {!isValidTab ? (
            <div className="text-sm text-gray-500">
              Not available on this page
            </div>
          ) : (
            <button
              onClick={connectWallet}
              disabled={isLoading}
              className={`${
                isLoading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-700'
              } text-white font-bold py-2 px-4 rounded`}
            >
              {isLoading ? 'Connecting...' : 
               isConnected ? 
                `Connected: ${account.slice(0,6)}...${account.slice(-4)}` : 
                'Connect Wallet'}
            </button>
          )}
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Main content */}
      </main>
    </div>
  )
}

export default App