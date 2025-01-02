// Frontend/extension/src/pages/Settings.jsx
import React from 'react';
import AppearanceSettings from '../components/AppearanceSettings';
import { useNavigation } from '../contexts/NavigationContext';
import { ChevronLeft, X } from 'lucide-react';
import CommentPreferences from '../components/CommentPreferences';
import UserProfile from '../components/UserProfile';

const Settings = () => {
  const { navigateTo, goBack, closeAll, currentParams } = useNavigation();
  const activeCategory = currentParams?.category;

  const renderCategoryContent = () => {
    switch (activeCategory) {
      case 'appearance':
        return <AppearanceSettings />;
      case 'comments':
        return <CommentPreferences />;
      case 'profile':
        return <UserProfile />;
      default:
        return null;
    }
  };

  const handleBack = () => {
    if (activeCategory) {
      // If we're in a category, go back to main settings
      navigateTo('settings');
    } else {
      // If we're in main settings, go back to previous screen
      goBack();
    }
  };

  const handleCategoryClick = (category) => {
    navigateTo('settings', { category });
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="px-4 py-3 border-b dark:border-gray-700 flex items-center justify-between">
        <button 
          onClick={handleBack}
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
              onClick={() => handleCategoryClick('profile')}
              className="w-full p-3 flex items-center space-x-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="text-xl">👤</span>
              <span>Profile Settings</span>
            </button>

            <button
              onClick={() => handleCategoryClick('comments')}
              className="w-full p-3 flex items-center space-x-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="text-xl">💭</span>
              <span>Comment Settings</span>
            </button>

            <button
              onClick={() => handleCategoryClick('appearance')}
              className="w-full p-3 flex items-center space-x-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="text-xl">🎨</span>
              <span>Extension Settings</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;