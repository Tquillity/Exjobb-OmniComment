// src/components/Layout.jsx
import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Header from './Header';

export function Layout({ isConnected, account, onDisconnect }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header account={account} onDisconnect={onDisconnect} />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Outlet />
        </div>
      </main>
      <footer className="bg-white shadow-inner mt-auto">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            OmniComment © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}