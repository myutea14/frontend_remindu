import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo-remindu.png';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/login', { email, password });
      const user = response.data.user;
      login(response.data.access_token, user);
      
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login gagal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/google', {
        credential: credentialResponse.credential
      });
      const user = response.data.user;
      login(response.data.access_token, user);
      
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Google Login gagal.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleFailure = () => {
    setError('Login Google dibatalkan atau gagal.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-level-1 border border-border-custom">
        <div className="text-center mb-8">
          <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <img src={logo} alt="remind.u logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-[28px] font-bold text-primary" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Masuk ke remind.u
          </h2>
          <p className="text-[14px] text-on-surface-variant mt-2">
            Belum punya akun? <Link to="/register" className="text-primary font-semibold hover:underline">Daftar sekarang</Link>
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded-xl text-[13px] text-error font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-[13px] font-semibold text-on-surface mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-border-custom rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="myutea@example.com"
            />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-on-surface mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-border-custom rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="••••••••"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-white rounded-xl text-[14px] font-semibold hover:bg-primary/90 transition-colors shadow-level-1 disabled:opacity-70 flex justify-center items-center gap-2"
          >
            {loading ? 'Memproses...' : 'Masuk'}
            {!loading && <span className="material-symbols-outlined text-[18px]">login</span>}
          </button>
        </form>
        
        <div className="mt-6 flex items-center">
          <div className="flex-1 border-t border-border-custom"></div>
          <span className="px-3 text-[12px] text-on-surface-variant font-medium">ATAU</span>
          <div className="flex-1 border-t border-border-custom"></div>
        </div>

        <div className="mt-6 flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleFailure}
            useOneTap
            shape="rectangular"
            theme="outline"
            text="signin_with"
            size="large"
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
