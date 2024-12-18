// Frontend/extension/src/contexts/NavigationContext.jsx
import React, { createContext, useContext, useState } from 'react';

const NavigationContext = createContext();

export function NavigationProvider({ children }) {
  const [pageStack, setPageStack] = useState([{ name: 'main' }]);
  
  const navigateTo = (pageName) => {
    setPageStack(prev => [...prev, { name: pageName }]);
  };
  
  const goBack = () => {
    setPageStack(prev => prev.length > 1 ? prev.slice(0, -1) : prev);
  };
  
  const closeAll = () => {
    setPageStack([{ name: 'main' }]);
  };
  
  return (
    <NavigationContext.Provider value={{ 
      currentPage: pageStack[pageStack.length - 1].name,
      canGoBack: pageStack.length > 1,
      navigateTo,
      goBack,
      closeAll
    }}>
      {children}
    </NavigationContext.Provider>
  );
}

export const useNavigation = () => useContext(NavigationContext);