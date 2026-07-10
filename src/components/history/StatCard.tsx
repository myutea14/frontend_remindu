import React from 'react';

interface StatCardProps {
  icon: string;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  subLabel?: string;
  trend?: string;
  trendColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  subLabel,
  trend,
  trendColor = 'text-success',
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-border-custom shadow-level-1 relative overflow-hidden group hover:shadow-level-2 transition-shadow duration-300">
      {/* Background decorative circle */}
      <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-20 transition-transform group-hover:scale-150 duration-500"
        style={{ backgroundColor: iconBg }} />

      <div className="flex items-center gap-4 mb-4 relative z-10">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: iconBg, color: iconColor }}
        >
          <span className="material-symbols-outlined text-[22px] icon-fill">{icon}</span>
        </div>
        <h3 className="text-[13px] font-semibold text-on-surface-variant leading-snug">{label}</h3>
      </div>

      <div className="flex items-baseline gap-2 relative z-10">
        <span
          className="text-[40px] font-bold leading-none text-on-surface"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {value}
        </span>
        {trend && (
          <span className={`text-[12px] font-semibold ${trendColor} flex items-center gap-0.5`}>
            <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
            {trend}
          </span>
        )}
        {subLabel && !trend && (
          <span className="text-[13px] text-on-surface-variant font-medium">{subLabel}</span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
