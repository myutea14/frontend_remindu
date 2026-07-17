import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo-remindu.png';

const AdminLoginPage: React.FC = () => {
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
      
      if (user.role !== 'admin') {
        setError('Akses ditolak. Anda bukan Super Admin.');
        setLoading(false);
        return;
      }

      login(response.data.access_token, user);
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login gagal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1A1A1A] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-[#242424] p-10 rounded-2xl shadow-level-3 border border-border-custom/10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4 bg-primary/10 rounded-xl">
            <img src={logo} alt="remind.u admin" className="w-10 h-10 object-contain" />
          </div>
          <h2 className="text-[28px] font-bold text-white tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Super Admin
          </h2>
          <p className="text-[14px] text-on-surface-variant mt-2">
            Portal Manajemen Internal remind.u
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-error/20 border border-error/50 rounded-xl text-[13px] text-error font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-[13px] font-semibold text-white/80 mb-1.5">Email Akses</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-[14px] text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder-white/30"
              placeholder="admin@remindu.app"
            />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-white/80 mb-1.5">Kata Sandi (Root)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-[14px] text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder-white/30"
              placeholder="••••••••"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-4 bg-primary text-white rounded-xl text-[14px] font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {loading ? 'Otentikasi...' : 'Masuk ke Portal'}
            {!loading && <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
