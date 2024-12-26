import React, { createContext, useState, useEffect } from 'react';
import { fetchUserBalance } from '../services/api';

export const BalanceContext = createContext();

export const BalanceProvider = ({ children }) => {
  const [balance, setBalance] = useState('0');
  const [loading, setLoading] = useState(true);

  const updateBalance = async () => {
    try {
      const response = await fetchUserBalance();
      if (response.success) {
        setBalance(response.balance);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchBalanceIfAuthenticated = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        await updateBalance();
      } else {
        setLoading(false);
      }
    };
  
    fetchBalanceIfAuthenticated();
    const interval = setInterval(fetchBalanceIfAuthenticated, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <BalanceContext.Provider value={{ balance, loading, updateBalance }}>
      {children}
    </BalanceContext.Provider>
  );
};