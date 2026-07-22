import React from 'react';
import WhatsAppIcon from '../ui/WhatsAppIcon';
interface WhatsAppStatusProps {
  isConnected?: boolean;
}

const WhatsAppStatus: React.FC<WhatsAppStatusProps> = ({ isConnected = false }) => {
  return (
    <div className="bg-white rounded-2xl border border-border-custom card-level-1 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-on-surface">WhatsApp Bot Status</h3>
        <button className="text-on-surface-variant hover:bg-border-custom transition-colors p-1 rounded-full">
          <span className="material-symbols-outlined text-[20px]">more_horiz</span>
        </button>
      </div>

      <div className={`flex items-center gap-4 p-4 rounded-xl border ${isConnected ? 'bg-[#b0eeea]/20 border-[#b0eeea]' : 'bg-surface-variant border-outline-variant'}`}>
        {/* Icon */}
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white flex-shrink-0 shadow-level-1 ${isConnected ? 'bg-secondary' : 'bg-outline-variant'}`}>
          <WhatsAppIcon className="w-6 h-6 fill-current" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <h4 className="text-[14px] font-semibold text-on-surface">{isConnected ? 'Connected' : 'Disconnected'}</h4>
          <p className="text-[12px] text-on-surface-variant">{isConnected ? 'Sinkronisasi aktif 24/7' : 'Buka Pengaturan untuk koneksi'}</p>
        </div>

        {/* Live indicator */}
        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${isConnected ? 'bg-success animate-pulse shadow-[0_0_8px_rgba(20,201,122,0.6)]' : 'bg-outline-variant'}`} />
      </div>

      {/* Instruction tip */}
      <div className="mt-4 p-3 bg-border-custom/30 rounded-xl">
        <p className="text-[12px] text-on-surface-variant">
          <span className="font-semibold text-primary inline-flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">lightbulb</span> Tip:</span> Balas pesan bot dengan{' '}
          <code className="bg-white border border-border-custom px-1.5 py-0.5 rounded text-[11px] font-mono text-primary font-bold">
            SELESAI 1
          </code>{' '}
          untuk menandai tugas #1 sebagai selesai langsung dari WhatsApp.
        </p>
      </div>
    </div>
  );
};

export default WhatsAppStatus;
