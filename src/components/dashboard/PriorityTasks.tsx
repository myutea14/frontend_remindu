import React from 'react';
import TaskCard from './TaskCard';
import type { Task } from './TaskCard';
import { Link } from 'react-router-dom';
import api from '../../services/api';

interface PriorityTasksProps {
  tasks?: any[];
  onUpdate?: () => void;
}


const PriorityTasks: React.FC<PriorityTasksProps> = ({ tasks = [], onUpdate }) => {
  const handleStart = async (id: number) => {
    try {
      await api.post(`/tasks/${id}/done`);
      if (onUpdate) onUpdate();
    } catch (e) {
      console.error('Gagal menyelesaikan tugas', e);
    }
  };

  const handleDelay = async (id: number) => {
    try {
      await api.post(`/tasks/${id}/delay`);
      if (onUpdate) onUpdate();
    } catch (e) {
      console.error('Gagal menunda tugas', e);
    }
  };

  return (
    <section>
      <div className="flex justify-between items-center mb-5">
        <h3
          className="text-[24px] font-semibold text-on-surface"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Tugas Prioritas
        </h3>
        <Link to="/reminder" className="text-[14px] font-semibold text-primary hover:underline transition-all">
          Lihat Semua
        </Link>
      </div>

      <div className="flex flex-col gap-4">
        {tasks.length === 0 ? (
          <div className="p-8 text-center text-on-surface-variant border-2 border-dashed border-border-custom rounded-xl">
            Tidak ada tugas prioritas. Bagus!
          </div>
        ) : (
          tasks.map((t) => {
            // Map API response to TaskCard expected format
            const taskProp: Task = {
              id: t.id,
              title: t.title,
              deadline: new Date(t.deadline).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
              outputType: t.output_type,
              loadType: t.load_type,
              isZonaMerah: t.is_zona_merah,
              waSync: t.wa_notif_enabled,
            };
            return (
              <TaskCard
                key={taskProp.id}
                task={taskProp}
                onStart={handleStart}
                onDelay={handleDelay}
              />
            );
          })
        )}
      </div>
    </section>
  );
};

export default PriorityTasks;
