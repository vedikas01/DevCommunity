import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';

export default function Navbar() {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const router = useRouter();
  const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center z-10 relative">
      <Link href="/" className="text-xl font-bold text-blue-600">
        DevCommunity</Link>
      <div className="space-x-4 flex items-center"> { }
        {isAuthenticated ? (
          <>
            {user && (<Link href={`/user/${user._id}`} className="flex items-center space-x-2 group">
              <img src={`${backendBaseUrl}${user.avatarUrl}`}
                alt="User Avatar" className="w-8 h-8 rounded-full object-cover border-2 border-blue-300 group-hover:border-blue-500 transition-colors" />
              <span className="text-gray-600 group-hover:text-blue-600 transition-colors hidden sm:inline"> { }
                Welcome {user.username}!</span>
            </Link>
            )}
            <Link href="/create" className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors">
              Create Post
            </Link>
            <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-blue-500 hover:text-blue-700 transition-colors">Login</Link>
            <Link href="/register" className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}