// Frontend/extension/src/pages/MyComments.jsx
import React, { useState, useEffect } from 'react';
import { ChevronLeft, X } from 'lucide-react';
import { useNavigation } from '../contexts/NavigationContext';
import Comment from '../components/Comment';

const MyComments = () => {
  const { goBack, closeAll } = useNavigation();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const TEST_WALLET_ADDRESS = '0x62884985ce480347a733c7f4d160a622b83f6f78';

  useEffect(() => {
    const fetchMyComments = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/comments?walletAddress=${TEST_WALLET_ADDRESS}`);
        if (!response.ok) throw new Error('Failed to fetch comments');
        const data = await response.json();
        setComments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyComments();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <button onClick={goBack} className="p-1 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="font-semibold">My Comments</span>
          <button onClick={closeAll} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">Loading your comments...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <button onClick={goBack} className="p-1 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="font-semibold">My Comments</span>
          <button onClick={closeAll} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <button onClick={goBack} className="p-1 hover:bg-gray-100 rounded-full">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="font-semibold">My Comments</span>
        <button onClick={closeAll} className="p-1 hover:bg-gray-100 rounded-full">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {comments.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>You haven't made any comments yet.</p>
            <p className="mt-2">Start commenting on any webpage to see them here!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment._id} className="relative group">
                <Comment
                  content={comment.content}
                  timestamp={comment.createdAt}
                  walletAddress={comment.walletAddress}
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