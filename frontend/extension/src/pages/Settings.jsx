// Frontend/extension/src/pages/Settings.jsx
import React, { useState } from 'react';
import AppearanceSettings from '../components/AppearanceSettings';
import { useNavigation } from '../contexts/NavigationContext';
import { ChevronLeft, X } from 'lucide-react';
import CommentPreferences from '../components/CommentPreferences';

const Settings = () => {
  const [activeCategory, setActiveCategory] = useState(null);
  const { goBack, closeAll } = useNavigation();

  const renderCategoryContent = () => {
    switch (activeCategory) {
      case 'appearance':
        return <AppearanceSettings />;
      case 'comments':
        return <CommentPreferences />;
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="px-4 py-3 border-b dark:border-gray-700 flex items-center justify-between">
        <button 
          onClick={goBack}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="font-semibold">
          {activeCategory ? activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1) : 'Settings'}
        </span>
        <button 
          onClick={closeAll}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeCategory ? (
          renderCategoryContent()
        ) : (
          <div className="p-4 space-y-2">
            {/* Settings Categories */}
            <button
              onClick={() => setActiveCategory('appearance')}
              className="w-full p-3 flex items-center space-x-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="text-xl">🎨</span>
              <span>Appearance</span>
            </button>
            
            {/* Add more category buttons here as implemented */}
            <button
              onClick={() => setActiveCategory('notifications')}
              className="w-full p-3 flex items-center space-x-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="text-xl">🔔</span>
              <span>Notifications</span>
            </button>
            
            <button
              onClick={() => setActiveCategory('privacy')}
              className="w-full p-3 flex items-center space-x-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="text-xl">🔒</span>
              <span>Privacy & Security</span>
            </button>

            <button
              onClick={() => setActiveCategory('comments')}
              className="w-full p-3 flex items-center space-x-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="text-xl">💭</span>
              <span>Comment Preferences</span>
            </button>

            <button
              onClick={() => setActiveCategory('wallet')}
              className="w-full p-3 flex items-center space-x-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="text-xl">👛</span>
              <span>Wallet Settings</span>
            </button>

            <button
              onClick={() => setActiveCategory('language')}
              className="w-full p-3 flex items-center space-x-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="text-xl">🌍</span>
              <span>Language & Region</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;