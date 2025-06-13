import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import axios from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function CommentList({ comments, onCommentDeleted }) {
  const { user, isAuthenticated } = useAuth();

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }, 
      });
      alert('Comment deleted successfully!');
      if (onCommentDeleted) {
        onCommentDeleted(commentId);
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete comment!');
    }
  };

  return (
    <div className="mt-6 bg-white p-4 rounded-lg shadow-sm">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Comments ({comments.length})</h3>
      <ul className="space-y-4">
        {comments.map(comment => {
          const isCommentAuthor = isAuthenticated && user && comment.author && user._id === comment.author._id;
          return (
            <li key={comment._id} className="border-b border-gray-200 pb-4 last:border-b-0">
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <span className="font-semibold text-blue-700">{comment.author?.username || 'Anonymous'}</span>
                <span className="mx-2">•</span>
                <span>{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                {isCommentAuthor && (<button onClick={() => handleDeleteComment(comment._id)}
                    className="ml-4 bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600">
                    Delete</button>
                )}
              </div>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{comment.contentMarkdown}</ReactMarkdown>
            </li>);})}
      </ul>
    </div>
  );}