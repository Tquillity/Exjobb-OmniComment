// Frontend/extension/src/components/UserProfile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const [username, setUsername] = useState('');
  const [displayPreference, setDisplayPreference] = useState('wallet');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setDisplayPreference(user.displayPreference || 'wallet');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');

    try {
      await updateUser({
        username,
        displayPreference
      });
      setMessage('Profile updated successfully!');
    } catch (error) {
      setMessage(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-6">Profile Settings</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border rounded-md bg-white dark:bg-gray-800"
              placeholder="Enter username"
            />
          </div>

          {/* Display Preference */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Display Preference
            </label>
            <select
              value={displayPreference}
              onChange={(e) => setDisplayPreference(e.target.value)}
              className="w-full p-2 border rounded-md bg-white dark:bg-gray-800"
            >
              <option value="wallet">Show Wallet Address</option>
              <option value="username">Show Username</option>
            </select>
          </div>

          {/* Wallet Address Display (Read-only) */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Wallet Address
            </label>
            <div className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 font-mono text-sm">
              {user?.walletAddress || 'Not connected'}
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`p-3 rounded-md ${
              message.includes('success') 
                ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
            }`}>
              {message}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSaving}
            className={`w-full p-2 text-white bg-blue-600 rounded-md
              ${isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}
              transition-colors`}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;