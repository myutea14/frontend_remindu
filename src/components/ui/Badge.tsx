import React from 'react';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'primary' | 'secondary' | 'error' | 'success' | 'accent';
  className?: string;
}

const variantClasses: Record<string, string> = {
  default: 'bg-[#eae0e1] text-[#3f4946]',
  primary: 'bg-[#076559] text-white',
  secondary: 'bg-[#296865] text-white',
  error: 'bg-[#ffdad6] text-[#93000a]',
  success: 'bg-[#14C97A]/10 text-[#14C97A]',
  accent: 'bg-[#E3FDFA] text-[#296865]',
};

const Badge: React.FC<BadgeProps> = ({ label, variant = 'default', className = '' }) => (
  <span
    className={`px-2 py-0.5 rounded text-[11px] font-semibold leading-4 tracking-wide whitespace-nowrap ${variantClasses[variant]} ${className}`}
  >
    {label}
  </span>
);

export default Badge;
