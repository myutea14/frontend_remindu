import React, { useState, useEffect } from 'react';
// UX Polish: drag-to-reorder and bulk delete feature
import api from '../services/api';
import type { Task, TaskCreatePayload, TaskUpdatePayload, OutputType, LoadType } from '../types';
import TimePicker24 from '../components/ui/TimePicker24';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';

const typeColors: Record<string, string> = {
  'Tugas': 'bg-blue-100 text-blue-700',
  'Kuis / Ujian': 'bg-purple-100 text-purple-700',
  'Komunitas': 'bg-indigo-100 text-indigo-700',
  'Pribadi': 'bg-orange-100 text-orange-700',
};

const OUTPUT_TYPES: OutputType[] = ['Tugas', 'Kuis / Ujian', 'Komunitas', 'Pribadi'];
const LOAD_TYPES: LoadType[] = ['Ringan', 'Sedang', 'Berat'];

const getLocalISODate = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split('T')[0];
};

const getLocalISOTime = () => {
  const d = new Date();
  return d.toTimeString().slice(0, 5);
};

const ReminderPage: React.FC = () => {
  const { refreshUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'semua' | 'hari-ini' | 'zona-merah'>('semua');
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  
  // Create Modal states
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState<TaskCreatePayload>({
    title: '',
    description: '',
    deadline: '',
    output_type: 'Pribadi',
    load_type: 'Ringan',
    involvement_type: 'Pribadi'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Edit Modal states
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    deadline: '',
    output_type: 'Pribadi' as OutputType,
    load_type: 'Ringan' as LoadType,
    involvement_type: 'Pribadi' as 'Pribadi' | 'Kelompok',
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const fetchTasks = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const response = await api.get('/tasks?per_page=100');
      setTasks(response.data.data || response.data);
    } catch (error) {
      console.error("Gagal mengambil data tugas:", error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleMarkDone = async (id: number) => {
    // Optimistic update to immediately remove it from the active list
    setTasks(tasks.map(t => t.id === id ? { ...t, status: 'done' } : t));
    
    try {
      await api.post(`/tasks/${id}/done`);
      await fetchTasks(false); // Refresh silently in the background
      await refreshUser(); // Update global user state (XP)
    } catch (e) {
      console.error("Gagal menyelesaikan tugas", e);
      // Revert on error
      await fetchTasks(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Hapus tugas ini secara permanen?")) return;
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (e) {
      console.error("Gagal menghapus tugas", e);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setCreateError(null);
    try {
      await api.post('/tasks', newTask);
      setShowModal(false);
      setCreateError(null);
      setNewTask({
        title: '',
        description: '',
        deadline: '',
        output_type: 'Pribadi',
        load_type: 'Ringan',
        involvement_type: 'Pribadi'
      });
      fetchTasks(false);
    } catch (error: any) {
      console.error("Gagal membuat tugas baru:", error);
      if (error?.response?.data?.errors) {
        const msgs = Object.values(error.response.data.errors).flat().join(' | ');
        setCreateError(msgs as string);
      } else if (error?.response?.data?.message) {
        setCreateError(error.response.data.message);
      } else {
        setCreateError('Gagal menyimpan tugas. Coba lagi.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Edit Modal Handlers ──
  const openEditModal = (task: Task) => {
    setEditTask(task);
    setEditForm({
      title: task.title,
      description: task.description || '',
      deadline: task.deadline ? task.deadline.substring(0, 16) : '',
      output_type: task.output_type,
      load_type: task.load_type,
      involvement_type: task.involvement_type,
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTask) return;
    setIsSavingEdit(true);
    try {
      const payload: TaskUpdatePayload = {
        title: editForm.title,
        description: editForm.description || undefined,
        deadline: editForm.deadline,
        output_type: editForm.output_type,
        load_type: editForm.load_type,
        involvement_type: editForm.involvement_type,
      };
      await api.patch(`/tasks/${editTask.id}`, payload);
      setEditTask(null);
      await fetchTasks(false);
    } catch (error) {
      console.error("Gagal mengedit tugas:", error);
      alert("Gagal menyimpan perubahan.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Filter Logic
  const filteredTasks = tasks.filter(t => {
    if (t.status === 'done') return false; // Sembunyikan tugas yang sudah selesai

    if (filter === 'semua') return true;
    if (filter === 'zona-merah') return t.is_zona_merah;
    if (filter === 'hari-ini') {
      const targetDate = t.deadline;
      if (!targetDate) return false;
      const today = getLocalISODate(); // Using local date helper instead of UTC
      
      // Convert UTC deadline from API back to local date string to compare properly
      const localDeadline = new Date(targetDate);
      localDeadline.setMinutes(localDeadline.getMinutes() - localDeadline.getTimezoneOffset());
      const localDeadlineStr = localDeadline.toISOString().split('T')[0];
      
      return localDeadlineStr === today;
    }
    
    return true;
  }).filter(t => {
    if (!searchQuery) return true;
    const lowerQ = searchQuery.toLowerCase();
    return t.title.toLowerCase().includes(lowerQ) || 
           (t.description && t.description.toLowerCase().includes(lowerQ));
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-[40px] font-bold leading-tight tracking-tight text-primary mb-2"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Reminder Tugas
          </h2>
          <p className="text-[18px] text-on-surface-variant">Kelola daftar pengingat dan tugas pribadimu.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-primary text-white px-5 py-3 rounded-xl font-semibold shadow-level-1 hover:bg-primary/90 transition-colors flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">add_task</span>
          Tambah Pengingat
        </button>
      </header>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 hide-scrollbar">
        {[
          { id: 'semua', label: 'Semua Aktif' },
          { id: 'hari-ini', label: 'Hari Ini' },
          { id: 'zona-merah', label: <span className="flex items-center gap-1">Zona Merah <span className="material-symbols-outlined icon-fill text-error text-[14px]">error</span></span> }
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as typeof filter)}
            className={`px-4 py-2 rounded-xl text-[14px] font-semibold transition-colors whitespace-nowrap ${
              filter === f.id
                ? 'bg-primary text-white shadow-level-1'
                : 'bg-white border border-border-custom text-on-surface-variant hover:bg-border-custom/50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="bg-white rounded-2xl border border-border-custom shadow-level-1 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-on-surface-variant">Memuat pengingat...</div>
        ) : sortedTasks.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-border-custom rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-on-surface-variant text-[32px]">task</span>
            </div>
            <h3 className="text-[16px] font-bold text-on-surface mb-1">Tidak Ada Tugas</h3>
            <p className="text-[14px] text-on-surface-variant">
              Anda tidak memiliki tugas dalam filter ini.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border-custom">
            {sortedTasks.map(task => (
              <div key={task.id} className={`p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center transition-colors hover:bg-background/50 ${task.is_zona_merah && task.status !== 'done' ? 'bg-error/5' : ''}`}>
                
                {/* Left side info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`text-[16px] font-bold truncate ${task.status === 'done' ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {task.is_zona_merah && task.status !== 'done' && <span className="material-symbols-outlined icon-fill text-error text-[16px] mr-1.5">error</span>}
                      {task.title}
                    </h4>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-[12px] font-medium text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">event</span>
                      {new Date(task.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-border-custom"></span>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1 ${typeColors[task.output_type] || 'bg-gray-100 text-gray-700'}`}>
                      {task.output_type === 'Organisasi' ? (
                        <>
                          <span className="material-symbols-outlined text-[14px]">groups</span>
                          {task.group?.name || 'Komunitas'}
                        </>
                      ) : (
                        task.output_type || 'Tugas'
                      )}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-border-custom text-on-surface-variant">
                      {task.load_type || 'Ringan'}
                    </span>
                  </div>
                </div>

                {/* Right side actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {/* Edit button */}
                  <button 
                    onClick={() => openEditModal(task)}
                    className="p-1.5 text-on-surface-variant hover:bg-primary/10 hover:text-primary rounded-xl transition-colors"
                    title="Edit">
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  
                  {task.status !== 'done' ? (
                    <button 
                      onClick={() => handleMarkDone(task.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-success/10 text-success hover:bg-success/20 rounded-xl text-[13px] font-semibold transition-colors">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      Selesai
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 bg-border-custom text-on-surface-variant rounded-xl text-[13px] font-semibold flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">done_all</span>
                      Tuntas
                    </span>
                  )}
                  
                  <button 
                    onClick={() => handleDelete(task.id)}
                    className="p-1.5 text-on-surface-variant hover:bg-error/10 hover:text-error rounded-xl transition-colors"
                    title="Hapus">
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-level-2 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-border-custom flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-[20px] font-bold text-primary" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Tambah Pengingat Baru</h3>
              <button onClick={() => { setShowModal(false); setCreateError(null); }} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-border-custom text-on-surface-variant transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            {createError && (
              <div className="mx-6 mt-4 px-4 py-3 bg-error/10 border border-error/30 rounded-xl text-[13px] text-error font-medium flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] mt-0.5 shrink-0">error</span>
                <span>{createError}</span>
              </div>
            )}
            
            <form onSubmit={handleCreateTask} className="p-6 overflow-y-auto">
              <div className="space-y-5">
                <div>
                  <label className="block text-[13px] font-semibold text-on-surface mb-1.5">Nama Tugas *</label>
                  <input required type="text" 
                    value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})}
                    placeholder="Contoh: Baca Jurnal AI"
                    className="w-full border border-border-custom rounded-xl px-4 py-2.5 text-[14px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 bg-background/50" />
                </div>
                
                <div>
                  <label className="block text-[13px] font-semibold text-on-surface mb-1.5">Deskripsi Singkat</label>
                  <textarea rows={2}
                    value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})}
                    placeholder="Detail pengingat..."
                    className="w-full border border-border-custom rounded-xl px-4 py-2.5 text-[14px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 bg-background/50" />
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-[13px] font-semibold text-on-surface mb-1.5">Tanggal Tenggat *</label>
                    <input required type="date" 
                      min={getLocalISODate()}
                      value={newTask.deadline ? newTask.deadline.split('T')[0] : ''}
                      onChange={e => {
                        const date = e.target.value;
                        const time = (newTask.deadline && newTask.deadline.includes('T')) ? newTask.deadline.split('T')[1].substring(0,5) : (date === getLocalISODate() ? getLocalISOTime() : '23:59');
                        setNewTask({...newTask, deadline: date ? `${date}T${time}` : ''});
                      }}
                      className="w-full border border-border-custom rounded-xl px-4 py-2.5 text-[14px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 bg-background/50" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[13px] font-semibold text-on-surface mb-1.5">Jam *</label>
                    <TimePicker24
                      required={true}
                      min={(newTask.deadline && newTask.deadline.startsWith(getLocalISODate())) ? getLocalISOTime() : undefined}
                      value={(newTask.deadline && newTask.deadline.includes('T')) ? newTask.deadline.split('T')[1].substring(0,5) : ''}
                      onChange={time => {
                        const date = (newTask.deadline && newTask.deadline.includes('T')) ? newTask.deadline.split('T')[0] : getLocalISODate();
                        setNewTask({...newTask, deadline: `${date}T${time}`});
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-4 mt-2">

                  <div>
                    <label className="block text-[13px] font-semibold text-on-surface mb-2">Prioritas</label>
                    <div className="flex flex-wrap gap-2">
                      {LOAD_TYPES.map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setNewTask({...newTask, load_type: t})}
                          className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-colors border ${
                            newTask.load_type === t 
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                              : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <button type="submit" disabled={isSubmitting}
                  className="w-full bg-primary text-white py-3 rounded-xl font-bold text-[15px] hover:bg-primary/90 transition-colors shadow-level-1 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Pengingat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-level-2 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-border-custom flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-[20px] font-bold text-primary" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Edit Tugas</h3>
              <button onClick={() => setEditTask(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-border-custom text-on-surface-variant transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSaveEdit} className="p-6 overflow-y-auto">
              <div className="space-y-5">
                <div>
                  <label className="block text-[13px] font-semibold text-on-surface mb-1.5">Nama Tugas *</label>
                  <input required type="text"
                    value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full border border-border-custom rounded-xl px-4 py-2.5 text-[14px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 bg-background/50" />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-on-surface mb-1.5">Deskripsi Singkat</label>
                  <textarea rows={2}
                    value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full border border-border-custom rounded-xl px-4 py-2.5 text-[14px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 bg-background/50" />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-[13px] font-semibold text-on-surface mb-1.5">Tanggal Tenggat *</label>
                    <input required type="date" 
                      min={getLocalISODate()}
                      value={editForm.deadline ? editForm.deadline.split('T')[0] : ''}
                      onChange={e => {
                        const date = e.target.value;
                        const time = (editForm.deadline && editForm.deadline.includes('T')) ? editForm.deadline.split('T')[1].substring(0,5) : (date === getLocalISODate() ? getLocalISOTime() : '23:59');
                        setEditForm({...editForm, deadline: date ? `${date}T${time}` : ''});
                      }}
                      className="w-full border border-border-custom rounded-xl px-4 py-2.5 text-[14px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 bg-background/50" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[13px] font-semibold text-on-surface mb-1.5">Jam *</label>
                    <TimePicker24
                      required={true}
                      min={(editForm.deadline && editForm.deadline.startsWith(getLocalISODate())) ? getLocalISOTime() : undefined}
                      value={(editForm.deadline && editForm.deadline.includes('T')) ? editForm.deadline.split('T')[1].substring(0,5) : ''}
                      onChange={time => {
                        const date = (editForm.deadline && editForm.deadline.includes('T')) ? editForm.deadline.split('T')[0] : getLocalISODate();
                        setEditForm({...editForm, deadline: `${date}T${time}`});
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-4 mt-2">

                  <div>
                    <label className="block text-[13px] font-semibold text-on-surface mb-2">Prioritas</label>
                    <div className="flex flex-wrap gap-2">
                      {LOAD_TYPES.map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setEditForm({...editForm, load_type: t})}
                          className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-colors border ${
                            editForm.load_type === t 
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                              : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button type="submit" disabled={isSavingEdit || !editForm.title.trim()}
                  className="w-full bg-primary text-white py-3 rounded-xl font-bold text-[15px] hover:bg-primary/90 transition-colors shadow-level-1 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSavingEdit ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <div className="h-12" />
    </div>
  );
};

export default ReminderPage;
