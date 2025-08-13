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
  const [canViewFull, setCanViewFull] = useState(true);
  const [showFollowers, setShowFollowers] = useState(false);
  const [updatingPrivacy, setUpdatingPrivacy] = useState(false);

  const isOwner = isAuthenticated && currentUser && profileUser && currentUser._id === profileUser._id;
  // Owners should always be able to view their own profile, regardless of privacy setting
  const effectiveCanViewFull = isOwner || canViewFull;



  const fetchProfileAndPosts = useCallback(async () => {
    if (!id) return; 

    setLoading(true);
    setLoadingPosts(true);
    setError(null);
    setErrorPosts(null);

    try {
      const profileRes = await axios.get(`/users/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      setProfileUser(profileRes.data.user);
      setIsFollowing(profileRes.data.isFollowing || false);
      setCanViewFull(profileRes.data.canViewFull ?? true);

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
  }, [id, token]);

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
          followers: Array.isArray(prev.followers) ? prev.followers.filter(f => f._id !== currentUser._id) : prev.followers - 1
        }));
        updateUser({
          ...currentUser,
          following: currentUser.following.filter(f => f._id !== profileUser._id)
        });
        if (profileUser.isPrivate) {
          setCanViewFull(false); // lose access on unfollow for private accounts
        }

      } else {
        res = await axios.post(`/users/${profileUser._id}/follow`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert(res.data.message);
        setIsFollowing(true);
        setProfileUser(prev => ({
          ...prev,
          followers: Array.isArray(prev.followers)
            ? [...prev.followers, { _id: currentUser._id, username: currentUser.username, avatarUrl: currentUser.avatarUrl }]
            : (prev.followers + 1)
        }));
         updateUser({
            ...currentUser,
            following: [...currentUser.following, { _id: profileUser._id, username: profileUser.username, avatarUrl: profileUser.avatarUrl }]
         });
         setCanViewFull(true);
      }
    } catch (error) {
      alert('Failed to update follow status!');
    }
  };

  const handlePrivacyToggle = async () => {
    if (!isOwner) return;
    try {
      setUpdatingPrivacy(true);
      const res = await axios.patch('/users/me/privacy', { isPrivate: !profileUser.isPrivate }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfileUser(prev => ({ ...prev, isPrivate: res.data.isPrivate }));
      // Owners should always have access to their own profile
      if (!isOwner) {
        if (res.data.isPrivate && !isFollowing) {
          setCanViewFull(false);
        } else {
          setCanViewFull(true);
        }
      }
    } catch (e) {
      alert('Failed to update privacy settings');
    } finally {
      setUpdatingPrivacy(false);
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
  const followersCount = Array.isArray(profileUser.followers) ? profileUser.followers.length : profileUser.followers || 0;
  const followingCount = Array.isArray(profileUser.following) ? profileUser.following.length : profileUser.following || 0;

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <Head>
        <title>{profileUser.username} - Profile</title>
      </Head>
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8 flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 border border-gray-200">
        <div className="flex-shrink-0">
          <img src={`${backendBaseUrl}${profileUser.avatarUrl}`} alt={`${profileUser.username}'s Avatar`}
            className="w-40 h-40 rounded-full object-cover border-4 border-blue-400 shadow-md"/>
        </div>

        <div className="flex-grow text-center md:text-left w-full">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{profileUser.username}</h1>
              <p className="text-gray-700 text-lg mb-4">{effectiveCanViewFull ? (profileUser.bio || '') : (profileUser.isPrivate ? 'This account is private.' : '')}</p>
            </div>
            {isOwner && (
              <div className="flex items-center space-x-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" className="form-checkbox h-5 w-5" checked={!!profileUser.isPrivate} onChange={handlePrivacyToggle} disabled={updatingPrivacy} />
                  <span className="text-sm text-gray-700">{profileUser.isPrivate ? 'Private' : 'Public'}</span>
                </label>
              </div>
            )}
          </div>

          <div className="flex justify-center md:justify-start space-x-8 mb-6">
            <div className={`text-center ${Array.isArray(profileUser.followers) ? 'cursor-pointer' : ''}`} 
                 onClick={() => Array.isArray(profileUser.followers) && setShowFollowers(true)}>
              <span className="block text-2xl font-bold text-gray-800">
                {followersCount}
              </span>
              <p className="text-gray-600">Followers</p>
            </div>
            <div className="text-center">
              <span className="block text-2xl font-bold text-gray-800">
                {followingCount}
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

      {!effectiveCanViewFull ? (
        <div className="text-center text-gray-600">
          <p>This profile is private. Follow to view full profile and posts.</p>
        </div>
      ) : (
        <div className="mt-12 pt-8 border-t border-gray-200 w-full">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Posts by {profileUser.username}</h3>

          {loadingPosts ? (
            <p className="text-center text-gray-500">Loading posts...</p>
          ) : errorPosts ? (
            <p className="text-center text-red-500">{errorPosts}</p>
          ) : userPosts.length > 0 ? (
            <div className="space-y-6">
              {userPosts.map(post => (
                <PostCard 
                  key={post._id} 
                  post={post} 
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No posts yet!</p>
          )}
        </div>
      )}

      {showFollowers && Array.isArray(profileUser.followers) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-96 max-h-[70vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold">Followers</h4>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowFollowers(false)}>Close</button>
            </div>
            {profileUser.followers.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {profileUser.followers.map(f => (
                  <li key={f._id} className="py-2 flex items-center space-x-3 hover:bg-gray-50 rounded-lg p-2 transition-colors">
                    <img src={`${backendBaseUrl}${f.avatarUrl}`} alt={f.username} className="w-8 h-8 rounded-full object-cover" />
                    <button 
                      onClick={() => {
                        setShowFollowers(false);
                        router.push(`/user/${f._id}`);
                      }}
                      className="text-gray-800 hover:text-blue-600 font-medium transition-colors cursor-pointer text-left flex-1"
                    >
                      {f.username}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No followers yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );}