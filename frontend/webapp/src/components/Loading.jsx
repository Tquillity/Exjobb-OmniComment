// Frontend/webapp/src/components/Loading.jsx
import React from 'react';

export default function Loading({ message = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      <span className="ml-2 text-gray-600">{message}</span>
    </div>
  );
}