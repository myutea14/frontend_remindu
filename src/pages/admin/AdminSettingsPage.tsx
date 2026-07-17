import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

interface AppSetting {
  id: number;
  key: string;
  value: string;
  description: string;
}

const AdminSettingsPage: React.FC = () => {
  const { token } = useAuth();
  const [settings, setSettings] = useState<AppSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);

  useEffect(() => {
    fetchSettings();
  }, [token]);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/admin/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: number, newValue: string) => {
    setSaving(id);
    try {
      await axios.patch(`http://localhost:8000/api/admin/settings/${id}`, 
        { value: newValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Error updating setting:', error);
      alert('Gagal memperbarui');
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;

  return (
    <div className="max-w-4xl mx-auto pb-12 space-y-12">
      {/* Settings Section */}
      <div>
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Pengaturan API & Sistem</h2>
          <p className="text-on-surface-variant mt-2">Kelola kredensial dan konfigurasi kunci sistem di sini. Hati-hati dalam mengubah token API.</p>
        </div>
        
        <div className="space-y-6">
          {settings.map(setting => (
            <div key={setting.id} className="bg-white p-8 rounded-3xl shadow-level-1 border border-border-custom flex flex-col gap-5 hover:border-primary/30 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center mt-1">
                  <span className="material-symbols-outlined icon-fill text-secondary text-2xl">
                    {setting.key.includes('api_key') ? 'api' : 'key'}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{setting.key}</h3>
                  <p className="text-sm text-gray-500 mt-1">{setting.description}</p>
                  
                  <div className="mt-5 flex gap-4">
                    <div className="relative flex-1">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
                        {(setting.key.includes('token') || setting.key.includes('key')) ? 'password' : 'edit'}
                      </span>
                      <input 
                        type={(setting.key.includes('token') || setting.key.includes('key')) ? "password" : "text"} 
                        defaultValue={setting.value}
                        onChange={(e) => {
                          const newSettings = [...settings];
                          const idx = newSettings.findIndex(s => s.id === setting.id);
                          newSettings[idx].value = e.target.value;
                          setSettings(newSettings);
                        }}
                        className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary text-gray-700 outline-none transition-all font-mono text-sm"
                        placeholder="Masukkan nilai..."
                      />
                    </div>
                    <button 
                      onClick={() => handleUpdate(setting.id, setting.value)}
                      disabled={saving === setting.id}
                      className="px-8 py-3.5 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {saving === setting.id ? (
                        <>
                          <span className="animate-spin material-symbols-outlined text-[20px]">refresh</span>
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[20px]">save</span>
                          Simpan
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Broadcast Section */}
      <div className="pt-8 border-t border-border-custom">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Siaran Pengumuman (Broadcast)</h2>
          <p className="text-on-surface-variant mt-2">Kirim pesan WhatsApp massal ke seluruh pengguna yang terhubung.</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-level-1 border border-border-custom hover:border-secondary/30 transition-colors">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined icon-fill text-primary text-2xl">
                campaign
              </span>
            </div>
            <div className="flex-1 space-y-4">
              <textarea 
                id="broadcastMessage"
                className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary text-gray-700 outline-none transition-all min-h-[120px] resize-y"
                placeholder="Tulis pesan pengumuman Anda di sini..."
              ></textarea>
              <button 
                onClick={async () => {
                  const msg = (document.getElementById('broadcastMessage') as HTMLTextAreaElement).value;
                  if (!msg || msg.length < 5) {
                    alert('Pesan harus lebih dari 5 karakter.');
                    return;
                  }
                  if (!window.confirm('Kirim siaran ini ke semua pengguna aktif?')) return;
                  
                  const btn = document.getElementById('btnBroadcast');
                  if (btn) { btn.innerHTML = 'Mengirim...'; btn.setAttribute('disabled', 'true'); }
                  
                  try {
                    const res = await axios.post('http://localhost:8000/api/admin/broadcast', 
                      { message: msg },
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    alert(res.data.message);
                    (document.getElementById('broadcastMessage') as HTMLTextAreaElement).value = '';
                  } catch (error: any) {
                    alert(error.response?.data?.message || 'Gagal mengirim siaran.');
                  } finally {
                    if (btn) { btn.innerHTML = '<span class="material-symbols-outlined">send</span> Kirim Siaran'; btn.removeAttribute('disabled'); }
                  }
                }}
                id="btnBroadcast"
                className="px-8 py-3.5 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 hover:shadow-lg transition-all flex items-center gap-2 w-full justify-center"
              >
                <span className="material-symbols-outlined text-[20px]">send</span>
                Kirim Siaran
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminSettingsPage;
