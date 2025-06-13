import { useState } from 'react';
import axios from '../services/api'; 

export default function CommentForm({ postId, onCommentAdded }) {
  const [content, setContent] = useState('');

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Login to add a comment!');
      return;
    }
    try {
      const res = await axios.post(`/comments/${postId}`, { contentMarkdown: content }, {
        headers: { Authorization: `Bearer ${token}` }, 
      });
      setContent('');
      onCommentAdded(res.data);
    } catch (error) {
      console.error('Error posting comment:', error.response?.data || error.message);
      alert('Failed to post comment. Please try again!');
    }
  };

  return (
    <div className="mt-4 p-4 border rounded-lg bg-white shadow-sm">
      <h4 className="font-semibold mb-2 text-gray-700">Leave a Comment</h4>
      <textarea
        className="border border-gray-300 rounded p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
        rows="4"
        placeholder="What are your thoughts?" value={content} onChange={e => setContent(e.target.value)}/>
      <button
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-3 transition duration-300 ease-in-out"
        onClick={handleSubmit}>Post Comment</button>
    </div>
  );}