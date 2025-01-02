// Frontend/webapp/src/services/bookmarks.js
import apiClient from './apiClient';

export const bookmarkComment = async (commentId) => {
  try {
    const response = await apiClient.post('/users/bookmark', { commentId });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to bookmark comment');
  }
};

export const unbookmarkComment = async (commentId) => {
  try {
    const response = await apiClient.post('/users/unbookmark', { commentId });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to remove bookmark');
  }
};

export const getBookmarkedComments = async () => {
  try {
    const response = await apiClient.get('/users/bookmarks');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch bookmarks');
  }
};