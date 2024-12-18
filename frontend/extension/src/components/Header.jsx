// Frontend/extension/src/components/Header.jsx
import React from 'react';
import SettingsMenu from './SettingsMenu';

const Header = ({ currentUrl }) => {
  return (
    <div className="px-4 py-3 bg-white dark:bg-gray-900 border-b dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">OmniComment</h1>
          {currentUrl && (
            <span className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
              {new URL(currentUrl).hostname}
            </span>
          )}
        </div>
        <SettingsMenu />
      </div>
    </div>
  );
};

export default Header;