// Frontend/extension/src/pages/MyComments.jsx
import React, { useState, useEffect } from 'react';
import { ChevronLeft, X, RefreshCw, Filter } from 'lucide-react';
import { useNavigation } from '../contexts/NavigationContext';
import { useAuth } from '../contexts/AuthContext';
import Comment from '../components/Comment';
import { Menu } from '@headlessui/react';

const MyComments = () => {
  const { goBack, closeAll } = useNavigation();
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'created', 'interactions'
  const [refreshing, setRefreshing] = useState(false);

  const fetchComments = async () => {
    if (!isAuthenticated || !user?.walletAddress) {
      setError('Please login to view your comments');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/api/comments/user/${user.walletAddress}?type=${filter}`,
        {
          headers: {
            'Authorization': `Bearer ${await chrome.storage.local.get(['token']).then(result => result.token)}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }

      const data = await response.json();
      setComments(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [isAuthenticated, user?.walletAddress, filter]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchComments();
  };

  const handleCommentDelete = async (commentId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${await chrome.storage.local.get(['token']).then(result => result.token)}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }

      setComments(prev => prev.filter(comment => comment._id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="h-full flex flex-col">
        <div className="px-4 py-3 border-b dark:border-gray-700 flex items-center justify-between">
          <button onClick={goBack} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="font-semibold">My Comments</span>
          <button onClick={closeAll} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">Please login to view your comments</p>
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
        <span className="font-semibold">My Comments</span>
        <button onClick={closeAll} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Toolbar */}
      <div className="px-4 py-2 bg-white dark:bg-gray-800 border-b dark:border-gray-700 flex items-center justify-between">
        <Menu as="div" className="relative">
          <Menu.Button className="flex items-center space-x-1 px-3 py-1 text-sm rounded-md 
                                hover:bg-gray-100 dark:hover:bg-gray-700">
            <Filter className="h-4 w-4" />
            <span>{filter.charAt(0).toUpperCase() + filter.slice(1)}</span>
          </Menu.Button>
          <Menu.Items className="absolute left-0 mt-1 w-48 bg-white dark:bg-gray-800 
                               rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => setFilter('all')}
                  className={`${
                    active ? 'bg-gray-100 dark:bg-gray-700' : ''
                  } block px-4 py-2 text-sm w-full text-left`}
                >
                  All Comments
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => setFilter('created')}
                  className={`${
                    active ? 'bg-gray-100 dark:bg-gray-700' : ''
                  } block px-4 py-2 text-sm w-full text-left`}
                >
                  Created by Me
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => setFilter('interactions')}
                  className={`${
                    active ? 'bg-gray-100 dark:bg-gray-700' : ''
                  } block px-4 py-2 text-sm w-full text-left`}
                >
                  My Interactions
                </button>
              )}
            </Menu.Item>
          </Menu.Items>
        </Menu>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className={`p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700
                     ${refreshing ? 'animate-spin' : ''}`}
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Loading comments...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-red-500">{error}</div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>No comments found</p>
            {filter !== 'all' && (
              <p className="mt-2">
                Try changing the filter to see different comments
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment._id} className="relative group">
                <Comment
                  commentId={comment._id}
                  content={comment.content}
                  timestamp={comment.createdAt}
                  walletAddress={comment.walletAddress}
                  username={comment.username}
                  likes={comment.likes}
                  dislikes={comment.dislikes}
                  onDelete={() => handleCommentDelete(comment._id)}
                />
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

export default MyComments;