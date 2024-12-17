// src/App.jsx
import { useState, useEffect } from 'react';
import CommentBox from './components/CommentBox';
import { fetchComments, postComment } from './utils/api';

// ! Test wallet address - will be replaced with proper auth later
const TEST_WALLET_ADDRESS = '0x62884985ce480347a733c7f4d160a622b83f6f78';

function App() {
  const [currentUrl, setCurrentUrl] = useState('');
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadComments = async () => {
      try {
        // Get current tab URL
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const url = tabs[0].url;
        setCurrentUrl(url);
        
        // Fetch comments for current URL
        const fetchedComments = await fetchComments(url);
        setComments(fetchedComments);
      } catch (error) {
        console.error('Error:', error);
        setError('Failed to load comments');
      } finally {
        setLoading(false);
      }
    };

    loadComments();
  }, []);

  const handleSubmitComment = async (content) => {
    try {
      const newComment = await postComment({
        url: currentUrl,
        content,
        walletAddress: TEST_WALLET_ADDRESS,
      });
      setComments(prev => [newComment, ...prev]);
    } catch (error) {
      console.error('Error posting comment:', error);
      setError('Failed to post comment');
    }
  };

  if (loading) return <div className="p-4">Loading comments...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="w-96 p-4">
      <h1 className="text-xl font-bold mb-4">Comments for this page</h1>
      <CommentBox onSubmit={handleSubmitComment} />
      <div className="mt-4 space-y-4">
        {comments.length === 0 ? (
          <p className="text-gray-500">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="p-3 bg-white rounded shadow">
              <p className="break-words">{comment.content}</p>
              <div className="mt-2 text-sm text-gray-500 flex justify-between">
                <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                <span className="text-xs truncate" title={comment.walletAddress}>
                  {comment.walletAddress.substring(0, 6)}...{comment.walletAddress.substring(38)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;