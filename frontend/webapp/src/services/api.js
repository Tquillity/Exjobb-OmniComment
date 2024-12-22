// Frontend/webapp/src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function registerUser(walletAddress) {
  try {
    if (!API_BASE_URL) {
      throw new Error('API_BASE_URL is not defined');
    }
    
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ walletAddress }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to register user');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
}

export async function getComments(url) {
  if (!API_BASE_URL) {
    throw new Error('API_BASE_URL is not defined');
  }
  const response = await fetch(`${API_BASE_URL}/comments?url=${encodeURIComponent(url)}`);
  if (!response.ok) throw new Error('Failed to fetch comments');
  return response.json();
}

export async function postComment(url, content, signature) {
  if (!API_BASE_URL) {
    throw new Error('API_BASE_URL is not defined');
  }
  const response = await fetch(`${API_BASE_URL}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url, content, signature }),
  });
  if (!response.ok) throw new Error('Failed to post comment');
  return response.json();
}