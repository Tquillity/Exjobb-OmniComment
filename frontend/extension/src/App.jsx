// Frontend/extension/src/App.jsx
import { useState, useEffect } from 'react';
import CommentBox from './components/CommentBox';
import Header from './components/Header';
import Settings from './pages/Settings';
import Login from './components/Login';
import { NavigationProvider, useNavigation } from './contexts/NavigationContext';
import { ThemeProvider } from './contexts/ThemeContexts';
import { PreferencesProvider } from './contexts/PreferencesContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { fetchComments, postComment } from './services/api';
import About from './pages/About';
import MyComments from './pages/MyComments';
import Statistics from './pages/Statistics';
import Comment from './components/Comment';
import Bookmarks from './pages/Bookmarks';

function AppContent() {
  const { currentPage } = useNavigation();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
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
        
        // Only fetch comments if URL exists
        if (url) {
          const fetchedComments = await fetchComments(url);
          setComments(fetchedComments);
        }
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
    if (!isAuthenticated) {
      setError('Please login to comment');
      return;
    }

    try {
      console.log('Submitting comment with user:', user);
      const newComment = await postComment({
        url: currentUrl,
        content,
        walletAddress: user.walletAddress,
        username: user.username
      });
      console.log('Received new comment:', newComment);
      setComments(prev => [newComment, ...prev]);
    } catch (error) {
      console.error('Error posting comment:', error);
      setError('Failed to post comment');
    }
  };

  // Render different pages based on navigation state
  const renderContent = () => {
    // Show loading state while checking authentication
    if (authLoading) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="p-4">Loading...</div>
        </div>
      );
    }

    // Handle protected routes
    const protectedPages = ['settings', 'myComments', 'statistics'];
    if (protectedPages.includes(currentPage) && !isAuthenticated) {
      return <Login onSuccess={() => {/* Handle successful login */}} />;
    }

    switch (currentPage) {
      case 'settings':
        return <Settings />;
      case 'about':
        return <About />;
      case 'myComments':
        return <MyComments />;
      case 'statistics':
        return <Statistics />;
      case 'bookmarks':
        return <Bookmarks />;
      case 'login':
        return <Login onSuccess={() => {/* Handle successful login */}} />;
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
                {isAuthenticated ? (
                  <CommentBox onSubmit={handleSubmitComment} />
                ) : (
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <p>Please login to comment</p>
                  </div>
                )}
                <div className="mt-4 space-y-4">
                  {comments.length === 0 ? (
                    <p className="text-gray-500">No comments yet. Be the first to comment!</p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment._id} className="p-3 bg-white dark:bg-gray-800 rounded shadow">
                        <Comment 
                          commentId={comment._id}
                          content={comment.content}
                          timestamp={comment.createdAt}
                          walletAddress={comment.walletAddress}
                          username={comment.username}
                          likes={comment.likes}
                          dislikes={comment.dislikes}
                          isBookmarked={user?.bookmarkedComments?.some(
                            bookmark => bookmark._id === comment._id || bookmark === comment._id
                          )}
                        />
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
    <AuthProvider>
      <ThemeProvider>
        <PreferencesProvider>   
          <NavigationProvider>
            <AppContent />
          </NavigationProvider>
        </PreferencesProvider>   
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;