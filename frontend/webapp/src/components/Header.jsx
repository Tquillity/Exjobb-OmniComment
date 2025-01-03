// Frontend/webapp/src/components/Header.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { shortenAddress } from '../utils/helpers';
import DarkModeToggle from './DarkModeToggle';

export default function Header({ user, onDisconnect }) {
  const location = useLocation();
  const isConnected = Boolean(user?.walletAddress);
  
  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Comments', href: '/comments' },
    { name: 'Profile', href: '/profile' },
    { name: 'Subscription', href: '/subscription' },
  ];

  return (
    <header className="bg-white dark:bg-gray-800 shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                OmniComment
              </Link>
            </div>
            {isConnected && (
              <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      location.pathname === item.href
                        ? 'border-indigo-500 text-gray-900 dark:text-white'
                        : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-200'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            )}
          </div>
          {isConnected && (
            <div className="flex items-center space-x-4">
              <DarkModeToggle />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {user.username || shortenAddress(user.walletAddress)}
              </span>
              <button
                onClick={onDisconnect}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}