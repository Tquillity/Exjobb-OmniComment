// Frontend/extension/src/pages/Statistics.jsx
import React, { useState, useEffect } from 'react';
import { ChevronLeft, X } from 'lucide-react';
import { useNavigation } from '../contexts/NavigationContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const TEST_WALLET_ADDRESS = '0x62884985ce480347a733c7f4d160a622b83f6f78';

const Statistics = () => {
  const { goBack, closeAll } = useNavigation();
  const [statsData, setStatsData] = useState({
    activityByDay: [],
    interactionStats: {},
    topSites: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch user's comments
        const commentsResponse = await fetch(
          `http://localhost:3000/api/comments?walletAddress=${TEST_WALLET_ADDRESS}`
        );
        const comments = await commentsResponse.json();

        // Process comments data
        const processedData = processCommentsData(comments);
        setStatsData(processedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const processCommentsData = (comments) => {
    // Group comments by day
    const activityByDay = Object.entries(
      comments.reduce((acc, comment) => {
        const date = new Date(comment.createdAt).toLocaleDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {})
    ).map(([date, count]) => ({ date, count }));

    // Calculate interaction stats
    const totalComments = comments.length;
    const totalLikes = comments.reduce((sum, comment) => sum + comment.likes.length, 0);
    const totalDislikes = comments.reduce((sum, comment) => sum + comment.dislikes.length, 0);

    // Group comments by URL to find top sites
    const topSites = Object.entries(
      comments.reduce((acc, comment) => {
        const hostname = new URL(comment.url).hostname;
        acc[hostname] = (acc[hostname] || 0) + 1;
        return acc;
      }, {})
    )
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([site, count]) => ({ site, count }));

    return {
      activityByDay: activityByDay.slice(-7), // Last 7 days
      interactionStats: {
        comments: totalComments,
        likes: totalLikes,
        dislikes: totalDislikes
      },
      topSites
    };
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <button onClick={goBack} className="p-1 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="font-semibold">Statistics</span>
          <button onClick={closeAll} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">Loading statistics...</div>
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
          <span className="font-semibold">Statistics</span>
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
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      <div className="px-4 py-3 border-b dark:border-gray-700 flex items-center justify-between">
        <button onClick={goBack} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="font-semibold">Statistics</span>
        <button onClick={closeAll} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-300">
              {statsData.interactionStats.comments}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-300">Comments</div>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-300">
              {statsData.interactionStats.likes}
            </div>
            <div className="text-sm text-green-600 dark:text-green-300">Likes</div>
          </div>
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-300">
              {statsData.interactionStats.dislikes}
            </div>
            <div className="text-sm text-yellow-600 dark:text-yellow-300">Dislikes</div>
          </div>
        </div>

        {/* Activity Chart */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Activity Last 7 Days</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statsData.activityByDay}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#4F46E5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Sites */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Top Sites</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statsData.topSites}
                  dataKey="count"
                  nameKey="site"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {statsData.topSites.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4">
            {statsData.topSites.map((site, index) => (
              <div key={site.site} className="flex items-center justify-between py-1">
                <span className="flex items-center">
                  <span
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  {site.site}
                </span>
                <span>{site.count} comments</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;