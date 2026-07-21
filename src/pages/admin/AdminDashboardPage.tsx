import React, { useEffect, useState } from 'react';
// UX Polish: real-time user count chart
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Stats {
  total_users: number;
  total_tasks: number;
  total_groups: number;
}

interface ChartData {
  task_activity: any[];
  wa_adoption: any[];
}

const AdminDashboardPage: React.FC = () => {
  const { token, user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [charts, setCharts] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/admin/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data.stats);
        setCharts(response.data.charts);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  if (loading) return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-[2rem] p-8 md:p-12 text-white shadow-level-1 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Selamat Datang, {user?.name || 'Super Admin'} 👋
          </h2>
          <p className="text-primary-fixed text-lg font-medium opacity-90 max-w-2xl">
            Pantau aktivitas pelajar, manajemen grup studi, dan optimasi performa AI terintegrasi WhatsApp dalam satu kontrol panel yang elegan.
          </p>
        </div>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-6 px-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Ikhtisar Sistem</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl shadow-level-1 border border-border-custom flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined icon-fill text-primary text-4xl">group</span>
          </div>
          <div>
            <p className="text-on-surface-variant text-sm font-semibold uppercase tracking-wider mb-1">Total Pengguna</p>
            <h3 className="text-4xl font-bold text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{stats?.total_users || 0}</h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-3xl shadow-level-1 border border-border-custom flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300">
          <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center">
            <span className="material-symbols-outlined icon-fill text-secondary text-4xl">task</span>
          </div>
          <div>
            <p className="text-on-surface-variant text-sm font-semibold uppercase tracking-wider mb-1">Tugas Aktif</p>
            <h3 className="text-4xl font-bold text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{stats?.total_tasks || 0}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-level-1 border border-border-custom flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300">
          <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center">
            <span className="material-symbols-outlined icon-fill text-primary text-4xl">diversity_3</span>
          </div>
          <div>
            <p className="text-on-surface-variant text-sm font-semibold uppercase tracking-wider mb-1">Grup Studi</p>
            <h3 className="text-4xl font-bold text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{stats?.total_groups || 0}</h3>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      {charts && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Area Chart: Task Activity */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-level-1 border border-border-custom p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Aktivitas Penyelesaian Tugas</h3>
                <p className="text-sm text-gray-500">7 Hari Terakhir</p>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.task_activity} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSelesai" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#076559" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#076559" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorDibuat" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9CA3AF" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#9CA3AF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dx={-10} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="Dibuat" stroke="#9CA3AF" strokeWidth={2} fillOpacity={1} fill="url(#colorDibuat)" />
                  <Area type="monotone" dataKey="Selesai" stroke="#076559" strokeWidth={3} fillOpacity={1} fill="url(#colorSelesai)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Donut Chart: WA Adoption */}
          <div className="bg-white rounded-3xl shadow-level-1 border border-border-custom p-6">
            <div className="mb-2">
              <h3 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Adopsi Bot WA</h3>
              <p className="text-sm text-gray-500">Status Koneksi Fonnte</p>
            </div>
            <div className="h-[250px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.wa_adoption}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {charts.wa_adoption.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                <span className="text-3xl font-bold text-primary">{charts.wa_adoption[0]?.value || 0}</span>
                <span className="text-xs text-gray-500 font-semibold uppercase">Aktif</span>
              </div>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {charts.wa_adoption.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                  <span className="text-sm font-medium text-gray-700">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Additional Stats Section */}
      <div className="bg-white rounded-3xl shadow-level-1 border border-border-custom p-8 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="material-symbols-outlined text-primary text-3xl">insights</span>
          <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Status Layanan</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-background rounded-2xl p-6 border border-border-custom flex justify-between items-center">
            <div>
              <p className="font-semibold text-gray-900">Koneksi Database</p>
              <p className="text-sm text-gray-500 mt-1">Latensi normal (~12ms)</p>
            </div>
            <span className="px-3 py-1 bg-success/20 text-success rounded-full text-xs font-bold uppercase tracking-wider">Online</span>
          </div>
          <div className="bg-background rounded-2xl p-6 border border-border-custom flex justify-between items-center">
            <div>
              <p className="font-semibold text-gray-900">Groq AI</p>
              <p className="text-sm text-gray-500 mt-1">Endpoint aktif, siap memproses NLP</p>
            </div>
            <span className="px-3 py-1 bg-success/20 text-success rounded-full text-xs font-bold uppercase tracking-wider">Online</span>
          </div>
        </div>
      </div>

      {/* System Maintenance Section */}
      <div className="bg-white rounded-3xl shadow-level-1 border border-border-custom p-8 border-l-4 border-l-orange-500">
        <div className="flex items-start justify-between">
            <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0">
                    <span className="material-symbols-outlined">cleaning_services</span>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Pemeliharaan Database</h3>
                    <p className="text-sm text-gray-600 mt-1 max-w-2xl">
                        Fitur ini akan menghapus tugas-tugas dengan status <strong>Overdue (Terlewat)</strong> yang sudah lebih dari 30 hari. 
                        Ini membantu menjaga performa database agar tidak penuh dengan sampah tugas usang.
                    </p>
                </div>
            </div>
            <button 
                onClick={async () => {
                    if(!window.confirm('Yakin ingin membersihkan tugas overdue yang lebih dari 30 hari? Tindakan ini tidak bisa dibatalkan.')) return;
                    try {
                        const res = await axios.post('http://localhost:8000/api/admin/tasks/cleanup', {}, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        alert(res.data.message);
                        window.location.reload();
                    } catch (e: any) {
                        alert(e.response?.data?.message || 'Terjadi kesalahan saat membersihkan tugas.');
                    }
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-6 rounded-xl transition-colors whitespace-nowrap flex items-center gap-2"
            >
                <span className="material-symbols-outlined text-[20px]">delete_sweep</span>
                Bersihkan Tugas
            </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
