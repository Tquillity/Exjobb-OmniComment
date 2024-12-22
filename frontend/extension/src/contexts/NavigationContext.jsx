// Frontend/extension/src/contexts/NavigationContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const NavigationContext = createContext();

// Protected routes that require authentication
const PROTECTED_ROUTES = [
  'settings',
  'myComments',
  'statistics',
  'subscription',
  'export',
  'bookmarks'
];

// Routes that should redirect to main when authenticated
const AUTH_ROUTES = ['login', 'register'];

export function NavigationProvider({ children }) {
  const [pageStack, setPageStack] = useState([{ name: 'main', params: {} }]);
  const { isAuthenticated } = useAuth();
  
  // Handle authentication-based redirects
  useEffect(() => {
    const currentPage = pageStack[pageStack.length - 1];

    if (isAuthenticated && AUTH_ROUTES.includes(currentPage.name)) {
      // Redirect authenticated users away from auth pages
      setPageStack(prev => prev.slice(0, -1));
    }
  }, [isAuthenticated]);

  const navigateTo = (pageName, params = {}) => {
    // Check if route requires authentication
    if (PROTECTED_ROUTES.includes(pageName) && !isAuthenticated) {
      // Store the attempted route for post-login redirect
      chrome.storage.local.set({ 
        redirectAfterLogin: { pageName, params } 
      });
      
      // Redirect to login
      setPageStack(prev => [...prev, { 
        name: 'login', 
        params: { returnTo: pageName } 
      }]);
      return;
    }

    // Normal navigation
    setPageStack(prev => [...prev, { name: pageName, params }]);
  };
  
  const goBack = () => {
    setPageStack(prev => {
      if (prev.length <= 1) return prev;
      
      // Don't go back to auth pages if authenticated
      const newStack = prev.slice(0, -1);
      const lastPage = newStack[newStack.length - 1];
      
      if (isAuthenticated && AUTH_ROUTES.includes(lastPage.name)) {
        return newStack.slice(0, -1);
      }
      
      return newStack;
    });
  };
  
  const closeAll = () => {
    setPageStack([{ name: 'main', params: {} }]);
  };

  const handleAuthSuccess = async () => {
    try {
      // Check for stored redirect
      const result = await chrome.storage.local.get(['redirectAfterLogin']);
      if (result.redirectAfterLogin) {
        const { pageName, params } = result.redirectAfterLogin;
        // Clear stored redirect
        await chrome.storage.local.remove(['redirectAfterLogin']);
        // Navigate to stored page
        setPageStack(prev => [...prev.slice(0, -1), { name: pageName, params }]);
      } else {
        // Default to main page
        closeAll();
      }
    } catch (error) {
      console.error('Error handling auth success:', error);
      closeAll();
    }
  };

  const replaceCurrentPage = (pageName, params = {}) => {
    setPageStack(prev => [...prev.slice(0, -1), { name: pageName, params }]);
  };
  
  return (
    <NavigationContext.Provider value={{ 
      currentPage: pageStack[pageStack.length - 1].name,
      currentParams: pageStack[pageStack.length - 1].params,
      pageStack,
      canGoBack: pageStack.length > 1,
      navigateTo,
      goBack,
      closeAll,
      handleAuthSuccess,
      replaceCurrentPage
    }}>
      {children}
    </NavigationContext.Provider>
  );
}

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};