// Frontend/extension/src/components/Header.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '../contexts/NavigationContext';
import SettingsMenu from './SettingsMenu';
import { UserCircle, LogOut, Globe } from 'lucide-react';

const Header = ({ currentUrl }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { navigateTo } = useNavigation();

  const handleLogout = async () => {
    await logout();
    navigateTo('main');
  };

  const displayName = user?.username || (user?.walletAddress
    ? `${user.walletAddress.substring(0, 6)}...${user.walletAddress.substring(38)}`
    : null);

  return (
    <div className="px-4 py-2 bg-white dark:bg-gray-900 border-b dark:border-gray-700 shadow-sm">
      {/* Main header row with app name and controls */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          OmniComment
        </h1>

        <div className="flex items-center space-x-2">
          {isAuthenticated ? (
            <>
              <button
                onClick={() => navigateTo('myComments')}
                className="flex items-center space-x-2 px-3 py-1 rounded-full 
                          hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <UserCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {displayName}
                </span>
              </button>
              <SettingsMenu />
              <button
                onClick={handleLogout}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 
                          text-gray-600 dark:text-gray-400 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigateTo('login')}
                className="px-4 py-1 bg-blue-600 text-white rounded-full 
                          hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Login
              </button>
              <SettingsMenu />
            </>
          )}
        </div>
      </div>

      {/* URL subheader */}
      {currentUrl && (
        <div className="mt-0.1 mb-0.1 flex items-center text-sm text-gray-500 dark:text-gray-400">
          <Globe className="w-4 h-4 mr-1" />
          <span className="truncate hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer">
            {new URL(currentUrl).hostname}
          </span>
        </div>
      )}
    </div>
  );
};

export default Header;