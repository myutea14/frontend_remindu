import React, { useState, useEffect } from 'react';
// UX Polish: avatar preview and save confirmation toast
import WhatsAppIcon from '../components/ui/WhatsAppIcon';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import type { Achievement, DashboardStats, XpLog, ProfileUpdatePayload } from '../types';
import { getLevelIcon } from '../utils/level';

// ─── Sub-components ──────────────────────────────────────────────────────────

interface InfoRowProps {
  label: string;
  value: string;
  editable?: boolean;
  fieldKey?: string;
  onEdit?: (fieldKey: string) => void;
}
const InfoRow: React.FC<InfoRowProps> = ({ label, value, editable, fieldKey, onEdit }) => (
  <div className="flex items-center justify-between py-3 border-b border-border-custom last:border-0">
    <span className="text-[13px] text-on-surface-variant">{label}</span>
    <div className="flex items-center gap-2">
      <span className="text-[14px] font-semibold text-on-surface">{value || '—'}</span>
      {editable && onEdit && fieldKey && (
        <button onClick={() => onEdit(fieldKey)} className="p-1 hover:bg-border-custom rounded-lg transition-colors">
          <span className="material-symbols-outlined text-[15px] text-on-surface-variant">edit</span>
        </button>
      )}
    </div>
  </div>
);

// ─── Main Page ───────────────────────────────────────────────────────────────

const ProfilPage: React.FC = () => {
  const { user, setUser } = useAuth();
  const [extremeMode, setExtremeMode] = useState(user?.extreme_mode || false);
  const [waNumber, setWaNumber]       = useState(user?.phone_wa || '');
  const [editWa, setEditWa]           = useState(false);
  const [newWa, setNewWa]             = useState('');
  const [showOtp, setShowOtp]         = useState(false);
  const [otpCode, setOtpCode]         = useState('');
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const [recentXp, setRecentXp]       = useState<XpLog[]>([]);
  const [stats, setStats]             = useState<DashboardStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  // ── Editable profile fields ──
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({
    name: user?.name || '',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Sync state if user updates
  useEffect(() => {
    if (user) {
      setExtremeMode(user.extreme_mode);
      setWaNumber(user.phone_wa || '');
      setEditValues({
        name: user.name || '',
      });
    }
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran gambar maksimal 2MB");
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await api.post('/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUser(res.data.user);
    } catch (err: any) {
      console.error("Gagal mengunggah foto profil", err);
      alert(err.response?.data?.message || "Gagal mengunggah foto profil.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [logsRes, dashRes] = await Promise.all([
          api.get('/xp-logs'),
          api.get('/dashboard')
        ]);
        setRecentXp(logsRes.data.slice(0, 5));
        setStats(dashRes.data.stats);
        if (dashRes.data.achievements) {
          setAchievements(dashRes.data.achievements);
        }
      } catch (e) {
        console.error("Gagal load data", e);
      }
    };
    fetchData();
  }, []);

  if (!user) return <div className="p-8">Memuat...</div>;

  const handleRequestOtp = async () => {
    if (!newWa.trim()) return;
    setIsRequestingOtp(true);
    try {
      await api.post('/profile/request-otp', { phone_wa: newWa });
      setShowOtp(true);
    } catch (e: any) {
      console.error("Gagal request OTP", e);
      alert(e.response?.data?.message || "Gagal mengirim OTP. Pastikan format nomor benar.");
    } finally {
      setIsRequestingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode.trim() || otpCode.length !== 6) return;
    setIsVerifyingOtp(true);
    try {
      const response = await api.post('/profile/verify-otp', { phone_wa: newWa, otp: otpCode });
      setWaNumber(newWa);
      setEditWa(false);
      setShowOtp(false);
      setOtpCode('');
      setUser(response.data.user);
    } catch (e: any) {
      console.error("Gagal verifikasi OTP", e);
      alert(e.response?.data?.message || "OTP salah atau kedaluwarsa.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const toggleExtremeMode = async () => {
    const newVal = !extremeMode;
    setExtremeMode(newVal);
    try {
      const response = await api.patch('/profile', { extreme_mode: newVal });
      setUser(response.data);
    } catch (e) {
      console.error("Gagal update Extreme Mode", e);
      setExtremeMode(!newVal);
    }
  };

  const handleEditField = (fieldKey: string) => {
    setEditingField(fieldKey);
  };

  const handleSaveField = async (fieldKey: string) => {
    setIsSavingProfile(true);
    try {
      const payload: ProfileUpdatePayload = {
        [fieldKey]: editValues[fieldKey as keyof typeof editValues],
      };
      const response = await api.patch('/profile', payload);
      setUser(response.data);
      setEditingField(null);
    } catch (e) {
      console.error(`Gagal update ${fieldKey}`, e);
      alert(`Gagal menyimpan perubahan.`);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCancelEdit = () => {
    // Revert to current user data
    setEditValues({
      name: user.name || '',
    });
    setEditingField(null);
  };

  const currentXp  = user.xp_points;
  const targetXp   = user.level * 1000;
  const level      = user.level;
  const progress   = Math.min(100, Math.round((currentXp / targetXp) * 100));

  // ── Editable row renderer ──
  const renderEditableRow = (label: string, fieldKey: string, value: string) => {
    if (editingField === fieldKey) {
      return (
        <div className="flex items-center justify-between py-3 border-b border-border-custom last:border-0 gap-3">
          <span className="text-[13px] text-on-surface-variant flex-shrink-0">{label}</span>
          <div className="flex items-center gap-2">
            <input
              autoFocus
              type="text"
              value={editValues[fieldKey as keyof typeof editValues]}
              onChange={e => setEditValues({ ...editValues, [fieldKey]: e.target.value })}
              className="border border-border-custom rounded-lg px-3 py-1.5 text-[14px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 w-48"
            />
            <button
              onClick={() => handleSaveField(fieldKey)}
              disabled={isSavingProfile}
              className="p-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[15px]">check</span>
            </button>
            <button
              onClick={handleCancelEdit}
              className="p-1.5 hover:bg-border-custom rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-[15px] text-on-surface-variant">close</span>
            </button>
          </div>
        </div>
      );
    }
    return <InfoRow label={label} value={value} editable fieldKey={fieldKey} onEdit={handleEditField} />;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <h2 className="text-[40px] font-bold leading-tight tracking-tight text-primary mb-2"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Profil & Pengaturan
        </h2>
        <p className="text-[18px] text-on-surface-variant">Kelola akun, koneksi WhatsApp, dan preferensi notifikasimu.</p>
      </header>

      <div className="grid grid-cols-12 gap-6">

        {/* ── Left column ── */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-5">

          {/* Avatar & Level card */}
          <div className="bg-white rounded-2xl border border-border-custom shadow-level-1 p-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

            {/* Avatar */}
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white text-[36px] font-bold shadow-level-2 mx-auto overflow-hidden">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white border-2 border-border-custom flex items-center justify-center shadow-level-1 hover:bg-border-custom transition-colors cursor-pointer text-primary hover:text-primary/80">
                <span className="material-symbols-outlined text-[16px]">camera_alt</span>
                <input type="file" accept="image/jpeg,image/png,image/gif" className="hidden" onChange={handleAvatarUpload} />
              </label>
            </div>

            <h3 className="text-[22px] font-bold text-on-surface mb-0.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {user.name}
            </h3>
            <p className="text-[13px] text-on-surface-variant mb-4">{user.email}</p>

            {/* Level badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
              <span className="material-symbols-outlined icon-fill text-primary text-[18px]">{getLevelIcon(level)}</span>
              <span className="text-[14px] font-bold text-primary">Level {level}</span>
            </div>

            {/* XP bar */}
            <div className="w-full">
              <div className="flex justify-between text-[12px] text-on-surface-variant mb-1.5">
                <span>{currentXp.toLocaleString()} XP</span>
                <span>{targetXp.toLocaleString()} XP</span>
              </div>
              <div className="w-full bg-border-custom rounded-full h-2.5 overflow-hidden">
                <div className="bg-success h-2.5 rounded-full transition-all duration-700 relative"
                  style={{ width: `${progress}%` }}>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                </div>
              </div>
              <p className="text-[11px] text-on-surface-variant mt-1.5 text-right">{progress}% ke Level {level + 1}</p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Tugas Selesai', value: stats?.total_tasks_completed?.toString() || '0', icon: 'task_alt', color: 'text-primary' },
              { label: 'Total XP',      value: stats?.total_xp || '0K', icon: 'bolt',    color: 'text-success' },
              { label: 'Streak',        value: `${stats?.streak_days || 0} Hari`, icon: 'local_fire_department', color: 'text-orange-500' },
              { label: 'Grup Aktif',    value: stats?.active_groups?.toString() || '0', icon: 'groups',  color: 'text-secondary' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-border-custom shadow-level-1 p-4 text-center">
                <span className={`material-symbols-outlined icon-fill text-[24px] ${s.color} mb-1 block`}>{s.icon}</span>
                <p className="text-[18px] font-bold text-on-surface">{s.value}</p>
                <p className="text-[11px] text-on-surface-variant">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-5">

          {/* Info umum */}
          <div className="bg-white rounded-2xl border border-border-custom shadow-level-1 p-5">
            <h4 className="text-[16px] font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">person</span>
              Informasi Umum
            </h4>
            {renderEditableRow('Nama Lengkap', 'name', user.name)}
            <InfoRow label="Email" value={user.email} />

          </div>

          {/* WhatsApp Integration */}
          <div className="bg-white rounded-2xl border border-border-custom shadow-level-1 p-5">
            <h4 className="text-[16px] font-bold text-on-surface mb-1 flex items-center gap-2">
              <WhatsAppIcon className="w-5 h-5 fill-success" />
              Integrasi WhatsApp
            </h4>
            <p className="text-[13px] text-on-surface-variant mb-4">
              Bot Fonnte akan mengirim pengingat & menerima balasan "SELESAI [no]" untuk menandai tugas selesai.
            </p>

            {/* WA number */}
            <div className="flex items-center gap-3 p-4 bg-success/5 border border-success/30 rounded-xl mb-4">
              <div className="w-10 h-10 rounded-full bg-success flex items-center justify-center flex-shrink-0">
                <WhatsAppIcon className="w-5 h-5 fill-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-on-surface">{waNumber || 'Belum diatur'}</p>
                <p className={`text-[12px] font-medium ${user.wa_connected ? 'text-success' : 'text-error'}`}>
                  ● {user.wa_connected ? 'Terhubung' : 'Tidak Terhubung'}
                </p>
              </div>
              <button onClick={() => { setEditWa(true); setNewWa(waNumber); }}
                className="p-2 hover:bg-border-custom rounded-xl transition-colors">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">edit</span>
              </button>
            </div>

            {editWa && !showOtp && (
              <div className="flex gap-2 mb-4">
                <input value={newWa} onChange={e => setNewWa(e.target.value)}
                  placeholder="+62 8xx-xxxx-xxxx"
                  className="flex-1 border border-border-custom rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/40" />
                <button onClick={handleRequestOtp} disabled={isRequestingOtp}
                  className="px-4 py-2.5 bg-primary text-white rounded-xl text-[14px] font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
                  {isRequestingOtp ? 'Mengirim...' : 'Kirim OTP'}
                </button>
                <button onClick={() => setEditWa(false)}
                  className="px-4 py-2.5 border border-border-custom rounded-xl text-[14px] font-semibold text-on-surface-variant hover:bg-border-custom transition-colors">
                  Batal
                </button>
              </div>
            )}

            {showOtp && (
              <div className="flex gap-2 mb-4 bg-primary/5 p-4 rounded-xl border border-primary/20">
                <div className="flex-1">
                  <p className="text-[12px] text-on-surface-variant mb-2">Masukkan 6 digit kode OTP yang dikirim ke WhatsApp Anda.</p>
                  <div className="flex gap-2">
                    <input value={otpCode} onChange={e => setOtpCode(e.target.value)}
                      placeholder="123456"
                      maxLength={6}
                      className="flex-1 border border-border-custom rounded-xl px-4 py-2.5 text-[14px] tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-primary/40" />
                    <button onClick={handleVerifyOtp} disabled={isVerifyingOtp}
                      className="px-4 py-2.5 bg-success text-white rounded-xl text-[14px] font-semibold hover:bg-success/90 transition-colors disabled:opacity-50">
                      {isVerifyingOtp ? 'Mengecek...' : 'Verifikasi'}
                    </button>
                    <button onClick={() => setShowOtp(false)}
                      className="px-4 py-2.5 border border-border-custom bg-white rounded-xl text-[14px] font-semibold text-on-surface-variant hover:bg-border-custom transition-colors">
                      Batal
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tip box */}
            <div className="bg-accent/40 border border-border-custom rounded-xl p-4">
              <p className="text-[13px] text-on-surface leading-relaxed">
                <span className="font-bold text-primary inline-flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">lightbulb</span> Cara Penggunaan Bot:</span><br />
                Balas pesan dari bot dengan format berikut:
              </p>
              <div className="mt-2 flex flex-col gap-1.5">
                {[
                  { cmd: 'SELESAI 2', desc: 'Tandai tugas #2 sebagai selesai' },
                  { cmd: 'TUNDA 1 15m', desc: 'Tunda pengingat tugas #1 selama 15 menit' },
                  { cmd: 'STATUS', desc: 'Lihat ringkasan semua tugas aktif' },
                ].map(c => (
                  <div key={c.cmd} className="flex items-center gap-3">
                    <code className="bg-white border border-border-custom px-2.5 py-1 rounded-lg text-primary font-mono text-[12px] font-bold flex-shrink-0">
                      {c.cmd}
                    </code>
                    <span className="text-[12px] text-on-surface-variant">{c.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Extreme Accountability Mode */}
          <div className={`rounded-2xl border shadow-level-1 p-5 transition-all duration-300 ${
            extremeMode ? 'bg-error/5 border-error' : 'bg-white border-border-custom'
          }`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className={`text-[16px] font-bold mb-1 flex items-center gap-2 ${extremeMode ? 'text-error' : 'text-on-surface'}`}>
                  <span className="material-symbols-outlined text-[18px]">
                    {extremeMode ? 'warning' : 'notifications_active'}
                  </span>
                  Extreme Accountability Mode
                  {extremeMode && (
                    <span className="px-2 py-0.5 bg-error text-white text-[11px] rounded-full font-bold animate-pulse">AKTIF</span>
                  )}
                </h4>
                <p className="text-[13px] text-on-surface-variant leading-relaxed">
                  Saat diaktifkan, sistem akan mengirim pesan WhatsApp <strong>agresif & berulang</strong> setiap 30 menit
                  untuk tugas yang memasuki Zona Merah (&lt;24 jam deadline). Hanya gunakan jika kamu serius!
                </p>
              </div>
              {/* Toggle */}
              <button onClick={toggleExtremeMode}
                className={`relative w-14 h-7 rounded-full transition-colors duration-300 flex-shrink-0 ${
                  extremeMode ? 'bg-error' : 'bg-border-custom'
                }`}>
                <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-300 ${
                  extremeMode ? 'translate-x-7' : ''
                }`} />
              </button>
            </div>
            {extremeMode && (
              <div className="mt-4 p-3 bg-error/10 border border-error/30 rounded-xl text-[12px] text-error font-medium flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] flex-shrink-0 mt-0.5">info</span>
                Mode aktif: Bot akan mengirim maksimal 10 pesan pengingat per tugas Zona Merah. Kamu dapat menonaktifkan kapan saja.
              </div>
            )}
          </div>

          {/* Pencapaian / Achievements — Dynamic */}
          <div className="bg-white rounded-2xl border border-border-custom shadow-level-1 p-5">
            <h4 className="text-[16px] font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined icon-fill text-[18px] text-primary">emoji_events</span>
              Pencapaian
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {achievements.map(a => (
                <div key={a.id}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    a.earned
                      ? 'border-primary/20 bg-primary/5 hover:shadow-level-1'
                      : 'border-border-custom opacity-40 grayscale'
                  }`}>
                  <span className={`material-symbols-outlined icon-fill text-[28px] mb-1.5 block ${a.earned ? 'text-primary' : 'text-on-surface-variant'}`}>
                    {a.icon}
                  </span>
                  <p className="text-[12px] font-bold text-on-surface leading-tight mb-0.5">{a.label}</p>
                  <p className="text-[11px] text-on-surface-variant leading-snug">{a.desc}</p>
                  {a.earned && (
                    <span className="mt-1.5 inline-flex items-center gap-0.5 px-2 py-0.5 bg-success/10 text-success text-[10px] font-bold rounded-full"><span className="material-symbols-outlined text-[12px]">check</span> Diraih</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* XP Log */}
          <div className="bg-white rounded-2xl border border-border-custom shadow-level-1 p-5">
            <h4 className="text-[16px] font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary">bolt</span>
              Log XP Terbaru
            </h4>
            <div className="flex flex-col gap-2">
              {recentXp.length === 0 ? (
                <p className="text-[13px] text-on-surface-variant py-2">Belum ada riwayat XP.</p>
              ) : recentXp.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2.5 border-b border-border-custom last:border-0">
                  <div>
                    <p className="text-[14px] font-medium text-on-surface">{item.reason || item.description}</p>
                    <p className="text-[12px] text-on-surface-variant">
                      {new Date(item.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <span className={`text-[15px] font-bold ${(item.xp_amount || item.points || 0) > 0 ? 'text-success' : 'text-error'}`}>
                    {(item.xp_amount || item.points || 0) > 0 ? '+' : ''}{item.xp_amount || item.points} XP
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
      <div className="h-12" />
    </div>
  );
};

export default ProfilPage;
