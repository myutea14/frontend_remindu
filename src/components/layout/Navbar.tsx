import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { Notification, SearchResult } from '../../types';
import api from '../../services/api';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useRef } from 'react';

interface NavbarProps {
  onOpenChat: () => void;
  onToggleSidebar?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onOpenChat, onToggleSidebar }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on navigation
  useEffect(() => {
    setIsNotifOpen(false);
  }, [location]);

  // Close notif dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch Notifications
  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data);
      } catch (err) {
        console.error('Failed to fetch notifications');
      }
    };
    if (user) fetchNotifs();
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-border-custom h-16 flex justify-between items-center px-4 md:px-8">
      {/* Left area */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onToggleSidebar}
          className="lg:hidden p-2 -ml-2 text-on-surface hover:bg-primary/10 rounded-xl"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>
      </div>

      {/* Right area */}
      <div className="flex items-center gap-2 md:gap-4 flex-1 justify-end">
        {/* Search */}
        {location.pathname !== '/profile' && (
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchParams(prev => {
                  if (e.target.value) prev.set('q', e.target.value);
                  else prev.delete('q');
                  return prev;
                }, { replace: true });
              }}
              placeholder="Cari di halaman ini..."
              className="pl-10 pr-4 py-2 bg-[#fcf1f2] border border-border-custom rounded-full text-[13px] md:text-[14px] focus:border-primary focus:ring-1 focus:ring-primary outline-none w-32 md:w-60 transition-all duration-200 focus:w-48 md:focus:w-72"
            />
          </div>
        )}

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative text-on-surface-variant hover:bg-[#f0e6e7] transition-colors p-2 rounded-full"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notif Dropdown */}
          {isNotifOpen && (
            <div className="absolute top-full mt-2 right-0 w-80 bg-white border border-border-custom rounded-xl shadow-level-2 overflow-hidden z-50">
              <div className="flex items-center justify-between p-4 border-b border-border-custom">
                <h3 className="font-bold text-on-surface">Notifikasi</h3>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllAsRead} className="text-xs font-semibold text-primary hover:underline">
                    Tandai semua dibaca
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-sm text-on-surface-variant">Belum ada notifikasi</div>
                ) : (
                  notifications.map((notif) => (
                      <div 
                        key={notif.id}
                        onClick={() => handleMarkAsRead(notif.id)}
                        className={`p-4 border-b border-border-custom cursor-pointer hover:bg-surface transition-colors ${notif.is_read ? 'opacity-60' : 'bg-[#fcf1f2]/50'}`}
                      >
                        <div className="flex gap-3">
                          <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${notif.is_read ? 'bg-transparent' : 'bg-primary'}`} />
                          <div className="flex-1">
                            <div className="flex justify-between items-start gap-2">
                              <p className="text-sm font-semibold text-on-surface">{notif.title}</p>
                              <span className="text-[10px] text-on-surface-variant whitespace-nowrap mt-0.5">
                                {(() => {
                                  if (!notif.created_at) return '';
                                  const date = new Date(notif.created_at);
                                  const now = new Date();
                                  const dateStr = date.toDateString();
                                  const todayStr = now.toDateString();
                                  const yesterday = new Date(now);
                                  yesterday.setDate(now.getDate() - 1);
                                  
                                  const timeStr = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                                  if (dateStr === todayStr) return `Hari ini, ${timeStr}`;
                                  if (dateStr === yesterday.toDateString()) return `Kemarin, ${timeStr}`;
                                  return `${date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}, ${timeStr}`;
                                })()}
                              </span>
                            </div>
                            <p className="text-xs text-on-surface-variant mt-1">{notif.message}</p>
                          </div>
                        </div>
                      </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Chat */}
        <button onClick={onOpenChat} className="text-on-surface-variant hover:bg-[#f0e6e7] transition-colors p-2 rounded-full">
          <span className="material-symbols-outlined text-[22px]">chat</span>
        </button>

        {/* Profile avatar */}
        <div onClick={() => navigate('/profile')} className="w-8 h-8 rounded-full overflow-hidden border-2 border-primary cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all flex-shrink-0">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-primary flex items-center justify-center text-white text-[13px] font-bold uppercase">
              {user?.name?.charAt(0) || 'B'}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
// fix mobile padding
