import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE,
  withCredentials: false, 
});

export default instance;
