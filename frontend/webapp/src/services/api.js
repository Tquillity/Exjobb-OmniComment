// src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function getComments(url) {
  const response = await fetch(`${API_BASE_URL}/comments?url=${encodeURIComponent(url)}`);
  if (!response.ok) throw new Error('Failed to fetch comments');
  return response.json();
}

export async function postComment(url, content, signature) {
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