// Frontend/extension/src/contexts/PreferencesContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserSettings, updateUserSettings } from '../services/api';
import { useAuth } from './AuthContext';

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
  const { user, isAuthenticated } = useAuth();

  // Load preferences when auth state changes
  useEffect(() => {
    const loadPreferences = async () => {
      if (!isAuthenticated || !user?.walletAddress) {
        setPreferences(defaultPreferences);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const settings = await getUserSettings(user.walletAddress);
        if (settings) {
          setPreferences(settings);
        }
      } catch (error) {
        console.error('Failed to load preferences:', error);
        // Fallback to default preferences
        setPreferences(defaultPreferences);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [isAuthenticated, user?.walletAddress]);

  // Save preferences to chrome.storage for offline access
  useEffect(() => {
    const saveToStorage = async () => {
      try {
        await chrome.storage.local.set({ preferences });
      } catch (error) {
        console.error('Failed to save preferences to storage:', error);
      }
    };

    if (!loading) {
      saveToStorage();
    }
  }, [preferences, loading]);

  const updatePreferences = async (newPreferences) => {
    if (!isAuthenticated || !user?.walletAddress) {
      console.warn('Cannot update preferences: User not authenticated');
      return false;
    }

    try {
      // Prepare the settings object in the correct format
      const settingsUpdate = {
        settings: newPreferences
      };

      // Update on the server
      const response = await updateUserSettings(user.walletAddress, settingsUpdate);
      
      if (response.settings) {
        // Update local state with the server response
        setPreferences(response.settings);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to update preferences:', error);
      throw new Error(error.message || 'Failed to update preferences');
    }
  };

  // Helper functions for specific preference updates
  const updateTheme = async (theme) => {
    try {
      await updatePreferences({
        ...preferences,
        theme
      });
    } catch (error) {
      console.error('Failed to update theme:', error);
      throw error;
    }
  };

  const updateCommentPreferences = async (commentPrefs) => {
    try {
      await updatePreferences({
        ...preferences,
        comments: {
          ...preferences.comments,
          ...commentPrefs
        }
      });
    } catch (error) {
      console.error('Failed to update comment preferences:', error);
      throw error;
    }
  };

  return (
    <PreferencesContext.Provider value={{
      preferences,
      loading,
      updatePreferences,
      updateTheme,
      updateCommentPreferences,
      isAuthenticated // Expose authentication state to consumers
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