// Frontend/extension/src/pages/Settings.jsx
import React from 'react';
import { useNavigation } from '../contexts/NavigationContext';
import { ChevronLeft, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContexts';

const Settings = () => {
  const { theme, setThemePreference } = useTheme();
  const { goBack, closeAll } = useNavigation();

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="px-4 py-3 border-b dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        <button 
          onClick={goBack}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="font-semibold">Settings</span>
        <button 
          onClick={closeAll}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        <div className="space-y-6">
          {/* Theme Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Theme</label>
            <select 
              className="w-full p-2 bg-gray-100 dark:bg-gray-800 rounded-md"
              value={theme}
              onChange={(e) => setThemePreference(e.target.value)}
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          {/* Comment Display */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Comment Display</label>
            <select className="w-full p-2 bg-gray-800 text-white rounded-md">
              <option>Sidebar</option>
              <option>Overlay</option>
              <option>Minimal</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;