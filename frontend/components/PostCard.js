import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useState, useEffect } from 'react';
import axios from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router'; 

export default function PostCard({ post: initialPost }) {
  const { isAuthenticated } = useAuth();
  const [post, setPost] = useState(initialPost);
  const [currentUserId, setCurrentUserId] = useState(null);
  const router = useRouter(); 

  const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    setPost(initialPost);

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setCurrentUserId(JSON.parse(storedUser)._id);
      } catch (e) {
        console.error("Failed to parse user from localStorage:", e);
        setCurrentUserId(null);
      }
    }
  }, [initialPost]);

  const voteCount = post.upvotes.length - post.downvotes.length;
  const hasUpvoted = currentUserId && post.upvotes.includes(currentUserId);
  const hasDownvoted = currentUserId && post.downvotes.includes(currentUserId);

  const handleVote = async (voteType) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Log in to vote!');
      return;
    }

    try {
      const endpoint = `/posts/${post._id}/${voteType}`;
      const res = await axios.post(endpoint, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPost(res.data);
    } catch (error) {
      console.error('Error voting:', error.response?.data || error.message);
      alert('Failed to cast vote. Please try again.');
    }
  };

  const handleProfile = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      alert('Please log in to continue!');
    }
  };

  return (
    <div className="flex bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out mb-4 border border-gray-200">
      <div className="flex flex-col items-center p-2 bg-gray-50 rounded-l-lg border-r border-gray-100">
        {isAuthenticated ? (
          <>
            <button onClick={() => handleVote('upvote')}
              className={`text-gray-500 hover:text-blue-500 ${hasUpvoted ? 'text-blue-500' : ''}`}
              aria-label="Upvote" >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4l8 8H4l8-8z"/></svg>
            </button>
            <span className="font-bold text-md py-1 text-gray-800">{voteCount}</span>
            <button
              onClick={() => handleVote('downvote')}
              className={`text-gray-500 hover:text-orange-500 ${hasDownvoted ? 'text-orange-500' : ''}`}
              aria-label="Downvote"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 20l-8-8h16l-8 8z"/></svg>
            </button>
          </>
        ) : (
          <>
            <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4l8 8H4l8-8z"/></svg>
            <span className="font-bold text-md py-1 text-gray-800">{voteCount}</span>
            <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 20l-8-8h16l-8 8z"/></svg>
          </>
        )}
      </div>
      <div className="flex-1 p-4">
        <div className="flex items-center text-sm text-gray-600 mb-2">
          {post.author && (isAuthenticated ? (
              <Link href={`/user/${post.author._id}`} className="flex items-center group hover:underline">
                <img src={`${backendBaseUrl}${post.author.avatarUrl}`} alt={`${post.author.username}'s Avatar`}
                  className="w-6 h-6 rounded-full object-cover mr-2 border border-gray-200 group-hover:border-blue-400 transition-colors"/>
                <span className="font-semibold text-gray-700 group-hover:text-blue-700 transition-colors">
                  Posted by u/{post.author.username}</span>
              </Link>
            ) : (
              <span onClick={handleProfile} className="flex items-center group cursor-pointer">
                <img src={`${backendBaseUrl}${post.author.avatarUrl}`} alt={`${post.author.username}'s Avatar`} className="w-6 h-6 rounded-full object-cover mr-2 border border-gray-200"/>
                <span className="font-semibold text-gray-700">
                  Posted by u/{post.author.username}</span>
              </span>
            )
          )}
          {!post.author && (
            <span className="font-semibold text-gray-700">Posted by u/Anonymous</span>
          )}
          <span className="mx-2">•</span>
          <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
        </div>

        <Link href={`/post/${post._id}`} className="block">
          <h2 className="text-xl font-semibold text-gray-900 hover:text-blue-700 cursor-pointer mb-2 leading-tight">{post.title}</h2>
        </Link>

        <p className="text-gray-700 text-base line-clamp-3 mb-3">{post.contentMarkdown}</p>
        <div className="flex items-center text-sm text-gray-600">
          <Link href={`/post/${post._id}#comments`} className="flex items-center hover:text-blue-700">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path></svg>
            <span className="font-semibold">{post.comments?.length} Comments</span>
          </Link></div>
      </div></div>
  );}