// src/components/CommentBox.jsx
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
        className="w-full p-2 border border-gray-300 rounded-md"
        placeholder="Write a comment..."
        rows={3}
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Post Comment
      </button>
    </form>
  )
}