import { useEffect, useState, useCallback } from 'react'; 
import { useRouter } from 'next/router';
import axios from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Head from 'next/head';
import PostCard from '../../components/PostCard'; 

export default function UserProfile() {
  const router = useRouter();
  const { id } = router.query; 
  const { user: currentUser, isAuthenticated, token, updateUser } = useAuth(); 

  const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [profileUser, setProfileUser] = useState(null); 
  const [userPosts, setUserPosts] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [loadingPosts, setLoadingPosts] = useState(true); 
  const [error, setError] = useState(null); 
  const [errorPosts, setErrorPosts] = useState(null); 
  const [isFollowing, setIsFollowing] = useState(false); 

  const fetchProfileAndPosts = useCallback(async () => {
    if (!id) return; 

    setLoading(true);
    setLoadingPosts(true);
    setError(null);
    setErrorPosts(null);

    try {
      const profileRes = await axios.get(`/users/${id}`);
      setProfileUser(profileRes.data.user);

      if (currentUser && profileRes.data.user && profileRes.data.user.followers) {
        setIsFollowing(profileRes.data.user.followers.some(follower => follower._id === currentUser._id));
      }

    } catch (err) {
      setError('Failed to load user profile!');
      setProfileUser(null);
    } finally {
      setLoading(false);
    }

    try {
      const postsRes = await axios.get(`/posts?authorId=${id}`);
      setUserPosts(postsRes.data);
    } catch (err) {
      setErrorPosts('Failed to load posts by this user!');
      setUserPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  }, [id, currentUser]);

  useEffect(() => {
    fetchProfileAndPosts();
  }, [fetchProfileAndPosts]);

  const handleFollowToggle = async () => {
    if (!isAuthenticated || !currentUser || !profileUser) {
      alert('Log in to follow/unfollow!');
      router.push('/login');
      return;
    }

    try {
      let res;
      if (isFollowing) {
        res = await axios.post(`/users/${profileUser._id}/unfollow`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert(res.data.message);
        setIsFollowing(false);
        setProfileUser(prev => ({
          ...prev,
          followers: prev.followers.filter(f => f._id !== currentUser._id)
        }));
        updateUser({
          ...currentUser,
          following: currentUser.following.filter(f => f._id !== profileUser._id)
        });

      } else {
        res = await axios.post(`/users/${profileUser._id}/follow`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert(res.data.message);
        setIsFollowing(true);
        setProfileUser(prev => ({
          ...prev,
          followers: [...prev.followers, { _id: currentUser._id, username: currentUser.username, avatarUrl: currentUser.avatarUrl }]
        }));
         updateUser({
            ...currentUser,
            following: [...currentUser.following, { _id: profileUser._id, username: profileUser.username, avatarUrl: profileUser.avatarUrl }]
         });
      }
    } catch (error) {
      alert('Failed to update follow status!');
    }
  };


  if (loading) {
    return <p className="text-center text-xl text-gray-600 mt-10">Loading user profile...</p>;
  }
  if (error) {
    return <p className="text-center text-xl text-red-500 mt-10">{error}</p>;
  }
  if (!profileUser) {
    return <p className="text-center text-xl text-gray-500 mt-10">User not found!</p>;
  }
  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8 flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 border border-gray-200">
        <div className="flex-shrink-0">
          <img src={`${backendBaseUrl}${profileUser.avatarUrl}`} alt={`${profileUser.username}'s Avatar`}
            className="w-40 h-40 rounded-full object-cover border-4 border-blue-400 shadow-md"/>
        </div>

        <div className="flex-grow text-center md:text-left">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{profileUser.username}</h1>
          <p className="text-gray-700 text-lg mb-4">{profileUser.bio || []}</p>

          <div className="flex justify-center md:justify-start space-x-8 mb-6">
            <div className="text-center">
              <span className="block text-2xl font-bold text-gray-800">
                {profileUser.followers ? profileUser.followers.length : 0}
              </span>
              <p className="text-gray-600">Followers</p>
            </div>
            <div className="text-center">
              <span className="block text-2xl font-bold text-gray-800">
                {profileUser.following ? profileUser.following.length : 0}
              </span>
              <p className="text-gray-600">Following</p>
            </div>
          </div>

          {isAuthenticated && currentUser && currentUser._id !== profileUser._id && (
            <button
              onClick={handleFollowToggle}
              className={`px-8 py-3 rounded-full font-semibold text-lg transition-all duration-300 ease-in-out ${
                isFollowing ? 'bg-red-500 text-white hover:bg-red-600 shadow-md' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'}`}>
                {isFollowing ? 'Unfollow' : 'Follow'}</button>)}
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-200 w-full">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Posts by {profileUser.username}</h3>

        {loadingPosts ? (
          <p className="text-center text-gray-500">Loading posts...</p>
        ) : errorPosts ? (
          <p className="text-center text-red-500">{errorPosts}</p>
        ) : userPosts.length > 0 ? (
          <div className="space-y-6">
            {userPosts.map(post => <PostCard key={post._id} post={post} />)}
          </div>
        ) : (
          <p className="text-center text-gray-500">No posts yet!</p>
        )}
      </div>
    </div>
  );}