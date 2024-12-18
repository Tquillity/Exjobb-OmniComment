// Frontend/extension/src/components/CommentBox.jsx
import { useState } from 'react'

export default function CommentBox({ onSubmit }) {
  const [comment, setComment] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit?.(comment)
    setComment('')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="w-full p-2 border border-gray-300 dark:border-gray-700 
                   rounded-md bg-white dark:bg-gray-800 
                   text-gray-900 dark:text-white"
        placeholder="Write a comment..."
        rows={3}
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 
                   text-white rounded-md dark:bg-blue-500 
                   dark:hover:bg-blue-600"
      >
        Post Comment
      </button>
    </form>
  );
}