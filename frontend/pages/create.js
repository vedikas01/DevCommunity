import { useState, useEffect } from 'react';
import axios from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';

export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [contentMarkdown, setContentMarkdown] = useState('');
  const { isAuthenticated } = useAuth(); 
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) { 
      router.push('/login');
    }
  }, [isAuthenticated, router]); 

  const handleSubmit = async () => {
    const token = localStorage.getItem('token'); 
    try {
      await axios.post('/posts', { title, contentMarkdown }, {
        headers: { Authorization: token },
      });
      router.push('/');
    } catch (error) {
      console.error('Error creating post:', error.response?.data || error.message);
    }
  };

  if (!isAuthenticated) {
    return <p className="text-center mt-8">Redirecting to login...</p>;
  }

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-xl font-bold">Create a Post</h2>
      <input className="border p-2 w-full" value={title} onChange={e => setTitle(e.target.value)} placeholder="Post Title" />
      <textarea className="border p-2 w-full mt-2" rows="6" value={contentMarkdown} onChange={e => setContentMarkdown(e.target.value)} placeholder="Write in Markdown..." />
      <button className="bg-purple-600 text-white p-2 mt-4 w-full" onClick={handleSubmit}>Submit</button>
    </div>
  );
}