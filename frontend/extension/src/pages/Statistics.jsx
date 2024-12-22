// Frontend/extension/src/pages/Statistics.jsx
import React, { useState, useEffect } from 'react';
import { ChevronLeft, X, Calendar, TrendingUp } from 'lucide-react';
import { useNavigation } from '../contexts/NavigationContext';
import { useAuth } from '../contexts/AuthContext';
import { Menu } from '@headlessui/react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';

const Statistics = () => {
  const { goBack, closeAll } = useNavigation();
  const { user, isAuthenticated } = useAuth();
  const [timeframe, setTimeframe] = useState('week'); // 'week', 'month', 'year'
  const [statsData, setStatsData] = useState({
    activityByDay: [],
    interactionStats: {},
    topSites: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    if (!isAuthenticated || !user?.walletAddress) {
      setError('Please login to view statistics');
      setLoading(false);
      return;
    }

    try {
      const token = await chrome.storage.local.get(['token']).then(result => result.token);
      
      const response = await fetch(
        `http://localhost:3000/api/comments/statistics/${user.walletAddress}?timeframe=${timeframe}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }

      const data = await response.json();
      processStatsData(data);
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const processStatsData = (rawData) => {
    // Process activity by day
    const activityByDay = rawData.reduce((acc, comment) => {
      const date = new Date(comment.createdAt).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    // Process interaction stats
    const interactionStats = {
      totalComments: rawData.length,
      totalLikes: rawData.reduce((sum, comment) => sum + comment.likes.length, 0),
      totalDislikes: rawData.reduce((sum, comment) => sum + comment.dislikes.length, 0)
    };

    // Process top sites
    const siteStats = rawData.reduce((acc, comment) => {
      const hostname = new URL(comment.url).hostname;
      acc[hostname] = (acc[hostname] || 0) + 1;
      return acc;
    }, {});

    const topSites = Object.entries(siteStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([site, count]) => ({ site, count }));

    setStatsData({
      activityByDay: Object.entries(activityByDay).map(([date, count]) => ({ date, count })),
      interactionStats,
      topSites
    });
  };

  useEffect(() => {
    fetchStats();
  }, [isAuthenticated, user?.walletAddress, timeframe]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (!isAuthenticated) {
    return (
      <div className="h-full flex flex-col">
        <div className="px-4 py-3 border-b dark:border-gray-700 flex items-center justify-between">
          <button onClick={goBack} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="font-semibold">Statistics</span>
          <button onClick={closeAll} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">Please login to view statistics</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="px-4 py-3 bg-white dark:bg-gray-800 border-b dark:border-gray-700 
                    flex items-center justify-between">
        <button onClick={goBack} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="font-semibold">Statistics</span>
        <button onClick={closeAll} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Timeframe Selector */}
      <div className="px-4 py-2 bg-white dark:bg-gray-800 border-b dark:border-gray-700 
                    flex items-center justify-between">
        <Menu as="div" className="relative">
          <Menu.Button className="flex items-center space-x-1 px-3 py-1 text-sm rounded-md 
                                hover:bg-gray-100 dark:hover:bg-gray-700">
            <Calendar className="h-4 w-4" />
            <span>{timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}</span>
          </Menu.Button>
          <Menu.Items className="absolute left-0 mt-1 w-48 bg-white dark:bg-gray-800 
                               rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
            {['week', 'month', 'year'].map((period) => (
              <Menu.Item key={period}>
                {({ active }) => (
                  <button
                    onClick={() => setTimeframe(period)}
                    className={`${
                      active ? 'bg-gray-100 dark:bg-gray-700' : ''
                    } block px-4 py-2 text-sm w-full text-left`}
                  >
                    Past {period}
                  </button>
                )}
              </Menu.Item>
            ))}
          </Menu.Items>
        </Menu>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Loading statistics...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-red-500">{error}</div>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-300">
                  {statsData.interactionStats.totalComments}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-300">Comments</div>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-300">
                  {statsData.interactionStats.totalLikes}
                </div>
                <div className="text-sm text-green-600 dark:text-green-300">Likes</div>
              </div>
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-300">
                  {statsData.interactionStats.totalDislikes}
                </div>
                <div className="text-sm text-amber-600 dark:text-amber-300">Dislikes</div>
              </div>
            </div>

            {/* Activity Chart */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Activity Overview</h3>
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
          </>
        )}
      </div>
    </div>
  );
};

export default Statistics;