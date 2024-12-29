// Frontend/webapp/src/pages/Subscription.jsx
import React from 'react';

export function Subscription() {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Subscription Management
      </h2>
      <div className="grid gap-6">
        <div className="border dark:border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Current Plan</h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Free Plan</p>
          {/* Add subscription options here */}
        </div>
      </div>
    </div>
  );
}