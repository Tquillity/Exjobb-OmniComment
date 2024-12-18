// Frontend/extension/src/App.jsx
import { useState, useEffect } from 'react';
import CommentBox from './components/CommentBox';
import Header from './components/Header';
import Settings from './pages/Settings';
import { NavigationProvider, useNavigation } from './contexts/NavigationContext';
import { ThemeProvider } from './contexts/ThemeContexts';
import { fetchComments, postComment } from './utils/api';
import About from './pages/About';

// ! Test wallet address - will be replaced with proper auth later
const TEST_WALLET_ADDRESS = '0x62884985ce480347a733c7f4d160a622b83f6f78';

function AppContent() {
  const { currentPage } = useNavigation();
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

  // Render different pages based on navigation state
  const renderContent = () => {
    switch (currentPage) {
      case 'settings':
        return <Settings />;
      case 'about':
        return <About />;
      case 'main':
      default:
        if (loading) {
          return (
            <>
              <Header currentUrl={currentUrl} />
              <div className="flex-1 flex items-center justify-center">
                <div className="p-4">Loading comments...</div>
              </div>
            </>
          );
        }

        if (error) {
          return (
            <>
              <Header currentUrl={currentUrl} />
              <div className="flex-1 flex items-center justify-center">
                <div className="p-4 text-red-500">{error}</div>
              </div>
            </>
          );
        }

        return (
          <>
            <Header currentUrl={currentUrl} />
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <CommentBox onSubmit={handleSubmitComment} />
                <div className="mt-4 space-y-4">
                  {comments.length === 0 ? (
                    <p className="text-gray-500">No comments yet. Be the first to comment!</p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment._id} className="p-3 bg-white dark:bg-gray-800 rounded shadow">
                        <p className="break-words">{comment.content}</p>
                        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex justify-between">
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
            </div>
          </>
        );
    }
  };

  return (
    <div className="w-96 flex flex-col h-[600px] bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      {renderContent()}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <NavigationProvider>
        <AppContent />
      </NavigationProvider>
    </ThemeProvider>
  );
}

export default App;