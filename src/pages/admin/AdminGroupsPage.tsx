import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

interface Group {
  id: number;
  name: string;
  description: string;
  subject: string;
  created_at: string;
  members_count: number;
  creator: {
    id: number;
    name: string;
    avatar_url?: string | null;
  };
}

const AdminGroupsPage: React.FC = () => {
  const { token } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGroups = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/admin/groups', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGroups(response.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [token]);

  const handleDeleteGroup = async (id: number, name: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus grup '${name}' secara permanen? Semua data tugas dan pesan di dalamnya akan hilang.`)) return;

    try {
      const response = await axios.delete(`http://localhost:8000/api/admin/groups/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(response.data.message);
      fetchGroups();
    } catch (error: any) {
      console.error('Error deleting group:', error);
      alert(error.response?.data?.message || 'Gagal menghapus grup.');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Moderasi Grup Studi</h2>
          <p className="text-on-surface-variant mt-2">Pantau seluruh aktivitas grup kolaborasi yang ada di dalam Remindu.</p>
        </div>
      </div>
      
      <div className="bg-white rounded-3xl shadow-level-1 border border-border-custom overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-background border-b border-border-custom">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-primary uppercase tracking-wider">Nama Grup</th>
                <th className="px-6 py-4 text-xs font-bold text-primary uppercase tracking-wider">Mata Pelajaran</th>
                <th className="px-6 py-4 text-xs font-bold text-primary uppercase tracking-wider">Ketua / Pembuat</th>
                <th className="px-6 py-4 text-xs font-bold text-primary uppercase tracking-wider">Anggota</th>
                <th className="px-6 py-4 text-xs font-bold text-primary uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {groups.map(group => (
                <tr key={group.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-primary font-bold text-sm">
                        <span className="material-symbols-outlined text-[20px]">diversity_3</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{group.name}</div>
                        <div className="text-xs text-gray-500 max-w-xs truncate">{group.description || 'Tidak ada deskripsi'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg">
                        {group.subject || 'Umum'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs overflow-hidden shrink-0">
                        {group.creator?.avatar_url ? (
                          <img src={group.creator.avatar_url} alt={group.creator.name} className="w-full h-full object-cover" />
                        ) : (
                          (group.creator?.name || 'S').charAt(0).toUpperCase()
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{group.creator?.name || 'Sistem'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm font-bold text-primary">
                      <span className="material-symbols-outlined text-[18px]">group</span>
                      {group.members_count}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDeleteGroup(group.id, group.name)}
                      className="p-2 text-error hover:bg-error/10 rounded-xl transition-colors"
                      title="Hapus Grup"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete_forever</span>
                    </button>
                  </td>
                </tr>
              ))}
              
              {groups.length === 0 && (
                <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Belum ada grup yang dibuat.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminGroupsPage;
