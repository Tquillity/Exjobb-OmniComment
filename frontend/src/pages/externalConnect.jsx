import React, { useEffect, useState } from 'react';

export default function ExternalConnect() {
  const [status, setStatus] = useState('initializing');
  const [error, setError] = useState('');
  const sessionId = new URLSearchParams(window.location.search).get('session');
  const EXTENSION_ID = 'bheiefjikkmmfblidebeojgifgnajbde';
  
  // Add icon URL configuration
  const ICON_URL = process.env.NODE_ENV === 'production' 
    ? 'https://your-production-domain.com/icons/icon128.png'
    : `${window.location.origin}/icons/icon128.png`;

  useEffect(() => {
    const connectWallet = async () => {
      try {
        if (typeof window.ethereum === 'undefined') {
          throw new Error('MetaMask not detected! Please install MetaMask first.');
        }

        setStatus('connecting');
        console.log('Starting MetaMask connection...');

        // Add provider metadata
        if (window.ethereum.providers) {
          const provider = window.ethereum.providers.find(p => p.isMetaMask);
          if (provider) {
            provider.setProviderInfo({
              name: 'OmniComment',
              icon: ICON_URL,
              description: 'Decentralized commenting system for any webpage'
            });
          }
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
          params: [{
            dapp: {
              name: 'OmniComment',
              url: window.location.origin,
              icons: [ICON_URL]
            }
          }]
        });

        console.log('Accounts received:', accounts);

        if (!accounts || accounts.length === 0) {
          throw new Error('No accounts received from MetaMask');
        }

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
                blockExplorerUrls: ['https://polygonscan.com/'],
                iconUrls: [ICON_URL]
              }]
            });
          } else {
            throw switchError;
          }
        }

        chrome.runtime.sendMessage(EXTENSION_ID, {
          type: 'WALLET_CONNECTED',
          sessionId,
          account: accounts[0]
        }, response => {
          if (chrome.runtime.lastError) {
            console.error('Chrome runtime error:', chrome.runtime.lastError);
            throw new Error(chrome.runtime.lastError.message);
          }
          console.log('Connection message sent successfully');
          setStatus('connected');
          setTimeout(() => window.close(), 1000);
        });

      } catch (error) {
        console.error('Connection error:', error);
        setStatus('error');
        setError(error.message || 'Failed to connect to MetaMask');
      }
    };

    if (sessionId) {
      connectWallet();
    } else {
      setStatus('error');
      setError('Invalid session');
    }

  }, [sessionId]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-indigo-600 mb-2">OmniComment</h1>
          <h2 className="text-2xl font-bold text-gray-900">
            {status === 'error' ? 'Connection Error' :
             status === 'connected' ? 'Connected!' :
             'Connect MetaMask'}
          </h2>
          {status === 'error' ? (
            <div className="mt-4">
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Retry Connection
              </button>
            </div>
          ) : (
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                {status === 'initializing' ? 'Preparing connection...' :
                 status === 'connecting' ? 'Please approve the connection request in MetaMask' :
                 'Successfully connected! This window will close automatically.'}
              </p>
              <div className="mt-8 flex justify-center">
                <div className="animate-spin h-10 w-10 text-indigo-600">
                  <svg className="w-full h-full" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}