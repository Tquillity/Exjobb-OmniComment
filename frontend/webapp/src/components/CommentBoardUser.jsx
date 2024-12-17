// src/components/CommentBoardUser.jsx
import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { MessageSquare, ThumbsUp, Bookmark } from 'lucide-react';
import Loading from './Loading';

const UserCommentBoard = ({ account }) => {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('created');

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
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!account) return null;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="bg-white shadow rounded-lg">
      <h2 className="text-xl font-semibold p-4 border-b">My Comments</h2>
      <Tabs defaultValue="created" onValueChange={setActiveTab}>
        <TabsList className="border-b w-full justify-start p-2">
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
            <TabsContent value="created" className="divide-y divide-gray-200">
              {comments.length === 0 ? (
                <div className="p-4 text-gray-500">No comments yet</div>
              ) : (
                comments.map((comment) => (
                  <div key={comment._id} className="p-4">
                    <p className="text-sm text-gray-500 mb-1">
                      <a href={comment.url} className="hover:underline">{comment.url}</a>
                    </p>
                    <p className="text-gray-900">{comment.content}</p>
                    <div className="mt-2 text-sm text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="interactions" className="divide-y divide-gray-200">
              {comments.length === 0 ? (
                <div className="p-4 text-gray-500">No interactions yet</div>
              ) : (
                comments.map((comment) => (
                  <div key={comment._id} className="p-4">
                    <p className="text-sm text-gray-500 mb-1">
                      <a href={comment.url} className="hover:underline">{comment.url}</a>
                    </p>
                    <p className="text-gray-900">{comment.content}</p>
                    <div className="mt-2 text-sm text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="bookmarked" className="divide-y divide-gray-200">
              <div className="p-4 text-gray-500">
                Bookmarking feature coming soon!
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default UserCommentBoard;