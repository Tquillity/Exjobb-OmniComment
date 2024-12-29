// Frontend/webapp/src/pages/Comments.jsx
import React from 'react';
import CommentBoard from '../components/CommentBoard';

export default function Comments() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Comments</h1>
          <CommentBoard />
        </div>
      </div>
    </div>
  );
}