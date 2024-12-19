// Frontend/extension/src/services/api.js
const API_BASE_URL = 'http://localhost:3000/api';

// Comment-related API calls
export const fetchComments = async (url) => {
  try {
    const response = await fetch(`${API_BASE_URL}/comments?url=${encodeURIComponent(url)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch comments');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};

export const postComment = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to post comment');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error posting comment:', error);
    throw error;
  }
};

export const updateUserSettings = async (walletAddress, settings) => {
  try {
    console.log('Updating settings for wallet:', walletAddress);
    console.log('New settings:', settings);

    if (!walletAddress || !settings) {
      throw new Error('Missing required parameters');
    }

    // Ensure settings object has the correct structure
    if (!settings.settings || !settings.settings.comments) {
      throw new Error('Invalid settings structure');
    }

    const response = await fetch(`${API_BASE_URL}/users/${walletAddress}/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(settings)
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Server returned an error');
    }

    const data = await response.json();
    console.log('Settings updated successfully:', data);
    return data;
  } catch (error) {
    console.error('Settings update failed:', error);
    throw new Error(`Failed to update settings: ${error.message}`);
  }
};

export const getUserSettings = async (walletAddress) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${walletAddress}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user settings');
    }

    const userData = await response.json();
    return userData.settings;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};