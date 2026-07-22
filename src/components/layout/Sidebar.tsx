import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo-remindu.png';
import { getLevelIcon } from '../../utils/level';

interface NavItem {
  label: string;
  icon: string;
  to: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard',       icon: 'dashboard',      to: '/dashboard' },
  { label: 'Reminder Tugas',  icon: 'task',           to: '/reminders' },
  { label: 'Kalender/Jadwal', icon: 'calendar_month', to: '/calendar' },
  { label: 'Komunitas',       icon: 'groups',         to: '/communities' },
  { label: 'Riwayat',        icon: 'history',        to: '/history' },
  { label: 'Profil',          icon: 'person',         to: '/profile' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const { user, logout } = useAuth();
  
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}
      
      <nav className={`fixed left-0 top-0 h-full w-[280px] bg-sidebar border-r border-border-custom flex flex-col py-6 z-50 shadow-level-1 transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Mobile Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 lg:hidden p-2 text-on-surface-variant hover:bg-primary/10 rounded-full"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      {/* Brand */}
      <div className="px-8 mb-8 flex items-center gap-3">
        <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
          <img src={logo} alt="remind.u logo" className="w-full h-full object-contain" />
        </div>
        <div>
          <h1 className="text-[28px] font-bold leading-tight tracking-tight text-primary" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            remind.u
          </h1>
          {/* <p className="text-[11px] font-medium text-primary/60 leading-tight">Academic Wellness</p> */}
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 flex flex-col gap-1 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 mx-1 transition-all duration-200 ${
                isActive
                  ? 'bg-primary text-white scale-[0.97] shadow-level-1'
                  : 'text-on-surface-variant hover:bg-primary/10'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`material-symbols-outlined text-[22px] ${isActive ? 'icon-fill' : ''}`}
                >
                  {item.icon}
                </span>
                <span className="text-[14px] font-semibold leading-5 tracking-wide">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 mt-auto flex flex-col gap-3">
        {/* XP Level badge */}
        <div className="bg-primary/10 rounded-xl p-4 flex items-center justify-between border border-primary/20">
          <div>
            <p className="text-[11px] font-bold text-primary uppercase tracking-wider mb-0.5">Level {user?.level || 1}</p>
            <p className="text-[13px] font-bold text-on-surface">{user?.xp_points?.toLocaleString() || 0} XP</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-level-1">
            <span className="material-symbols-outlined icon-fill text-white text-[20px]">{getLevelIcon(user?.level || 1)}</span>
          </div>
        </div>

        {/* Logout Button */}
        <button onClick={() => logout()} className="w-full bg-error/10 text-error rounded-xl py-3 px-4 flex items-center justify-center gap-2 text-[14px] font-semibold hover:bg-error hover:text-white transition-colors group">
          <span className="material-symbols-outlined text-[20px] transition-transform group-hover:-translate-x-1">logout</span>
          Keluar
        </button>
      </div>
    </nav>
    </>
  );
};

export default Sidebar;
// fix z-index for mobile
