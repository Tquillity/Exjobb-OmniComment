// Frontend/extension/src/contexts/PreferencesContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserSettings, updateUserSettings } from '../services/api';

const PreferencesContext = createContext();

const defaultPreferences = {
  theme: 'system',
  commentPopup: 'sidebar',
  comments: {
    sortOrder: 'newest',
    threadDepth: 5,
    autoExpand: true,
    showPreview: true,
    richTextEnabled: true,
    collapseThreads: false,
    showTimestamp: 'relative'
  }
};

export function PreferencesProvider({ children }) {
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [loading, setLoading] = useState(true);
  // TODO: Replace with actual wallet address from your auth system
  const TEST_WALLET_ADDRESS = '0x62884985ce480347a733c7f4d160a622b83f6f78';

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const settings = await getUserSettings(TEST_WALLET_ADDRESS);
        setPreferences(settings || defaultPreferences);
      } catch (error) {
        console.error('Failed to load preferences:', error);
        // Fallback to default preferences
        setPreferences(defaultPreferences);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, []);

  const updatePreferences = async (newPreferences) => {
    try {
      const response = await updateUserSettings(TEST_WALLET_ADDRESS, newPreferences);
      setPreferences(response.settings);
      return true;
    } catch (error) {
      console.error('Failed to update preferences:', error);
      return false;
    }
  };

  return (
    <PreferencesContext.Provider value={{
      preferences,
      loading,
      updatePreferences
    }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};