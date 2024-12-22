// Frontend/webapp/src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import Loading from '../components/Loading';
import UserCommentBoard from '../components/CommentBoardUser';

export function Profile({ account }) {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    age: '',
    nationality: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, [account]);

  const fetchUserData = async () => {
    if (!account) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/${account}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const data = await response.json();
      setUserData(data);
      setFormData({
        username: data.username || '',
        age: data.age || '',
        nationality: data.nationality || ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/${account}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedData = await response.json();
      setUserData(updatedData);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!account) return (
    <div className="bg-white shadow rounded-lg p-6">
      <p className="text-gray-500">Please connect your wallet to view your profile.</p>
    </div>
  );

  if (isLoading) return <Loading message="Loading profile..." />;

  return (
    <div className="space-y-6">
      {/* Profile Information Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Edit Profile
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                min="13"
                max="120"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Nationality</label>
              <input
                type="text"
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Connected Address</label>
              <p className="mt-1 text-sm text-gray-500">{account}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <p className="mt-1 text-sm text-gray-500">{userData?.username || 'Not set'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Age</label>
              <p className="mt-1 text-sm text-gray-500">{userData?.age || 'Not set'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Nationality</label>
              <p className="mt-1 text-sm text-gray-500">{userData?.nationality || 'Not set'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Subscription Status</label>
              <p className="mt-1 text-sm text-gray-500">
                {userData?.subscription?.type || 'None'}
                {userData?.subscription?.expiresAt && (
                  <span className="ml-2 text-gray-400">
                    (Expires: {new Date(userData.subscription.expiresAt).toLocaleDateString()})
                  </span>
                )}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Reputation Score</label>
              <p className="mt-1 text-sm text-gray-500">{userData?.reputation || 0}</p>
            </div>
          </div>
        )}
      </div>

      {/* User Comment Board Section */}
      <UserCommentBoard account={account} />
    </div>
  );
}