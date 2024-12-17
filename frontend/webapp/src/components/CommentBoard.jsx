// src/components/CommentBoard.jsx
import React, { useState, useEffect } from 'react';
import { formatDistance } from 'date-fns';
import { Search, TrendingUp, Filter } from 'lucide-react';
import Loading from './Loading';

// CommentBoard component
const CommentBoard = () => {
  const [comments, setComments] = useState([]);
  const [trendingUrls, setTrendingUrls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchComments();
    fetchTrendingUrls();
  }, []);

  const fetchComments = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/comments`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      const data = await response.json();
      setComments(data);
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
      setTrendingUrls(data);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredComments = comments.filter(comment => {
    const matchesSearch = comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comment.url.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'all') return matchesSearch;
    if (filterType === 'recent') return matchesSearch && new Date(comment.createdAt) > new Date(Date.now() - 86400000);
    return matchesSearch;
  });

  if (isLoading) return <Loading />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main content */}
        <div className="lg:col-span-3">
          <div className="bg-white shadow rounded-lg">
            {/* Search and filter header */}
            <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Search comments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="all">All Comments</option>
                <option value="recent">Last 24 Hours</option>
              </select>
            </div>
            
            {/* Comments list */}
            <div className="divide-y divide-gray-200">
              {filteredComments.map((comment) => (
                <div key={comment._id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-grow">
                      <p className="text-sm text-gray-500 mb-1">
                        <a href={comment.url} className="hover:underline">{comment.url}</a>
                      </p>
                      <p className="text-gray-900">{comment.content}</p>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    {formatDistance(new Date(comment.createdAt), new Date(), { addSuffix: true })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trending sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-red-500" />
              <h2 className="text-lg font-semibold">Trending URLs</h2>
            </div>
            <div className="space-y-3">
              {trendingUrls.map((item, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-gray-400 text-sm">{index + 1}</span>
                  <a href={item.url} className="text-sm text-gray-600 hover:text-gray-900 hover:underline truncate">
                    {item.url}
                  </a>
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