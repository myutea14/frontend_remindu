import React from 'react';

interface FocusScoreCardProps {
  score?: number;
  trend?: number;
}

const FocusScoreCard: React.FC<FocusScoreCardProps> = ({ score = 0, trend = 0 }) => {
  const isPositive = trend >= 0;
  return (
    <div className="bg-white rounded-2xl border border-border-custom card-level-1 p-6 flex flex-col justify-between relative overflow-hidden">
      {/* Decorative blur circle */}
      <div className="absolute -right-4 -top-4 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10">
        <h3 className="text-[12px] font-semibold text-on-surface-variant tracking-wider uppercase mb-2">
          Focus Score
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="text-[48px] font-bold leading-none text-primary" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {score}
          </span>
          <span className="text-[16px] font-semibold text-primary/60">/ 100</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4 relative z-10">
        <div className="w-full bg-border-custom rounded-full h-2 mb-3">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-700"
            style={{ width: `${score}%` }}
          />
        </div>
        <div className={`flex items-center gap-1.5 text-[12px] font-medium ${isPositive ? 'text-success' : 'text-error'}`}>
          <span className="material-symbols-outlined text-[16px]">{isPositive ? 'trending_up' : 'trending_down'}</span>
          <span>{isPositive ? '+' : ''}{trend} dari minggu lalu</span>
        </div>
      </div>
    </div>
  );
};

export default FocusScoreCard;
