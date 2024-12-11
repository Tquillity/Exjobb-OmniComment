// src/pages/Profile.jsx
import React from 'react';

export function Profile({ account }) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Settings</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Connected Address
          </label>
          <p className="mt-1 text-sm text-gray-500">{account}</p>
        </div>
        {/* Add more profile settings here */}
      </div>
    </div>
  );
}