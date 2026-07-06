import React from 'react';

interface ActivityTimelineProps {
  logs?: any[];
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ logs = [] }) => {
  return (
    <div className="bg-white rounded-2xl border border-border-custom card-level-1 p-5">
      <h3 className="text-[14px] font-semibold text-on-surface mb-5">Aktivitas Terbaru</h3>

      <div className="relative pl-6 border-l-2 border-border-custom flex flex-col gap-6">
        {logs.length === 0 ? (
          <p className="text-[12px] text-on-surface-variant">Belum ada aktivitas.</p>
        ) : (
          logs.map((item, index) => (
            <div key={item.id} className="relative">
              {/* Timeline dot */}
              <div
                className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 ${
                  index === 0
                    ? 'bg-white border-primary shadow-[0_0_0_3px_rgba(7,101,89,0.15)]'
                    : 'bg-white border-border-custom'
                }`}
              />

              <p
                className={`text-[12px] font-medium mb-1 ${
                  index === 0 ? 'text-primary' : 'text-on-surface-variant'
                }`}
              >
                {new Date(item.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-[14px] text-on-surface-variant">{item.reason || item.description}</p>

              {(item.xp_amount || item.points) && (
                <div className="mt-1.5 inline-flex items-center gap-1 text-[12px] font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full">
                  <span className="material-symbols-outlined text-[14px]">bolt</span>
                  +{item.xp_amount || item.points} XP
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityTimeline;
