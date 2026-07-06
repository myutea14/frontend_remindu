import React from 'react';
import { getLevelIcon } from '../../utils/level';

interface XPProgressCardProps {
  currentXP?: number;
  targetXP?: number;
  level?: number;
}

const XPProgressCard: React.FC<XPProgressCardProps> = ({
  currentXP = 2450,
  targetXP = 3000,
  level = 12,
}) => {
  const progressPercent = Math.round((currentXP / targetXP) * 100);

  return (
    <div className="bg-white rounded-2xl border border-border-custom card-level-1 p-6 flex flex-col justify-between">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-[12px] font-semibold text-on-surface-variant tracking-wider uppercase">
          XP Progress
        </h3>
        <div className="bg-primary text-white px-3 py-1 rounded-full text-[12px] font-semibold flex items-center gap-1 shadow-level-1">
          <span className="material-symbols-outlined icon-fill text-[14px]">{getLevelIcon(level)}</span>
          Level {level}
        </div>
      </div>

      {/* XP Numbers */}
      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-[36px] font-bold leading-none text-primary" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {currentXP.toLocaleString()}
        </span>
        <span className="text-[14px] text-on-surface-variant font-medium">/ {targetXP.toLocaleString()} XP</span>
      </div>

      {/* Progress bar */}
      <div>
        <div className="w-full bg-border-custom rounded-full h-2.5 mb-2 overflow-hidden">
          <div
            className="bg-success h-2.5 rounded-full transition-all duration-700 relative overflow-hidden"
            style={{ width: `${progressPercent}%` }}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
          </div>
        </div>
        <p className="text-[12px] text-on-surface-variant font-medium text-right">
          {progressPercent}% menuju Level {level + 1}
        </p>
      </div>
    </div>
  );
};

export default XPProgressCard;
