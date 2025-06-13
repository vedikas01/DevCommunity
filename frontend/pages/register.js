import { useState } from 'react';
import axios from '../services/api';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { login } = useAuth();

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    } else {
      setAvatar(null);
      setAvatarPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('bio', bio);
    if (avatar) {
      formData.append('avatar', avatar);
    }

    try {
      const res = await axios.post('/auth/register', formData);
      login(res.data.token, res.data.user);
      alert('Registration successful!');
      router.push('/');
    } catch (err) {
      alert('Registration failed: ' + (err.response?.data?.error || 'Unknown error!'));
    } finally {
      setLoading(false);
    }
  };

  useState(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);


  return (
    <div className="p-4 max-w-md mx-auto">
      <form onSubmit={handleSubmit}>
        <h2 className="text-xl font-bold mb-4 text-center">Register</h2>

        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">Username</label>
        <input
          className="border p-2 w-full mb-4" type="text" id="username" value={username} onChange={e => setUsername(e.target.value)}
          placeholder="Enter username" required />

        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">Email</label>
        <input className="border p-2 w-full mb-4" type="email" id="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="Enter email" required />

        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Password</label>
        <input className="border p-2 w-full mb-4" type="password" id="password" value={password} onChange={e => setPassword(e.target.value)}
          placeholder="Enter password" required />

        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="bio">Bio (Optional)</label>
        <textarea className="border p-2 w-full mb-4" id="bio" value={bio} onChange={e => setBio(e.target.value)}
          placeholder="Tell us about yourself (max 500 characters)" rows="3" maxLength="500"></textarea>

        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="avatar">Avatar (Optional)</label>
        <input className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 mb-4"
          type="file" id="avatar" accept="image/*" onChange={handleAvatarChange} />
        {avatarPreview && (<div className="mb-4 text-center">
          <img src={avatarPreview} alt="Avatar Preview" className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-gray-300" />
          <p className="text-gray-500 text-sm mt-1">Preview</p>
        </div>)}

        <button type="submit" className="bg-green-600 text-white p-2 mt-2 w-full rounded hover:bg-green-700 transition-colors disabled:opacity-50"
          disabled={loading}>{loading ? 'Registering...' : 'Register'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-500 hover:text-blue-800">
          Login
        </Link>
      </p>
    </div>
  );}