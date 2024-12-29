// Frontend/webapp/src/components/CommentBoard.jsx
import React, { useState, useEffect } from 'react';
import { formatDistance } from 'date-fns';
import { Search, TrendingUp } from 'lucide-react';
import Loading from './Loading';
import AdvancedFilterPanel from './AdvancedFilterPanel';

const CommentBoard = () => {
  const [comments, setComments] = useState([]);
  const [filteredComments, setFilteredComments] = useState([]);
  const [trendingUrls, setTrendingUrls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({});

  useEffect(() => {
    fetchComments();
    fetchTrendingUrls();
  }, []);

  useEffect(() => {
    // Apply search filter whenever searchTerm changes
    const filtered = comments.filter(comment => 
      comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.url.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredComments(filtered);
  }, [searchTerm, comments]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/comments`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      const data = await response.json();
      setComments(data);
      setFilteredComments(data);
    } catch (err) {
      setError('Failed to load comments');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTrendingUrls = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/comments/trending`);
      if (!response.ok) throw new Error('Failed to fetch trending URLs');
      const data = await response.json();
      setTrendingUrls(data.map(item => ({
        ...item,
        commentCount: item.count
      })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleFilterChange = (filters) => {
    let filtered = [...comments];
    
    // Apply advanced filters
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

    // Apply sorting
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

  if (isLoading) return <Loading />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search comments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <AdvancedFilterPanel
              onFilterChange={handleFilterChange}
              activeFilters={activeFilters}
              onClearFilters={(filterKey) => {
                const newFilters = { ...activeFilters };
                delete newFilters[filterKey];
                handleFilterChange(newFilters);
              }}
            />
            
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredComments.map((comment) => (
                <div key={comment._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex justify-between items-start">
                    <div className="flex-grow">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        <a href={comment.url} className="hover:underline">{comment.url}</a>
                      </p>
                      <p className="text-gray-900 dark:text-white">{comment.content}</p>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {formatDistance(new Date(comment.createdAt), new Date(), { addSuffix: true })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-red-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Trending URLs</h2>
            </div>
            <div className="space-y-3">
              {trendingUrls.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">{index + 1}</span>
                  <a href={item.url} className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:underline truncate">
                    {item.url}
                  </a>
                  <span className="text-xs text-gray-500 dark:text-gray-400">({item.commentCount} comments)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentBoard;