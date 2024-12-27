// Frontend/extension/src/pages/Bookmarks.jsx
import React, { useEffect, useState } from 'react';
import { ChevronLeft, X, RefreshCw } from 'lucide-react';
import Comment from '../components/Comment';
import { useNavigation } from '../contexts/NavigationContext';
import { useAuth } from '../contexts/AuthContext';

const Bookmarks = () => {
  const { goBack, closeAll } = useNavigation();
  const { user, isAuthenticated } = useAuth();
  const [bookmarkedComments, setBookmarkedComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Fetch the bookmarked comments
  const fetchBookmarks = async () => {
    if (!isAuthenticated || !user?.walletAddress) {
      setError('Please login to view bookmarked comments.');
      setLoading(false);
      return;
    }
  
    try {
      setError(null);
      const token = await chrome.storage.local.get(['token']).then(resp => resp.token);
      
      const response = await fetch(`http://localhost:3000/api/users/bookmarks`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch bookmarks');
      }
  
      const data = await response.json();
      setBookmarkedComments(data);
    } catch (err) {
      console.error('Error fetching bookmarked comments:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, [isAuthenticated, user?.walletAddress]);

  // Optional function to unbookmark
  const handleUnbookmark = async (commentId) => {
    try {
      const token = await chrome.storage.local.get(['token']).then(resp => resp.token);
      const response = await fetch('http://localhost:3000/api/users/unbookmark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ commentId })
      });
  
      if (!response.ok) {
        throw new Error('Failed to unbookmark');
      }
  
      setBookmarkedComments(prev => prev.filter(b => b._id !== commentId));
    } catch (error) {
      console.error('Error unbookmarking comment:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBookmarks();
  };

  if (!isAuthenticated) {
    return (
      <div className="h-full flex flex-col">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <button onClick={goBack} className="p-1 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="font-semibold">Bookmarked Comments</span>
          <button onClick={closeAll} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">Please login to view bookmarked comments</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="px-4 py-3 bg-white dark:bg-gray-800 border-b dark:border-gray-700 flex items-center justify-between">
        <button onClick={goBack} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="font-semibold">Bookmarked Comments</span>
        <button onClick={closeAll} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Toolbar */}
      <div className="px-4 py-2 bg-white dark:bg-gray-800 border-b dark:border-gray-700 flex items-center justify-end">
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className={`p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700
                     ${refreshing ? 'animate-spin' : ''}`}
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Bookmarked Comments List */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Loading bookmarks...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-red-500">{error}</div>
          </div>
        ) : bookmarkedComments.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>No bookmarked comments found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookmarkedComments.map((comment) => (
              <div key={comment._id} className="relative group">
                {/* Reuse the existing <Comment> component */}
                <Comment
                  commentId={comment._id}
                  content={comment.content}
                  timestamp={comment.createdAt}
                  walletAddress={comment.walletAddress}
                  username={comment.username}
                  likes={comment.likes}
                  dislikes={comment.dislikes}
                />
                <button
                  onClick={() => handleUnbookmark(comment._id)}
                  className="
                    mt-1 text-sm text-blue-600 dark:text-blue-400 hover:underline 
                    focus:outline-none
                  "
                >
                  Remove Bookmark
                </button>
                <a 
                  href={comment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 text-xs text-gray-500 hover:text-blue-500 block truncate"
                >
                  {comment.url}
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookmarks;