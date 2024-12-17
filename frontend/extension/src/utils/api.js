// src/utils/api.js
const API_BASE_URL = 'http://localhost:3000/api';

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
