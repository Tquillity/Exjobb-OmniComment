// Frontend/webapp/src/components/CommentBoardUser.jsx
import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { MessageSquare, ThumbsUp, Bookmark } from 'lucide-react';
import Loading from './Loading';
import AdvancedFilterPanel from './AdvancedFilterPanel';

const UserCommentBoard = ({ account }) => {
  const [comments, setComments] = useState([]);
  const [filteredComments, setFilteredComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('created');
  const [activeFilters, setActiveFilters] = useState({});

  useEffect(() => {
    if (account) {
      fetchUserComments(activeTab);
    }
  }, [account, activeTab]);

  const fetchUserComments = async (type) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/comments/user/${account}?type=${type}`
      );
      if (!response.ok) throw new Error('Failed to fetch comments');
      const data = await response.json();
      setComments(data);
      setFilteredComments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (filters) => {
    let filtered = [...comments];
    
    if (filters.searchTerm) {
      filtered = filtered.filter(comment => 
        comment.content.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        comment.url.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    if (filters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(filterDate.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(filterDate.getMonth() - 1);
          break;
        case 'year':
          filterDate.setFullYear(filterDate.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(comment => 
        new Date(comment.createdAt) > filterDate
      );
    }

    if (filters.minLikes) {
      filtered = filtered.filter(comment => 
        comment.likes.length >= parseInt(filters.minLikes)
      );
    }

    if (filters.hasReplies) {
      filtered = filtered.filter(comment => comment.replies?.length > 0);
    }

    switch (filters.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'mostLiked':
        filtered.sort((a, b) => b.likes.length - a.likes.length);
        break;
      case 'mostReplies':
        filtered.sort((a, b) => (b.replies?.length || 0) - (a.replies?.length || 0));
        break;
    }

    setFilteredComments(filtered);
    setActiveFilters(filters);
  };

  if (!account) return null;
  if (error) return (
    <div className="text-red-500 dark:text-red-400 p-4">{error}</div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
      <h2 className="text-xl font-semibold p-4 border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
        My Comments
      </h2>

      <AdvancedFilterPanel
        onFilterChange={handleFilterChange}
        activeFilters={activeFilters}
        onClearFilters={(filterKey) => {
          const newFilters = { ...activeFilters };
          delete newFilters[filterKey];
          handleFilterChange(newFilters);
        }}
      />

      <Tabs defaultValue="created" onValueChange={setActiveTab}>
        <TabsList className="border-b border-gray-200 dark:border-gray-700 w-full justify-start p-2">
          <TabsTrigger value="created" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Created
          </TabsTrigger>
          <TabsTrigger value="interactions" className="flex items-center gap-2">
            <ThumbsUp className="h-4 w-4" />
            Interactions
          </TabsTrigger>
          <TabsTrigger value="bookmarked" className="flex items-center gap-2">
            <Bookmark className="h-4 w-4" />
            Bookmarked
          </TabsTrigger>
        </TabsList>

        {isLoading ? (
          <div className="p-4">
            <Loading />
          </div>
        ) : (
          <>
            <TabsContent value="created" className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredComments.length === 0 ? (
                <div className="p-4 text-gray-500 dark:text-gray-400">
                  No comments found
                </div>
              ) : (
                filteredComments.map((comment) => (
                  <div key={comment._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      <a href={comment.url} className="hover:underline">
                        {comment.url}
                      </a>
                    </p>
                    <p className="text-gray-900 dark:text-white">{comment.content}</p>
                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(comment.createdAt).toLocaleDateString()}
                      <span className="ml-2">• {comment.likes.length} likes</span>
                      {comment.replies?.length > 0 && (
                        <span className="ml-2">• {comment.replies.length} replies</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="interactions" className="divide-y divide-gray-200 dark:divide-gray-700">
              {/* Similar structure as "created" tab */}
            </TabsContent>

            <TabsContent value="bookmarked" className="divide-y divide-gray-200 dark:divide-gray-700">
              {/* Similar structure as "created" tab */}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default UserCommentBoard;