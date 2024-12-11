// src/components/WalletConnect.jsx
import React, { useState } from 'react';
import { connectWallet } from '../services/web3';
import { registerUser } from '../services/api';

export default function WalletConnect({ onConnect }) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

const handleConnect = async () => {
  try {
    setIsConnecting(true);
    setStatus('Requesting wallet connection...');
    setError('');
    
    const account = await connectWallet();
    console.log('Wallet connected:', account);
    
    // Register user in the database
    setStatus('Registering user...');
    await registerUser(account);
    console.log('User registered successfully');
    
    setStatus(`Connected: ${account}`);
    onConnect(account);
  } catch (err) {
    console.error('Connection error:', err);
    setError(err.message);
    setStatus('Connection failed');
  } finally {
    setIsConnecting(false);
  }
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
    </div>
  );
}