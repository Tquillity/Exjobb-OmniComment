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
    // Check authentication status on mount and token changes
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      setIsConnected(authenticated);
      if (!authenticated) {
        setUser(null);
        localStorage.removeItem('authToken');
      }
    };
    
    checkAuth();
    
    // Set up a timer to periodically check token expiration
    const interval = setInterval(checkAuth, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);

  const handleConnect = (userData) => {
    console.log('User connected:', userData);
    setIsConnected(true);
    setUser(userData);
  };

  const handleDisconnect = () => {
    console.log('Handling disconnect');
    localStorage.removeItem('authToken');
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