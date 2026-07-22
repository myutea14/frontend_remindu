import React from 'react';
import Badge from '../ui/Badge';

export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type OutputType = 'Tugas' | 'Kuis / Ujian' | 'Organisasi' | 'Pribadi';
export type LoadType = 'Ringan' | 'Sedang' | 'Berat';

export interface Task {
  id: number;
  title: string;
  deadline: string;
  outputType: OutputType;
  loadType: LoadType;
  isZonaMerah?: boolean;
  waSync?: boolean;
  timeRemaining?: string;
}

interface TaskCardProps {
  task: Task;
  onStart?: (id: number) => void;
  onDelay?: (id: number) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onStart, onDelay }) => {
  if (task.isZonaMerah) {
    return (
      <div className="bg-white rounded-2xl border-2 border-error card-level-1 p-5 flex flex-col md:flex-row gap-4 items-start md:items-center relative overflow-hidden zona-merah-pulse">
        {/* Left accent bar */}
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-error rounded-l-xl" />

        <div className="flex-1 pl-2">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="bg-[#ffdad6] text-[#93000a] px-2 py-0.5 rounded text-[12px] font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">warning</span>
              Zona Merah
            </span>
            <Badge label={task.loadType} variant="primary" />
          </div>
          <h4 className="text-[20px] font-bold text-error mb-1 leading-snug" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {task.title}
          </h4>
          <p className="text-[14px] text-on-surface-variant flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">schedule</span>
            Tenggat:{' '}
            <strong className="text-error ml-1">
              {task.deadline}
              {task.timeRemaining && ` (Sisa ${task.timeRemaining})`}
            </strong>
          </p>
        </div>

        <div className="flex gap-3 w-full md:w-auto pl-2 md:pl-0">
          <button
            onClick={() => onStart?.(task.id)}
            className="flex-1 md:flex-none bg-error text-white py-2 px-5 rounded-xl text-[14px] font-semibold hover:bg-error/90 transition-colors shadow-level-1"
          >
            Selesai
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-border-custom card-level-1 p-5 flex flex-col md:flex-row gap-4 items-start md:items-center hover:border-primary/30 transition-colors duration-200">
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Badge label={task.outputType} variant="default" />
          <Badge label={task.loadType} variant="secondary" />
        </div>
        <h4 className="text-[18px] font-semibold text-on-surface mb-1 leading-snug" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {task.title}
        </h4>
        <p className="text-[13px] text-on-surface-variant flex items-center gap-1">
          <span className="material-symbols-outlined text-[15px]">schedule</span>
          {task.deadline}
        </p>
      </div>

      <div className="flex gap-2 w-full md:w-auto items-center">
        <button
          onClick={() => onStart?.(task.id)}
          className="flex-1 md:flex-none bg-primary text-white py-2 px-5 rounded-xl text-[14px] font-semibold hover:bg-primary/90 transition-colors shadow-level-1"
        >
          Selesai
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
