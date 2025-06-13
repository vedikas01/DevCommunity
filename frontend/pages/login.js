import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext'; 
import axios from '../services/api'; 
import { useRouter } from 'next/router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login: authLogin } = useAuth(); 
  const router = useRouter(); 

  const handleLogin = async (e) => { 
    e.preventDefault(); 
    setError(''); 

    try {
      const res = await axios.post('/auth/login', { email, password });

      if (res.data && res.data.success) {
        authLogin(res.data.token, res.data.user);
        router.push('/');

      } else {
        setError(res.data?.message || 'Login failed!');
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Login failed!');
      } else {
        setError('Network error or unexpected issue. Please try again!');
      }
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4 text-center">Login</h2>
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
      <form onSubmit={handleLogin}> 
        <input className="border p-2 w-full rounded-md" type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="Email"required/>
        <input className="border p-2 w-full mt-3 rounded-md" type="password" value={password} onChange={e => setPassword(e.target.value)}
          placeholder="Password" required />
        <button className="bg-blue-600 text-white p-2 mt-4 w-full rounded-md hover:bg-blue-700 transition-colors" type="submit">
          Login</button>
      </form>

      <p className="mt-4 text-center text-gray-700">
        Don't have an account?{' '}
        <Link href="/register" className="text-blue-500 hover:underline">
          Register
        </Link>
      </p>
    </div>
  );}