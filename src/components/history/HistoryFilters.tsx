import React, { useState } from 'react';

const timeFilters = ['Semua Waktu', 'Hari Ini', 'Minggu Ini', 'Bulan Ini'];
const categoryFilters = ['Semua Kategori', 'Pribadi', 'Komunitas', 'Berat', 'Sedang', 'Ringan'];

interface HistoryFiltersProps {
  onTimeChange?: (filter: string) => void;
  onCategoryChange?: (filter: string) => void;
}

const HistoryFilters: React.FC<HistoryFiltersProps> = ({ onTimeChange, onCategoryChange }) => {
  const [activeTime, setActiveTime] = useState('Semua Waktu');
  const [activeCategory, setActiveCategory] = useState('Semua Kategori');

  const handleTime = (f: string) => {
    setActiveTime(f);
    onTimeChange?.(f);
  };

  const handleCategory = (f: string) => {
    setActiveCategory(f);
    onCategoryChange?.(f);
  };

  return (
    <section className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8 bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-border-custom">
      {/* Time filters */}
      <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
        {timeFilters.map((f) => (
          <button
            key={f}
            onClick={() => handleTime(f)}
            className={`px-4 py-2 rounded-xl text-[14px] font-semibold transition-colors ${
              activeTime === f
                ? 'bg-primary text-white shadow-level-1'
                : 'bg-transparent text-on-surface-variant hover:bg-border-custom'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto pb-1 lg:pb-0">
        <span className="text-[12px] text-on-surface-variant font-semibold mr-1 whitespace-nowrap">
          Filter:
        </span>
        {categoryFilters.map((f) => (
          <button
            key={f}
            onClick={() => handleCategory(f)}
            className={`px-3 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap transition-colors border ${
              activeCategory === f
                ? 'bg-primary text-white border-primary shadow-level-1'
                : 'border-border-custom text-on-surface-variant hover:bg-border-custom'
            }`}
          >
            {f}
          </button>
        ))}
      </div>
    </section>
  );
};

export default HistoryFilters;
