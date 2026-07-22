import React, { useEffect, useState } from 'react';
import FocusScoreCard from '../components/dashboard/FocusScoreCard';
import XPProgressCard from '../components/dashboard/XPProgressCard';
import PriorityTasks from '../components/dashboard/PriorityTasks';
import ActivityTimeline from '../components/dashboard/ActivityTimeline';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useSearchParams } from 'react-router-dom';
import type { DashboardData } from '../types';

const DashboardPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/dashboard');
      setDashboardData(response.data);
      refreshUser();
    } catch (e) {
      console.error('Error fetching dashboard data:', e);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (!dashboardData || !user) {
    return <div className="p-8">Memuat data dashboard...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Greeting */}
      <section className="mb-8">
        <h2
          className="text-[40px] font-bold leading-tight tracking-tight text-primary mb-2"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Halo, {user.name.split(' ')[0]}! <span className="material-symbols-outlined text-[36px] inline-block align-middle text-warning -mt-2">waving_hand</span> Siap produktif hari ini?
        </h2>
        <p className="text-[18px] text-on-surface-variant font-normal">
          Berikut adalah ringkasan akademis kamu.
        </p>
      </section>

      {/* Main grid: 8 + 4 columns */}
      <div className="grid grid-cols-12 gap-6">
        {/* ===== Left Column (8 cols) ===== */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
          {/* Bento summary grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FocusScoreCard score={dashboardData.focus_score} trend={dashboardData.focus_score_trend} />
            <XPProgressCard 
              currentXP={user.xp_points} 
              targetXP={user.level * 1000} 
              level={user.level} 
            />
          </div>

          {/* Priority tasks */}
          <PriorityTasks tasks={dashboardData.active_tasks.filter(t => {
            if (!searchQuery) return true;
            return t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                   (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
          })} onUpdate={fetchDashboard} />
        </div>

        {/* ===== Right Column (4 cols) ===== */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <ActivityTimeline logs={dashboardData.recent_xp.filter(log => {
            if (!searchQuery) return true;
            const title = log.reason || log.description || '';
            return title.toLowerCase().includes(searchQuery.toLowerCase());
          })} />
        </div>
      </div>

      {/* Spacer */}
      <div className="h-12" />
    </div>
  );
};

export default DashboardPage;
