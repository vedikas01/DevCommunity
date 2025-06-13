import { useEffect, useState } from 'react';
import axios from '../services/api'; 
import PostCard from '../components/PostCard';
import Link from 'next/link';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get('/posts');
        setPosts(res.data);
      } catch (err) {
        setError('Failed to load posts!');
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (loading) {
    return <div className="text-center py-8 text-lg text-gray-600">Loading posts...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-lg text-red-600">{error}</div>;
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 p-4">
      <aside className="w-full md:w-64 bg-white rounded-lg shadow-md p-4 sticky top-4 self-start border border-gray-200">
        <h3 className="text-lg font-bold mb-4 text-gray-800">Communities</h3>
        <ul className="space-y-2 mb-6">
          <li><Link href="/d/webdev" className="text-blue-600 hover:underline">d/webdev</Link></li>
          <li><Link href="/d/reactjs" className="text-blue-600 hover:underline">d/reactjs</Link></li>
          <li><Link href="/d/nodejs" className="text-blue-600 hover:underline">d/nodejs</Link></li>
          <li><Link href="/d/mongodb" className="text-blue-600 hover:underline">d/mongodb</Link></li>
          <li><Link href="/d/tailwindcss" className="text-blue-600 hover:underline">d/tailwindcss</Link></li>
        </ul>
        <Link href="/create" className="block text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out">
          Create Post</Link>
      </aside>

      <main className="flex-1">
        <h1 className="text-3xl font-extrabold mb-6 text-gray-900 border-b pb-4">Dev Community Feed</h1>
        {posts.length === 0 ? (
          <p className="text-center text-gray-500 text-xl py-10">No posts found! Be the first to create one!</p>
        ) : (
          <div className="space-y-4">
            {posts.map(post => <PostCard key={post._id} post={post} />)}
          </div>
        )}
      </main>

      <aside className="w-full md:w-64 bg-white rounded-lg shadow-md p-4 sticky top-4 self-start hidden lg:block border border-gray-200">
        <h3 className="text-lg font-bold mb-4 text-gray-800">Trending Today</h3>
        <ul className="space-y-3">
          <li className="text-gray-700"><Link href="#" className="hover:underline">Best practices for React Hooks</Link></li>
          <li className="text-gray-700"><Link href="#" className="hover:underline">Securing your Node.js API</Link></li>
          <li className="text-gray-700"><Link href="#" className="hover:underline">MongoDB indexing tips</Link></li>
        </ul>
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h3 className="text-lg font-bold mb-2 text-gray-800">About DevCommunity</h3>
          <p className="text-sm text-gray-600">
            A place for developers to share knowledge, discuss tech, and connect with like-minded individuals.
          </p>
        </div>
      </aside>
    </div>
  );
}