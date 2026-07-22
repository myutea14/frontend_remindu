import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

// Admin Users Page
interface User {
  id: number;
  name: string;
  email: string;
  phone_wa: string;
  wa_connected: boolean;
  level: number;
  role: string;
  is_suspended: boolean;
  created_at: string;
  avatar_url?: string | null;
}

const AdminUsersPage: React.FC = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const handleDeleteUser = async (id: number, name: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus pengguna '${name}'? Tindakan ini tidak dapat dibatalkan.`)) return;

    try {
      await axios.delete(`http://localhost:8000/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Pengguna berhasil dihapus.');
      fetchUsers(); // Refresh list
    } catch (error: any) {
      console.error('Error deleting user:', error);
      alert(error.response?.data?.message || 'Gagal menghapus pengguna.');
    }
  };

  const handleSuspendUser = async (id: number, name: string, isCurrentlySuspended: boolean) => {
    if (!window.confirm(`Apakah Anda yakin ingin ${isCurrentlySuspended ? 'mencabut suspend' : 'suspend'} pengguna '${name}'?`)) return;

    try {
      const response = await axios.post(`http://localhost:8000/api/admin/users/${id}/suspend`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(response.data.message);
      fetchUsers();
    } catch (error: any) {
      console.error('Error suspending user:', error);
      alert(error.response?.data?.message || 'Gagal mengubah status suspend.');
    }
  };



  if (loading) return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Manajemen Pengguna</h2>
          <p className="text-on-surface-variant mt-2">Kelola dan pantau seluruh pelajar serta admin yang terdaftar.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-border-custom flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">search</span>
          <input type="text" placeholder="Cari email/nama..." className="outline-none text-sm w-48 text-gray-700" />
        </div>
      </div>
      
      <div className="bg-white rounded-3xl shadow-level-1 border border-border-custom overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-background border-b border-border-custom">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-primary uppercase tracking-wider">Nama & Email</th>
                <th className="px-6 py-4 text-xs font-bold text-primary uppercase tracking-wider">WhatsApp</th>
                <th className="px-6 py-4 text-xs font-bold text-primary uppercase tracking-wider">Status WA</th>
                <th className="px-6 py-4 text-xs font-bold text-primary uppercase tracking-wider">Level & Role</th>
                <th className="px-6 py-4 text-xs font-bold text-primary uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(user => (
                <tr key={user.id} className={`hover:bg-gray-50/80 transition-colors ${user.is_suspended ? 'opacity-60 bg-red-50/30' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-sm overflow-hidden">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          user.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 flex items-center gap-2">
                          {user.name} 
                          {user.is_suspended && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded border border-red-200">Suspended</span>}
                        </div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-700">{user.phone_wa || <span className="text-gray-400 italic">Belum diisi</span>}</div>
                  </td>
                  <td className="px-6 py-4">
                    {user.wa_connected ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-success/10 text-success rounded-xl text-xs font-bold tracking-wide">
                        <span className="w-1.5 h-1.5 rounded-full bg-success"></span> Terhubung
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold tracking-wide">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> Terputus
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-lg">Lv. {user.level}</span>
                      <span className={`px-3 py-1 rounded-xl text-xs font-bold tracking-wide uppercase ${
                        user.role === 'admin' 
                          ? 'bg-secondary/20 text-secondary' 
                          : 'bg-primary/10 text-primary'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {user.role !== 'admin' && (
                      <div className="flex justify-end gap-1">

                        <button 
                          onClick={() => handleSuspendUser(user.id, user.name, user.is_suspended)}
                          className={`p-2 rounded-xl transition-colors ${user.is_suspended ? 'text-success hover:bg-success/10' : 'text-orange-500 hover:bg-orange-500/10'}`}
                          title={user.is_suspended ? "Cabut Suspend" : "Suspend Pengguna"}
                        >
                          <span className="material-symbols-outlined text-[20px]">{user.is_suspended ? "lock_open" : "lock"}</span>
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          className="p-2 text-error hover:bg-error/10 rounded-xl transition-colors"
                          title="Hapus Pengguna"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-border-custom bg-gray-50/50 flex justify-between items-center">
          <p className="text-sm text-gray-500">Menampilkan {users.length} pengguna</p>
        </div>
      </div>
    </div>
  );
};


export default AdminUsersPage;
