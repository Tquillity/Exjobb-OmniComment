// Frontend/extension/src/contexts/BalanceContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export const BalanceContext = createContext();

export function BalanceProvider({ children }) {
  const [balance, setBalance] = useState('0');
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, user } = useAuth();

  const fetchBalance = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/blockchain/user-info', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch balance');
      }

      const data = await response.json();
      setBalance(data.depositBalance || '0');
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance('0');
    } finally {
      setLoading(false);
    }
  };

  const updateBalance = async () => {
    if (isAuthenticated && user?.walletAddress) {
      await fetchBalance();
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.walletAddress) {
      fetchBalance();
    } else {
      setBalance('0');
      setLoading(false);
    }
  }, [isAuthenticated, user?.walletAddress]);

  return (
    <BalanceContext.Provider value={{ balance, loading, updateBalance }}>
      {children}
    </BalanceContext.Provider>
  );
}