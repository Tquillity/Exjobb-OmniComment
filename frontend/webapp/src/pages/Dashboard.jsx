// src/pages/Dashboard.jsx
import React from 'react';
import UserDashboard from '../components/UserDashboard';
import TransactionHistory from '../components/TransactionHistory';

export default function Dashboard({ account }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <UserDashboard account={account} />
          <div className="mt-8">
            <TransactionHistory />
          </div>
        </div>
      </div>
    </div>
  );
}