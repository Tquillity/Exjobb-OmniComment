// src/components/CommentSidebar.jsx
import React, { useState } from 'react';

const CommentSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`fixed top-0 right-0 h-full w-96 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} z-50`}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Comments</h2>
        </div>

        {/* Comment Section */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Comments will be rendered here */}
        </div>

        {/* Input Section */}
        <div className="border-t p-4">
          <textarea 
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Add a comment..."
            rows="3"
          />
          <button className="mt-2 w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
            Post Comment
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentSidebar;