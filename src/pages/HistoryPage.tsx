import React, { useState, useEffect } from 'react';
import StatCard from '../components/history/StatCard';
import api from '../services/api';
import HistoryFilters from '../components/history/HistoryFilters';
import HistoryTaskCard from '../components/history/HistoryTaskCard';
import type { HistoryTask } from '../components/history/HistoryTaskCard';
import type { XpLog, DashboardStats } from '../types';
import { useSearchParams } from 'react-router-dom';

interface HistoryGroup {
  label: string;
  isToday?: boolean;
  tasks: HistoryTask[];
}

const HistoryPage: React.FC = () => {
  const [logs, setLogs] = useState<XpLog[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTime, setActiveTime] = useState('Semua Waktu');
  const [activeCategory, setActiveCategory] = useState('Semua Kategori');
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [logsRes, dashRes] = await Promise.all([
          api.get('/xp-logs'),
          api.get('/dashboard')
        ]);
        setLogs(logsRes.data);
        setStats(dashRes.data.stats);
      } catch (e) {
        console.error("Failed to fetch History data", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (activeCategory !== 'Semua Kategori') {
      const isKomunitas = !!log.task?.group_id;
      const isPribadi = !isKomunitas; // All tasks that are not group tasks are personal in this new simplified context, or we can check output_type === 'Pribadi'
      const loadType = log.task?.load_type;

      if (activeCategory === 'Komunitas' && !isKomunitas) return false;
      if (activeCategory === 'Pribadi' && !isPribadi) return false;
      if (activeCategory === 'Berat' && loadType !== 'Berat') return false;
      if (activeCategory === 'Sedang' && loadType !== 'Sedang') return false;
      if (activeCategory === 'Ringan' && loadType !== 'Ringan') return false;
    }

    const logDate = new Date(log.created_at);
    const today = new Date();
    
    if (activeTime === 'Hari Ini') {
      return logDate.toDateString() === today.toDateString();
    } else if (activeTime === 'Minggu Ini') {
      const weekAgo = new Date();
      weekAgo.setDate(today.getDate() - 7);
      return logDate >= weekAgo;
    } else if (activeTime === 'Bulan Ini') {
      return logDate.getMonth() === today.getMonth() && logDate.getFullYear() === today.getFullYear();
    }
    
    return true;
  }).filter(log => {
    if (!searchQuery) return true;
    const lowerQ = searchQuery.toLowerCase();
    const title = log.reason || log.description || '';
    return title.toLowerCase().includes(lowerQ);
  });

  const historyData: HistoryGroup[] = filteredLogs.reduce((acc: HistoryGroup[], log: XpLog) => {
    const dateLabel = new Date(log.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    const isToday = new Date(log.created_at).toDateString() === new Date().toDateString();
    
    const existingGroup = acc.find((g) => g.label === dateLabel);
    
    // Determine category text: if it's a group task, use group name or fallback to 'Komunitas'
    const categoryName = log.task?.group?.name || log.task?.output_type || 'Lainnya';
    
    const task: HistoryTask = {
      id: log.id,
      title: log.reason || log.description || '',
      category: categoryName,
      loadType: log.task?.load_type || undefined,
      time: new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      xp: log.xp_amount || log.points || 0,
      isGroupTask: !!log.task?.group_id
    };

    if (existingGroup) {
      existingGroup.tasks.push(task);
    } else {
      acc.push({ label: dateLabel, isToday, tasks: [task] });
    }
    return acc;
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h2
            className="text-[40px] font-bold leading-tight tracking-tight text-primary mb-2"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Riwayat Aktivitas
          </h2>
          <p className="text-[18px] text-on-surface-variant">
            Lihat kembali pencapaian dan fokus belajarmu.
          </p>
        </div>
      </header>

      {/* Stats Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatCard
          icon="task_alt"
          iconBg="#076559"
          iconColor="#ffffff"
          label="Total Tugas Selesai"
          value={stats?.total_tasks_completed?.toString() || '0'}
        />
        <StatCard
          icon="stars"
          iconBg="#14C97A"
          iconColor="#ffffff"
          label="Total XP Didapat"
          value={stats?.total_xp || '0K'}
          subLabel="XP Points"
        />
        <StatCard
          icon="timer"
          iconBg="#B5DBD9"
          iconColor="#076559"
          label="Rata-rata Fokus"
          value={stats?.focus_hours?.toString() || '0'}
          subLabel="Jam / Hari"
        />
      </section>

      {/* Filters */}
      <HistoryFilters 
        onTimeChange={setActiveTime}
        onCategoryChange={setActiveCategory} 
      />

      {/* History Groups */}
      <section className="space-y-10">
        {loading ? (
          <div className="text-center text-on-surface-variant">Memuat riwayat...</div>
        ) : historyData.length === 0 ? (
          <div className="text-center text-on-surface-variant border-2 border-dashed border-border-custom rounded-xl p-8">
            Belum ada riwayat aktivitas.
          </div>
        ) : (
          historyData.map((group) => (
            <div key={group.label}>
              <h3
                className={`text-[22px] font-semibold mb-4 flex items-center gap-2 ${
                  group.isToday ? 'text-primary' : 'text-on-surface-variant opacity-80'
                }`}
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                <span
                  className={`w-2 h-2 rounded-full inline-block flex-shrink-0 ${
                    group.isToday ? 'bg-primary' : 'bg-border-custom'
                  }`}
                />
                {group.label}
              </h3>

              <div className="space-y-4">
                {group.tasks.map((task) => (
                  <HistoryTaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          ))
        )}
      </section>

      {/* End of list */}
      <div className="mt-16 text-center py-12 border-t border-border-custom">
        <span className="material-symbols-outlined text-[56px] text-border-custom mb-4 block">
          local_cafe
        </span>
        <h4
          className="text-[22px] font-semibold text-on-surface-variant mb-2"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Semua aktivitas telah dimuat
        </h4>
        <p className="text-[16px] text-outline">Terus pertahankan fokus dan produktivitasmu!</p>
      </div>

      <div className="h-12" />
    </div>
  );
};

export default HistoryPage;
