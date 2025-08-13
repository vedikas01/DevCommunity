import CommentList from '../../components/CommentList';
import CommentForm from '../../components/CommentForm';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from '../../services/api';
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; 

export default function PostDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null); 
  const [isDeleting, setIsDeleting] = useState(false);

  const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

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
  const isPostOwner = currentUserId && post.author && currentUserId === post.author._id;

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

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    setIsDeleting(true);
    const token = localStorage.getItem('token');
    
    try {
      await axios.delete(`/posts/${post._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      alert('Post deleted successfully!');
      router.push('/');
    } catch (error) {
      console.error('Error deleting post:', error.response?.data || error.message);
      alert('Failed to delete post. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimetype) => {
    if (mimetype.startsWith('image/')) return '🖼️';
    if (mimetype.startsWith('video/')) return '🎥';
    if (mimetype.includes('pdf')) return '📄';
    if (mimetype.includes('word') || mimetype.includes('document')) return '📝';
    if (mimetype.includes('excel') || mimetype.includes('spreadsheet')) return '📊';
    if (mimetype.includes('powerpoint') || mimetype.includes('presentation')) return '📈';
    return '📎';
  };

  const handleFileDownload = (attachment) => {
    const link = document.createElement('a');
    link.href = `${backendBaseUrl}/${attachment.path}`;
    link.download = attachment.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <div className="text-gray-700 text-base mb-4 prose prose-lg max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.contentMarkdown}
            </ReactMarkdown>
          </div>

          {/* Attachments Section */}
          {post.attachments && post.attachments.length > 0 && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Attachments ({post.attachments.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {post.attachments.map((attachment, index) => (
                  <button
                    key={index}
                    onClick={() => handleFileDownload(attachment)}
                    className="flex items-center space-x-3 bg-white hover:bg-gray-100 p-3 rounded-lg border border-gray-200 transition-colors text-left"
                  >
                    <span className="text-2xl">{getFileIcon(attachment.mimetype)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{attachment.originalName}</p>
                      <p className="text-sm text-gray-500">{formatFileSize(attachment.size)}</p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center text-sm text-gray-600">
            <span className="flex items-center">
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round"
              strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z">
              </path></svg>
              <span className="font-semibold">{comments.length} Comments</span>
            </span>
            
            {/* Delete button for post owner */}
            {isPostOwner && (
              <button
                onClick={handleDeletePost}
                disabled={isDeleting}
                className="ml-auto bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
              >
                {isDeleting ? 'Deleting...' : 'Delete Post'}
              </button>
            )}
          </div>
        </div>
      </div>

      <h3 className="text-lg font-semibold mt-6 mb-3">Comments</h3>
      <CommentList comments={comments} />
      <CommentForm postId={id} onCommentAdded={comment => setComments(prev => [...prev, comment])} />
    </div>
  );
}