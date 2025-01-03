// Frontend/webapp/src/components/UserDashboard.jsx
import React, { useState, useEffect } from 'react';
import { formatEther } from 'viem';
import apiClient from '../services/apiClient'; 

export default function UserDashboard({ user }) {
  const [balance, setBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add a state for user comments
  const [userComments, setUserComments] = useState([]);

  useEffect(() => {
    async function getPolBalance() {
      if (!user?.walletAddress || !window.ethereum) {
        setIsLoading(false);
        setError('Wallet not connected');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Ensure we're connected to the wallet
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (!accounts || accounts.length === 0) {
          setError('Wallet not connected');
          return;
        }

        // Get balance in wei (hexadecimal)
        const balanceHex = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [user.walletAddress, 'latest']
        });
        console.log('Raw balance hex:', balanceHex);

        // Convert hex to decimal string
        const balanceWei = BigInt(balanceHex);
        console.log('Balance in wei:', balanceWei.toString());

        // Format to POL
        const formattedBalance = formatEther(balanceWei);
        console.log('Formatted balance:', formattedBalance);

        // Round to 4 decimal places
        const roundedBalance = Number(formattedBalance).toFixed(4);
        console.log('Rounded balance:', roundedBalance);

        setBalance(roundedBalance);
      } catch (err) {
        console.error('Error fetching POL balance:', err);
        setError('Failed to load balance');
      } finally {
        setIsLoading(false);
      }
    }

    getPolBalance();

    // Listen for chain or account changes so we can refresh the balance
    const handleChainChanged = () => getPolBalance();
    const handleAccountsChanged = () => getPolBalance();

    window.ethereum?.on('chainChanged', handleChainChanged);
    window.ethereum?.on('accountsChanged', handleAccountsChanged);

    return () => {
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, [user?.walletAddress]);

  // Fetch user comments in a separate effect
  useEffect(() => {
    if (user?.walletAddress) {
      fetchUserComments();
    }
  }, [user?.walletAddress]);

  const fetchUserComments = async () => {
    try {
      const response = await apiClient.get(
        `/comments/user/${user.walletAddress}?type=created`
      );
      setUserComments(response.data);
    } catch (error) {
      console.error('Failed to fetch user comments:', error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Comments Made Card */}
        <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-indigo-900 dark:text-indigo-100">
            Comments Made
          </h3>
          <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
            {userComments.length}
          </p>
        </div>

        {/* Balance Card */}
        <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-green-900 dark:text-green-100">Balance</h3>
          {isLoading ? (
            <div className="animate-pulse h-9 bg-green-100 dark:bg-green-800 rounded w-24 mt-1"></div>
          ) : error ? (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          ) : (
            <div>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {balance} POL
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Account: {user?.username || user?.walletAddress}
              </p>
            </div>
          )}
        </div>

        {/* Subscription Card */}
        <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-purple-900 dark:text-purple-100">
            Subscription
          </h3>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            Inactive
          </p>
        </div>
      </div>
    </div>
  );
}