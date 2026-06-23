import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo-remindu.png';
import { GoogleLogin } from '@react-oauth/google';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== passwordConfirmation) {
      setError('Password tidak cocok.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/register', {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation
      });
      login(response.data.access_token, response.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registrasi gagal. Silakan coba lagi.');
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
      login(response.data.access_token, response.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registrasi Google gagal.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleFailure = () => {
    setError('Registrasi Google dibatalkan atau gagal.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-level-1 border border-border-custom">
        <div className="text-center mb-8">
          <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <img src={logo} alt="remind.u logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-[28px] font-bold text-primary" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Daftar remind.u
          </h2>
          <p className="text-[14px] text-on-surface-variant mt-2">
            Sudah punya akun? <Link to="/login" className="text-primary font-semibold hover:underline">Masuk di sini</Link>
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded-xl text-[13px] text-error font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-[13px] font-semibold text-on-surface mb-1.5">Nama Lengkap</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border border-border-custom rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="myutea"
            />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-on-surface mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-border-custom rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/40"
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
              minLength={8}
              className="w-full border border-border-custom rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Minimal 8 karakter"
            />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-on-surface mb-1.5">Konfirmasi Password</label>
            <input
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
              minLength={8}
              className="w-full border border-border-custom rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Ulangi password"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 bg-primary text-white rounded-xl text-[14px] font-semibold hover:bg-primary/90 transition-colors shadow-level-1 disabled:opacity-70 flex justify-center items-center gap-2"
          >
            {loading ? 'Memproses...' : 'Daftar Sekarang'}
            {!loading && <span className="material-symbols-outlined text-[18px]">person_add</span>}
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
            text="signup_with"
            size="large"
          />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
