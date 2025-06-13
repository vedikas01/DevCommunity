import CommentList from '../../components/CommentList';
import CommentForm from '../../components/CommentForm';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from '../../services/api';
import { formatDistanceToNow } from 'date-fns'; 

export default function PostDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null); 

  useEffect(() => {
    if (id) {
      axios.get(`/posts/${id}`)
        .then(res => setPost(res.data))
        .catch(err => console.error("Error fetching post:", err));

      axios.get(`/comments/${id}`)
        .then(res => setComments(res.data))
        .catch(err => console.error("Error fetching comments:", err));

      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setCurrentUserId(JSON.parse(storedUser)._id);
        } catch (e) {
          setCurrentUserId(null);
        }
      }
    }
  }, [id]); 

  if (!post) return <p>Loading post...</p>;

  const voteCount = post.upvotes.length - post.downvotes.length;
  const hasUpvoted = currentUserId && post.upvotes.includes(currentUserId);
  const hasDownvoted = currentUserId && post.downvotes.includes(currentUserId);

  const handleVote = async (voteType) => { 
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to vote!');
      return;
    }

    try {
      const endpoint = `/posts/${post._id}/${voteType}`;
      const res = await axios.post(endpoint, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPost(res.data);
    } catch (error) {
      alert(`Failed to ${voteType} post. Please try again.`);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex bg-white rounded-lg shadow-md mb-6 border border-gray-200">
        <div className="flex flex-col items-center p-2 bg-gray-50 rounded-l-lg border-r border-gray-100">
          <button onClick={() => handleVote('upvote')}
            className={`text-gray-500 hover:text-orange-500 ${hasUpvoted ? 'text-orange-500' : ''}`}
            aria-label="Upvote">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4l8 8H4l8-8z"/></svg>
          </button>
          <span className="font-bold text-md py-1 text-gray-800">{voteCount}</span>
          <button onClick={() => handleVote('downvote')}
            className={`text-gray-500 hover:text-blue-500 ${hasDownvoted ? 'text-blue-500' : ''}`}
            aria-label="Downvote">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 20l-8-8h16l-8 8z"/></svg>
          </button>
        </div>

        <div className="flex-1 p-4">
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <span className="font-semibold text-gray-700">Posted by u/{post.author?.username || 'Anonymous'}</span>
            <span className="mx-2">•</span>
            <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">{post.title}</h1>
          <p className="text-gray-700 text-base mb-4">{post.contentMarkdown}</p>

          <div className="flex items-center text-sm text-gray-600">
            <span className="flex items-center">
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round"
              strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z">
              </path></svg>
              <span className="font-semibold">{comments.length }Comments</span>
            </span>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-semibold mt-6 mb-3">Comments</h3>
      <CommentList comments={comments} />
      <CommentForm postId={id} onCommentAdded={comment => setComments(prev => [...prev, comment])} />
    </div>
  );
}