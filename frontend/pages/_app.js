import Navbar from '../components/Navbar';
import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext'; 

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider> 
      <Navbar />
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;