// Frontend/extension/src/components/CommentBox.jsx
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePreferences } from '../contexts/PreferencesContext';
import { useNavigation } from '../contexts/NavigationContext';

export default function CommentBox({ onSubmit }) {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { preferences } = usePreferences();
  const { navigateTo } = useNavigation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigateTo('login');
      return;
    }

    if (!comment.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit?.(comment);
      setComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show preview if enabled in preferences
  const showPreview = preferences.comments?.showPreview && comment.trim().length > 0;

  // Rich text options if enabled
  const richTextEnabled = preferences.comments?.richTextEnabled;

  if (!isAuthenticated) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Please log in to comment on this page.
          </p>
          <button
            onClick={() => navigateTo('login')}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md 
                     hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Login to Comment
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        {/* User info */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <span>Commenting as:</span>
          <span className="font-medium">
            {user.username || `${user.walletAddress.substring(0, 6)}...${user.walletAddress.substring(38)}`}
          </span>
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

        {/* Preview section */}
        {showPreview && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Preview
            </h3>
            <div className="text-gray-600 dark:text-gray-400 text-sm">
              {comment}
            </div>
          </div>
        )}
      </div>

      {/* Rich text toolbar */}
      {richTextEnabled && (
        <div className="flex space-x-2">
          {/* Add rich text buttons here if needed */}
        </div>
      )}

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