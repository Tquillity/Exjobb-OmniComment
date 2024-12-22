// Frontend/extension/src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Load token from chrome.storage
        const result = await chrome.storage.local.get(['token', 'user']);
        if (result.token && result.user) {
          setToken(result.token);
          setUser(result.user);
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (identifier, password) => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const { token: newToken, user: userData } = await response.json();

      // Store in chrome.storage
      await chrome.storage.local.set({
        token: newToken,
        user: userData,
      });

      setToken(newToken);
      setUser(userData);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await chrome.storage.local.remove(['token', 'user']);
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = async (updates) => {
    try {
      // Get the current auth token
      const result = await chrome.storage.local.get(['token']);
      if (!result.token) {
        throw new Error('No authentication token found');
      }

      // Send update to backend
      const response = await fetch(`http://localhost:3000/api/users/${user.walletAddress}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${result.token}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update user');
      }

      // Get updated user data from response
      const updatedUser = await response.json();

      // Update local storage and state
      await chrome.storage.local.set({ user: updatedUser });
      setUser(updatedUser);
      
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      logout,
      updateUser,
      isAuthenticated: !!token,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};