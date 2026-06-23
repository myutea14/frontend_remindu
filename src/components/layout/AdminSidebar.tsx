import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo-remindu.png';

const AdminSidebar: React.FC = () => {
  const { logout } = useAuth();
  return (
    <aside className="w-[280px] bg-white h-screen fixed top-0 left-0 flex flex-col border-r border-border-custom p-6 z-20 shadow-sm">
      <div className="flex items-center gap-3 mb-12 px-2">
        <div className="w-12 h-12 flex items-center justify-center">
           <img src={logo} alt="remind.u logo" className="w-full h-full object-contain" />
        </div>
        <div>
          <h1 className="font-bold text-2xl tracking-tight text-primary" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>remind.u</h1>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
            <p className="text-[11px] text-secondary font-bold tracking-widest uppercase">Super Admin</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-2">
        <NavLink to="/admin" end className={({ isActive }) => `flex items-center gap-4 px-4 py-3.5 rounded-2xl font-semibold transition-all duration-300 ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'text-on-surface-variant hover:bg-background hover:text-primary'}`}>
          <span className={`material-symbols-outlined ${({ isActive }: any) => isActive ? 'icon-fill' : ''}`}>dashboard</span>
          Dashboard
        </NavLink>
        <NavLink to="/admin/users" className={({ isActive }) => `flex items-center gap-4 px-4 py-3.5 rounded-2xl font-semibold transition-all duration-300 ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'text-on-surface-variant hover:bg-background hover:text-primary'}`}>
          <span className={`material-symbols-outlined ${({ isActive }: any) => isActive ? 'icon-fill' : ''}`}>group</span>
          Pengguna
        </NavLink>
        <NavLink to="/admin/groups" className={({ isActive }) => `flex items-center gap-4 px-4 py-3.5 rounded-2xl font-semibold transition-all duration-300 ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'text-on-surface-variant hover:bg-background hover:text-primary'}`}>
          <span className={`material-symbols-outlined ${({ isActive }: any) => isActive ? 'icon-fill' : ''}`}>diversity_3</span>
          Grup Komunitas
        </NavLink>

      </nav>
      <div className="mt-auto space-y-2 pt-6 border-t border-border-custom">
        <NavLink to="/" className="flex items-center gap-4 px-4 py-3.5 rounded-2xl font-semibold text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all">
          <span className="material-symbols-outlined">exit_to_app</span>
          Kembali ke App
        </NavLink>
        <button onClick={logout} className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-semibold text-error hover:bg-error/10 hover:text-error transition-all">
          <span className="material-symbols-outlined">logout</span>
          Keluar
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
