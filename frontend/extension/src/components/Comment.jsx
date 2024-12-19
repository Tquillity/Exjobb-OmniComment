// Frontend/extension/src/components/Comment.jsx
import React from 'react';
import { formatTimestamp } from '../utils/timeFormat';

const Comment = ({ content, timestamp, walletAddress }) => {
  return (
    <div className="p-3 bg-white dark:bg-gray-800 rounded shadow">
      <p className="break-words">{content}</p>
      <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex justify-between">
        <span>{formatTimestamp(timestamp)}</span>
        <span className="text-xs truncate" title={walletAddress}>
          {walletAddress.substring(0, 6)}...{walletAddress.substring(38)}
        </span>
      </div>
    </div>
  );
};

export default Comment;