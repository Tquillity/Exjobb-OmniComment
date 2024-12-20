// Frontend/webapp/src/components/WalletConnect.jsx
import React, { useState } from 'react';
import { connectWallet } from '../services/web3';
import { authenticateWithWallet } from '../services/auth';
import PasswordSetupModal from './PasswordSetupModal';

export default function WalletConnect({ onConnect }) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [walletData, setWalletData] = useState(null);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      setStatus('Requesting wallet connection...');
      setError('');
      
      // Connect wallet and get signature
      const walletData = await connectWallet();
      console.log('Wallet connection data:', walletData);
      
      // Authenticate with backend
      setStatus('Authenticating...');
      const authData = await authenticateWithWallet(
        walletData.address,
        walletData.signature,
        walletData.message
      );
      
      console.log('Authentication response:', authData);

      // Store wallet data for password setup if needed
      setWalletData({
        address: walletData.address,
        token: authData.token
      });

      // Check if password setup is required
      if (authData.requiresPasswordSetup) {
        setShowPasswordSetup(true);
        setStatus('Please set up your password');
      } else {
        onConnect(authData.user);
      }
    } catch (err) {
      console.error('Connection error:', err);
      setError(err.message);
      setStatus('Connection failed');
    } finally {
      setIsConnecting(false);
    }
  };

  const handlePasswordSetupComplete = (userData) => {
    setShowPasswordSetup(false);
    onConnect(userData);
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
      
      {status && (
        <p className="text-sm text-gray-600">{status}</p>
      )}
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {showPasswordSetup && (
        <PasswordSetupModal
          isOpen={showPasswordSetup}
          onClose={() => setShowPasswordSetup(false)}
          walletAddress={walletData?.address}
          onComplete={handlePasswordSetupComplete}
        />
      )}
    </div>
  );
}