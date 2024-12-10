import { useState, useEffect } from 'react'

function App() {
  const [account, setAccount] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [isExtension] = useState(!!chrome?.runtime?.id)
  const [isValidTab, setIsValidTab] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  // Check stored connection state on load
  useEffect(() => {
    const checkConnectionState = async () => {
      try {
        const savedState = await chrome.storage.local.get(['connectedAccount']);
        if (savedState.connectedAccount) {
          setAccount(savedState.connectedAccount);
          setIsConnected(true);
        }
      } catch (error) {
        console.error('Error checking connection state:', error);
      }
    };

    if (isExtension) {
      checkConnectionState();
    }
  }, [isExtension]);

  // Check if current tab is valid for the extension
  useEffect(() => {
    if (isExtension) {
      chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        const isValidUrl = tab?.url && !tab.url.startsWith('chrome:') && 
                          !tab.url.startsWith('chrome-extension:') &&
                          !tab.url.startsWith('about:');
        setIsValidTab(isValidUrl);
      });
    }
  }, [isExtension]);

  const connectWallet = async () => {
    setIsLoading(true);
    try {
      if (!isValidTab) {
        throw new Error('Cannot connect wallet on this page');
      }

      // Generate unique session ID
      const sessionId = crypto.randomUUID();
      
      // Store session ID
      await chrome.storage.local.set({ pendingConnection: sessionId });

      console.log('Opening connection window...');
      
      // Open connection page
      const connectionUrl = `http://localhost:5173/connect.html?session=${sessionId}`;
      const width = 400;
      const height = 600;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      window.open(
        connectionUrl,
        'Connect to MetaMask',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      // Listen for connection response
      const handleConnection = (message) => {
        if (message.type === 'WALLET_CONNECTED' && message.sessionId === sessionId) {
          setAccount(message.account);
          setIsConnected(true);
          chrome.storage.local.set({ connectedAccount: message.account });
          chrome.runtime.onMessage.removeListener(handleConnection);
          chrome.storage.local.remove('pendingConnection');
        }
      };

      chrome.runtime.onMessage.addListener(handleConnection);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      await chrome.storage.local.remove(['connectedAccount']);
      setAccount('');
      setIsConnected(false);
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      alert('Failed to disconnect wallet');
    }
  };

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
            <div className="space-x-2">
              {isConnected ? (
                <>
                  <span className="text-sm text-gray-600">
                    {`${account.slice(0,6)}...${account.slice(-4)}`}
                  </span>
                  <button
                    onClick={disconnectWallet}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Disconnect
                  </button>
                </>
              ) : (
                <button
                  onClick={connectWallet}
                  disabled={isLoading}
                  className={`${
                    isLoading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-700'
                  } text-white font-bold py-2 px-4 rounded`}
                >
                  {isLoading ? 'Connecting...' : 'Connect Wallet'}
                </button>
              )}
            </div>
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