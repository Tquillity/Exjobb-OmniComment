// Frontend/extension/src/contexts/BalanceContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export const BalanceContext = createContext();

export function BalanceProvider({ children }) {
  const [balance, setBalance] = useState('0');
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, user } = useAuth();

  const fetchBalance = async () => {
    if (!isAuthenticated || !user?.walletAddress) {
      setBalance('0');
      setLoading(false);
      return;
    }

    try {
      const result = await chrome.storage.local.get(['token']);
      const token = result.token;
      
      const response = await fetch('http://localhost:3000/api/users/' + user.walletAddress, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch balance');
      }

      const userData = await response.json();
      setBalance(userData.depositBalance?.toString() || '0');
      console.log('Fetched balance:', userData.depositBalance);
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance('0');
    } finally {
      setLoading(false);
    }
  };

  const updateBalance = async () => {
    await fetchBalance();
  };

  useEffect(() => {
    fetchBalance();
    
    // Set up periodic balance refresh
    const interval = setInterval(fetchBalance, 30000); // Every 30 seconds
    
    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [isAuthenticated, user?.walletAddress]);

  return (
    <BalanceContext.Provider value={{ 
      balance, 
      loading, 
      updateBalance 
    }}>
      {children}
    </BalanceContext.Provider>
  );
}