// Frontend/extension/src/contexts/NavigationContext.jsx
import React, { createContext, useContext, useState } from 'react';

const NavigationContext = createContext();

export function NavigationProvider({ children }) {
  const [pageStack, setPageStack] = useState([{ name: 'main', params: {} }]);
  
  const navigateTo = (pageName, params = {}) => {
    setPageStack(prev => [...prev, { name: pageName, params }]);
  };
  
  const goBack = () => {
    setPageStack(prev => prev.length > 1 ? prev.slice(0, -1) : prev);
  };
  
  const closeAll = () => {
    setPageStack([{ name: 'main', params: {} }]);
  };
  
  return (
    <NavigationContext.Provider value={{ 
      currentPage: pageStack[pageStack.length - 1].name,
      currentParams: pageStack[pageStack.length - 1].params,
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