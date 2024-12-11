// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import Loading from '../components/Loading';

export function Profile({ account }) {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!account) {
        setIsLoading(false);
        return;
      }

      try {
        console.log('Fetching data for account:', account);
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/${account}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch user data');
        }
        
        const data = await response.json();
        console.log('Received user data:', data);
        setUserData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [account]);

  if (!account) return (
    <div className="bg-white shadow rounded-lg p-6">
      <p className="text-gray-500">Please connect your wallet to view your profile.</p>
    </div>
  );

  if (isLoading) return <Loading message="Loading profile..." />;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Settings</h2>
      
      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <p className="text-red-600">{error}</p>
        </div>
      ) : null}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Connected Address
          </label>
          <p className="mt-1 text-sm text-gray-500">{account}</p>
        </div>
        
        {userData && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Subscription Status
              </label>
              <p className="mt-1 text-sm text-gray-500">
                {userData.subscription?.type || 'None'}
                {userData.subscription?.expiresAt && (
                  <span className="ml-2 text-gray-400">
                    (Expires: {new Date(userData.subscription.expiresAt).toLocaleDateString()})
                  </span>
                )}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Reputation Score
              </label>
              <p className="mt-1 text-sm text-gray-500">
                {userData.reputation || 0}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Member Since
              </label>
              <p className="mt-1 text-sm text-gray-500">
                {new Date(userData.createdAt).toLocaleDateString()}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}