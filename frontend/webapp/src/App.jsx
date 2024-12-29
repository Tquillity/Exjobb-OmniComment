// Frontend/webapp/src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import { Profile } from './pages/Profile';
import { Subscription } from './pages/Subscription';
import Comments from './pages/Comments';
import { isAuthenticated } from './services/auth';

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Initialize dark mode from localStorage or system preference
    const isDark = localStorage.getItem('darkMode') === 'true' ||
    (!localStorage.getItem('darkMode') && 
    window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
    document.documentElement.classList.add('dark');
    }

    async function checkWalletConnection() {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          return accounts && accounts.length > 0;
        } catch (error) {
          console.error('Error checking wallet connection:', error);
          return false;
        }
      }
      return false;
    }

    const checkAuth = async () => {
      const authenticated = isAuthenticated();
      const walletConnected = await checkWalletConnection();
      
      if (authenticated && walletConnected) {
        try {
          // Get stored user data
          const userData = JSON.parse(localStorage.getItem('userData'));
          if (userData) {
            setUser(userData);
            setIsConnected(true);
            return;
          }
        } catch (error) {
          console.error('Error parsing stored user data:', error);
        }
      }
      
      // If either authentication or wallet connection fails
      handleDisconnect();
    };

    checkAuth();
    const interval = setInterval(checkAuth, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const handleConnect = (userData) => {
    console.log('User connected:', userData);
    localStorage.setItem('userData', JSON.stringify(userData));
    setIsConnected(true);
    setUser(userData);
  };

  const handleDisconnect = () => {
    console.log('Handling disconnect');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setIsConnected(false);
    setUser(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          element={
            <Layout
              isConnected={isConnected}
              user={user}
              onDisconnect={handleDisconnect}
            />
          }
        >
          <Route
            path="/"
            element={
              isConnected && user ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Home onConnect={handleConnect} />
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute isConnected={isConnected}>
                <Dashboard user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/comments"
            element={
              <ProtectedRoute isConnected={isConnected}>
                <Comments user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute isConnected={isConnected}>
                <Profile user={user} setUser={setUser} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subscription"
            element={
              <ProtectedRoute isConnected={isConnected}>
                <Subscription user={user} />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}