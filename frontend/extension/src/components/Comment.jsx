// Frontend/extension/src/components/Comment.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { ThumbsUp, ThumbsDown, MoreVertical, Flag, Trash, Bookmark } from 'lucide-react';
import { Menu } from '@headlessui/react';
import { useAuth } from '../contexts/AuthContext';
import { formatTimestamp } from '../utils/timeFormat';
import { usePreferences } from '../contexts/PreferencesContext';
import { bookmarkComment, unbookmarkComment } from '../services/api';

const Comment = ({ 
  commentId,
  content, 
  timestamp, 
  walletAddress, 
  username,
  likes = [], 
  dislikes = [],
  onLike,
  onDislike,
  onDelete,
  onReport 
}) => {
  const { user, isAuthenticated } = useAuth();
  const { preferences } = usePreferences();
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [authorDisplayName, setAuthorDisplayName] = useState(
    username || `${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}`
  );

  const isOwner = isAuthenticated && user?.walletAddress === walletAddress;
  const hasLiked = likes.includes(user?.walletAddress);
  const hasDisliked = dislikes.includes(user?.walletAddress);

  // Fetch author's display preferences with debounce
  const fetchAuthorPreferences = useCallback(async () => {
    try {
      console.log('Fetching preferences for wallet:', walletAddress);
      const token = await chrome.storage.local.get(['token']).then(result => result.token);
      const response = await fetch(`http://localhost:3000/api/users/${walletAddress}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch user preferences');
      
      const authorData = await response.json();
      console.log('Received author data:', authorData);
      
      if (authorData.displayPreference === 'username' && authorData.username) {
        console.log('Setting display name to username:', authorData.username);
        setAuthorDisplayName(authorData.username);
      } else {
        console.log('Setting display name to wallet address');
        setAuthorDisplayName(`${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}`);
      }
    } catch (error) {
      console.error('Error fetching author preferences:', error);
      setAuthorDisplayName(`${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}`);
    }
  }, [walletAddress]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAuthorPreferences();
    }, 500); // Add 500ms delay

    return () => clearTimeout(timer);
  }, [fetchAuthorPreferences]);

  // Check if comment is bookmarked
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (isAuthenticated && user?.bookmarkedComments) {
        const isBookmarked = user.bookmarkedComments.some(bookmark => bookmark._id === commentId);
        setIsBookmarked(isBookmarked);
      }
    };
    checkBookmarkStatus();
  }, [isAuthenticated, user, commentId]);

  const handleLike = async () => {
    if (!isAuthenticated || isActionLoading) return;
    try {
      setIsActionLoading(true);
      await onLike?.();
    } catch (error) {
      console.error('Error liking comment:', error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDislike = async () => {
    if (!isAuthenticated || isActionLoading) return;
    try {
      setIsActionLoading(true);
      await onDislike?.();
    } catch (error) {
      console.error('Error disliking comment:', error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isOwner || isActionLoading) return;
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      setIsActionLoading(true);
      await onDelete?.();
    } catch (error) {
      console.error('Error deleting comment:', error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReport = async () => {
    if (!isAuthenticated || isActionLoading) return;
    try {
      setIsActionLoading(true);
      await onReport?.();
    } catch (error) {
      console.error('Error reporting comment:', error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleBookmarkToggle = async () => {
    if (!isAuthenticated || isActionLoading) return;
    if (!commentId) {
      console.error('No commentId provided');
      return;
    }

    try {
      setIsActionLoading(true);
      if (isBookmarked) {
        await unbookmarkComment(commentId);
      } else {
        await bookmarkComment(commentId);
      }
      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow space-y-2">
      <p className="text-gray-900 dark:text-gray-100 break-words">
        {content}
      </p>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleLike}
              disabled={!isAuthenticated || isActionLoading}
              className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
                         ${hasLiked ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}
            >
              <ThumbsUp size={16} />
              <span>{likes.length}</span>
            </button>

            <button
              onClick={handleDislike}
              disabled={!isAuthenticated || isActionLoading}
              className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
                         ${hasDisliked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}
            >
              <ThumbsDown size={16} />
              <span>{dislikes.length}</span>
            </button>

            <button
              onClick={handleBookmarkToggle}
              disabled={!isAuthenticated || isActionLoading}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={isBookmarked ? "Remove Bookmark" : "Bookmark Comment"}
            >
              <Bookmark
                size={16}
                className={isBookmarked ? 'text-yellow-500' : 'text-gray-500 dark:text-gray-400'}
              />
            </button>
          </div>

          <span className="text-gray-500 dark:text-gray-400">
            {formatTimestamp(timestamp, preferences.comments?.showTimestamp)}
          </span>

          <span className="text-gray-600 dark:text-gray-300 font-medium">
            {authorDisplayName}
          </span>
        </div>

        <Menu as="div" className="relative">
          <Menu.Button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
            <MoreVertical size={16} className="text-gray-500 dark:text-gray-400" />
          </Menu.Button>

          <Menu.Items className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 
                               rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
            {isOwner && (
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={handleDelete}
                    disabled={isActionLoading}
                    className={`${
                      active ? 'bg-gray-100 dark:bg-gray-700' : ''
                    } flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400`}
                  >
                    <Trash size={16} className="mr-2" />
                    Delete Comment
                  </button>
                )}
              </Menu.Item>
            )}

            {!isOwner && isAuthenticated && (
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={handleReport}
                    disabled={isActionLoading}
                    className={`${
                      active ? 'bg-gray-100 dark:bg-gray-700' : ''
                    } flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                  >
                    <Flag size={16} className="mr-2" />
                    Report Comment
                  </button>
                )}
              </Menu.Item>
            )}
          </Menu.Items>
        </Menu>
      </div>
    </div>
  );
};

export default Comment;