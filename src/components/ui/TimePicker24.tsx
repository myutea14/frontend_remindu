import React, { useState, useRef, useEffect } from 'react';

interface TimePicker24Props {
  value: string; // "HH:mm"
  onChange: (value: string) => void;
  min?: string;
  required?: boolean;
}

const TimePicker24: React.FC<TimePicker24Props> = ({ value, onChange, min, required }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const hourRef = useRef<HTMLDivElement>(null);
  const minRef = useRef<HTMLDivElement>(null);

  const [hour, minute] = value ? value.split(':') : ['', ''];
  
  const minHour = min ? parseInt(min.split(':')[0], 10) : 0;
  const minMinute = min ? parseInt(min.split(':')[1], 10) : 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll to selected items when opening
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const hSelected = hourRef.current?.querySelector('.selected-item');
        if (hSelected) hSelected.scrollIntoView({ block: 'center' });
        const mSelected = minRef.current?.querySelector('.selected-item');
        if (mSelected) mSelected.scrollIntoView({ block: 'center' });
      }, 10);
    }
  }, [isOpen]);

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  const handleHourSelect = (h: string) => {
    let newMin = minute || '00';
    if (min && parseInt(h, 10) === minHour && parseInt(newMin, 10) < minMinute) {
      newMin = minMinute.toString().padStart(2, '0');
    }
    onChange(`${h}:${newMin}`);
  };

  const handleMinuteSelect = (m: string) => {
    onChange(`${hour || '00'}:${m}`);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div 
        className="w-full border border-border-custom rounded-xl px-4 py-2.5 text-[14px] text-on-surface bg-background/50 cursor-pointer flex items-center focus-within:ring-2 focus-within:ring-primary/40 h-[42px]"
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={0}
      >
        <div className="flex-1 font-medium text-center tracking-widest text-[15px]">
           {value || '--:--'}
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-on-surface-variant" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full min-w-[160px] bg-white rounded-xl shadow-level-2 border border-border-custom flex overflow-hidden max-h-56 transform origin-top animate-in fade-in zoom-in-95 duration-100">
          <style>{`
            .hide-scroll::-webkit-scrollbar { width: 0px; background: transparent; }
            .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
          `}</style>
          {/* Hours Column */}
          <div ref={hourRef} className="flex-1 overflow-y-auto border-r border-border-custom hide-scroll py-2">
            {hours.map(h => {
              const isDisabled = min ? parseInt(h, 10) < minHour : false;
              const isSelected = h === hour;
              return (
                <div
                  key={h}
                  onClick={() => !isDisabled && handleHourSelect(h)}
                  className={`px-4 py-2 text-center text-[15px] transition-colors ${
                    isDisabled ? 'text-gray-300 cursor-not-allowed' : 
                    isSelected ? 'bg-primary text-white font-bold selected-item cursor-default' : 'hover:bg-primary/10 text-on-surface cursor-pointer'
                  }`}
                >
                  {h}
                </div>
              );
            })}
          </div>
          {/* Minutes Column */}
          <div ref={minRef} className="flex-1 overflow-y-auto hide-scroll py-2">
            {minutes.map(m => {
              const isDisabled = min && parseInt(hour, 10) === minHour ? parseInt(m, 10) < minMinute : false;
              const isSelected = m === minute;
              return (
                <div
                  key={m}
                  onClick={() => !isDisabled && handleMinuteSelect(m)}
                  className={`px-4 py-2 text-center text-[15px] transition-colors ${
                    isDisabled ? 'text-gray-300 cursor-not-allowed' : 
                    isSelected ? 'bg-primary text-white font-bold selected-item cursor-default' : 'hover:bg-primary/10 text-on-surface cursor-pointer'
                  }`}
                >
                  {m}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimePicker24;
