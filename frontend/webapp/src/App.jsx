// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import { Profile } from './pages/Profile';
import { Subscription } from './pages/Subscription';

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState('');

  // Add debugging logs
  useEffect(() => {
    console.log('Connection status:', isConnected);
    console.log('Account:', account);
  }, [isConnected, account]);

  const handleConnect = (connectedAccount) => {
    console.log('Handling connect with account:', connectedAccount);
    setIsConnected(true);
    setAccount(connectedAccount);
  };

  const handleDisconnect = () => {
    console.log('Handling disconnect');
    setIsConnected(false);
    setAccount('');
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          element={
            <Layout 
              isConnected={isConnected} 
              account={account} 
              onDisconnect={handleDisconnect}
            />
          }
        >
          <Route 
            path="/" 
            element={
              isConnected ? (
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
                <Dashboard account={account} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute isConnected={isConnected}>
                <Profile account={account} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subscription"
            element={
              <ProtectedRoute isConnected={isConnected}>
                <Subscription />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}