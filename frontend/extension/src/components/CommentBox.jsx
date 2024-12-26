// Frontend/extension/src/components/CommentBox.jsx
import React, { useState, useContext } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePreferences } from '../contexts/PreferencesContext';
import { BalanceContext } from '../contexts/BalanceContext';
import { AlertCircle } from 'lucide-react';

const COMMENT_COST = 0.001; // 0.001 POL per comment

export default function EnhancedCommentBox({ onSubmit }) {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const { isAuthenticated, user } = useAuth();
  const { preferences } = usePreferences();
  const { balance, updateBalance } = useContext(BalanceContext);

  const checkCanComment = async () => {
    try {
      // Get token from chrome.storage instead of localStorage
      const result = await chrome.storage.local.get(['token']);
      const token = result.token;
      console.log('Auth token being sent:', token ? 'Present' : 'Missing');
  
      const response = await fetch('http://localhost:3000/api/blockchain/can-comment', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Can comment response:', data);
  
      if (data.balance !== undefined) {
        updateBalance();
      }
  
      return data.canComment;
    } catch (error) {
      console.error('Error checking comment eligibility:', error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!isAuthenticated) {
      setError('Please connect your wallet to comment');
      return;
    }

    if (!comment.trim()) {
      return;
    }

    // Check if user has enough balance
    const currentBalance = parseFloat(balance);
    if (currentBalance < COMMENT_COST) {
      setError(`Insufficient balance. You need ${COMMENT_COST} POL to comment. Current balance: ${currentBalance.toFixed(4)} POL`);
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Verify balance on backend first
      const canComment = await checkCanComment();
      if (!canComment) {
        setError('You do not have sufficient balance to comment');
        return;
      }

      // If verification passes, submit the comment
      await onSubmit?.(comment);
      
      // After successful comment, update balance
      await updateBalance();
      
      // Clear comment
      setComment('');
      setError('');
      
    } catch (error) {
      console.error('Error submitting comment:', error);
      setError(error.message || 'Failed to submit comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Please connect your wallet to comment
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        {/* User info */}
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>Commenting as: {user.username || `${user.walletAddress.substring(0, 6)}...${user.walletAddress.substring(38)}`}</span>
          <span>Cost: {COMMENT_COST} POL</span>
        </div>

        {/* Comment input */}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full p-3 border border-gray-300 dark:border-gray-700 
                   rounded-md bg-white dark:bg-gray-800 
                   text-gray-900 dark:text-white
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Write a comment..."
          rows={3}
          disabled={isSubmitting}
        />

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={isSubmitting || !comment.trim()}
        className={`px-4 py-2 bg-blue-600 text-white rounded-md
                   ${isSubmitting || !comment.trim() 
                     ? 'opacity-50 cursor-not-allowed' 
                     : 'hover:bg-blue-700'} 
                   transition-colors`}
      >
        {isSubmitting ? 'Posting...' : 'Post Comment'}
      </button>
    </form>
  );
}