// Frontend/webapp/src/components/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

export function Layout({ user, onDisconnect }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header user={user} onDisconnect={onDisconnect} />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Outlet />
        </div>
      </main>
      <footer className="bg-white dark:bg-gray-800 shadow-inner mt-auto">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
            OmniComment © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}