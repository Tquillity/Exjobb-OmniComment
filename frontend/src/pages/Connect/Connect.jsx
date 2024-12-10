import React, { useEffect, useState } from 'react';


function Connect() {
  const [error, setError] = useState('');
  const [status, setStatus] = useState('initializing');

  useEffect(() => {
    let mounted = true;

    async function connectToMetaMask() {
      try {
        if (!mounted) return;
        setStatus('checking');

        // Use Promise for better handling of asynchronous operations
        const checkMetaMask = () => new Promise((resolve, reject) => {
          chrome.runtime.sendMessage({ type: "CHECK_METAMASK" }, (response) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else if (!response || !response.hasMetaMask) {
              reject(new Error('MetaMask not detected or content script not responding. Please install MetaMask or ensure you are on a supported page.'));
            } else {
              resolve(response);
            }
          });
        });

        await checkMetaMask();

        setStatus('connecting');

        const requestAccounts = () => new Promise((resolve, reject) => {
          chrome.runtime.sendMessage({ type: "REQUEST_ACCOUNTS" }, (response) => {
            if (chrome.runtime.lastError || response.error) {
              reject(new Error(response.error || chrome.runtime.lastError.message));
            } else {
              resolve(response);
            }
          });
        });

        const accountsResponse = await requestAccounts();

        // Switch network
        const switchNetwork = () => new Promise((resolve, reject) => {
          chrome.runtime.sendMessage({ type: "SWITCH_NETWORK" }, (response) => {
            if (chrome.runtime.lastError || response.error) {
              reject(new Error(response.error || chrome.runtime.lastError.message));
            } else {
              resolve(response);
            }
          });
        });

        await switchNetwork();

        if (!mounted) return;

        window.opener?.postMessage({
          type: 'METAMASK_CONNECT_RESPONSE',
          success: true,
          account: accountsResponse.accounts[0]
        }, '*');

      } catch (error) {
        console.error('MetaMask connection error:', error);
        if (!mounted) return;
        
        setError(error.message);
        setStatus('error');
        
        window.opener?.postMessage({
          type: 'METAMASK_CONNECT_RESPONSE',
          success: false,
          error: error.message
        }, '*');
      }
    }

    connectToMetaMask();
    
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {status === 'error' ? 'Connection Error' : 'Connecting to MetaMask'}
          </h2>
          {status === 'error' ? (
            <div className="mt-4">
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => window.close()}
                className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Close Window
              </button>
            </div>
          ) : (
            <>
              <p className="mt-2 text-sm text-gray-600">
                {status === 'checking' ? 'Checking MetaMask availability...' :
                 status === 'connecting' ? 'Please approve the connection request in your MetaMask wallet.' :
                 'Initializing connection...'}
              </p>
              <div className="mt-8 flex justify-center">
                <svg className="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Connect;