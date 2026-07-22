import React from 'react';

export interface HistoryTask {
  id: number;
  title: string;
  category: string;
  loadType?: string;
  time: string;
  xp: number;
  isGroupTask?: boolean;
}

interface HistoryTaskCardProps {
  task: HistoryTask;
}

const HistoryTaskCard: React.FC<HistoryTaskCardProps> = ({ task }) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-border-custom shadow-level-1 hover:shadow-level-2 transition-all duration-300 flex items-center justify-between group">
      <div className="flex items-start gap-4">
        {/* Check icon */}
        <div className="mt-0.5 w-8 h-8 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
          <span
            className="material-symbols-outlined text-success text-[20px] icon-fill"
          >
            check_circle
          </span>
        </div>

        {/* Task info */}
        <div>
          <h4 className="text-[16px] font-semibold text-on-surface mb-1.5 group-hover:text-primary transition-colors line-through decoration-outline-variant/40">
            {task.title}
          </h4>
          <div className="flex flex-wrap items-center gap-2">
            {task.category === 'Komunitas' || task.isGroupTask ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold mt-1 self-start">
                <span className="material-symbols-outlined text-[14px]">groups</span>
                {task.category}
              </div>
            ) : (
              <span className="px-2 py-0.5 bg-accent/60 text-secondary rounded-full text-[11px] font-semibold">
                {task.category}
              </span>
            )}
            {task.loadType && (
              <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[11px] font-semibold">
                {task.loadType}
              </span>
            )}
            <span className="text-outline text-[12px] flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">schedule</span>
              {task.time}
            </span>
          </div>
        </div>
      </div>

      {/* XP badge */}
      <div className="text-right flex-shrink-0 ml-4">
        <div className="inline-flex items-center gap-1 px-3 py-1 bg-success/10 text-success rounded-xl text-[13px] font-semibold">
          <span className="material-symbols-outlined text-[16px]">bolt</span>
          +{task.xp} XP
        </div>
        <div className="text-outline text-[11px] font-medium mt-1">Selesai</div>
      </div>
    </div>
  );
};

export default HistoryTaskCard;
