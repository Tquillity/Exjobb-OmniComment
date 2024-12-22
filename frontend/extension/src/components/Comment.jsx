// Frontend/extension/src/components/Comment.jsx
import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, MoreVertical, Flag, Trash } from 'lucide-react';
import { Menu } from '@headlessui/react';
import { useAuth } from '../contexts/AuthContext';
import { formatTimestamp } from '../utils/timeFormat';
import { usePreferences } from '../contexts/PreferencesContext';

const Comment = ({ 
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

  const isOwner = isAuthenticated && user?.walletAddress === walletAddress;
  const hasLiked = likes.includes(user?.walletAddress);
  const hasDisliked = dislikes.includes(user?.walletAddress);

  const handleLike = async () => {
    if (!isAuthenticated) return;
    if (isActionLoading) return;

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
    if (!isAuthenticated) return;
    if (isActionLoading) return;

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

    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

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

  // Determine display name based on preferences
  const displayName = username || 
    (preferences.comments?.showWalletAddress 
      ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}`
      : 'Anonymous');

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow space-y-2">
      {/* Content */}
      <p className="text-gray-900 dark:text-gray-100 break-words">
        {content}
      </p>

      {/* Metadata and Actions */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          {/* Like/Dislike Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleLike}
              disabled={!isAuthenticated || isActionLoading}
              className={`flex items-center space-x-1 p-1 rounded hover:bg-gray-100 
                         dark:hover:bg-gray-700 transition-colors
                         ${hasLiked ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}
            >
              <ThumbsUp size={16} />
              <span>{likes.length}</span>
            </button>

            <button
              onClick={handleDislike}
              disabled={!isAuthenticated || isActionLoading}
              className={`flex items-center space-x-1 p-1 rounded hover:bg-gray-100 
                         dark:hover:bg-gray-700 transition-colors
                         ${hasDisliked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}
            >
              <ThumbsDown size={16} />
              <span>{dislikes.length}</span>
            </button>
          </div>

          {/* Timestamp */}
          <span className="text-gray-500 dark:text-gray-400">
            {formatTimestamp(timestamp, preferences.comments?.showTimestamp)}
          </span>

          {/* User Info */}
          <span className="text-gray-600 dark:text-gray-300 font-medium">
            {displayName}
          </span>
        </div>

        {/* More Actions Menu */}
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