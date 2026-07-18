import React, { useState, useEffect } from 'react';
import api from '../services/api';
import type { Task, TaskCreatePayload, TaskUpdatePayload, OutputType, LoadType } from '../types';
import TimePicker24 from '../components/ui/TimePicker24';
import { useSearchParams } from 'react-router-dom';

interface CalendarDay {
  date: number;
  month: 'prev' | 'current' | 'next';
  hasTask?: boolean;
  isZonaMerah?: boolean;
  isToday?: boolean;
}

const typeColors: Record<string, string> = {
  'Tugas': 'bg-blue-100 text-blue-700',
  'Kuis / Ujian': 'bg-purple-100 text-purple-700',
  'Organisasi': 'bg-yellow-100 text-yellow-700',
  'Pribadi': 'bg-orange-100 text-orange-700',
};

const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTHS = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember',
];

const OUTPUT_TYPES: OutputType[] = ['Tugas', 'Kuis / Ujian', 'Organisasi', 'Pribadi'];
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

const KalenderPage: React.FC = () => {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState(now.getDate());
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);


  // ── Edit Task Modal state ──
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    deadline: '',
    output_type: 'Pribadi' as OutputType,
    load_type: 'Ringan' as LoadType,
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      const data: Task[] = response.data.data || response.data;
      setTasks(data);
    } catch (error) {
      console.error("Failed to fetch tasks for calendar:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);


  // ── Edit Modal Handlers ──
  const openEditModal = (task: Task) => {
    setEditTask(task);
    setEditForm({
      title: task.title,
      description: task.description || '',
      deadline: task.deadline ? task.deadline.substring(0, 16) : '',
      output_type: task.output_type,
      load_type: task.load_type,
    });
  };

  const handleSaveEdit = async () => {
    if (!editTask) return;
    setIsSavingEdit(true);
    try {
      const payload: TaskUpdatePayload = {
        title: editForm.title,
        description: editForm.description || undefined,
        deadline: editForm.deadline,
        output_type: editForm.output_type,
        load_type: editForm.load_type,
      };
      await api.patch(`/tasks/${editTask.id}`, payload);
      setEditTask(null);
      await fetchTasks();
    } catch (error) {
      console.error("Gagal mengedit tugas:", error);
      alert("Gagal menyimpan perubahan.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const buildCalendarDays = (year: number, month: number): CalendarDay[] => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const today = new Date();

    const days: CalendarDay[] = [];

    // prev month fill
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ date: daysInPrevMonth - i, month: 'prev' });
    }
    // current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayTasks = tasks.filter(t => {
        if (!t.deadline || !t.deadline.startsWith(dateStr) || t.status === 'done') return false;
        if (!searchQuery) return true;
        return t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
               (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
      });
      days.push({
        date: d,
        month: 'current',
        isToday: today.getFullYear() === year && today.getMonth() === month && today.getDate() === d,
        hasTask: dayTasks.length > 0,
        isZonaMerah: dayTasks.some(t => t.is_zona_merah),
      });
    }
    // next month fill
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      days.push({ date: d, month: 'next' });
    }
    return days;
  };

  const calDays = buildCalendarDays(viewYear, viewMonth);

  const selectedDateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
  const daySchedule = tasks
    .filter(t => {
      if (!t.deadline || !t.deadline.startsWith(selectedDateStr) || t.status === 'done') return false;
      if (!searchQuery) return true;
      return t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
             (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
    })
    .map(t => ({
      id: t.id,
      time: new Date(t.deadline.replace(' ', 'T')).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      title: t.title,
      type: t.output_type || 'Tugas',
      load: t.load_type || 'Sedang',
      isZonaMerah: t.is_zona_merah,
      waSync: t.is_zona_merah,
      raw: t,
    }));

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <h2 className="text-[40px] font-bold leading-tight tracking-tight text-primary mb-2"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Kalender & Jadwal
        </h2>
        <p className="text-[18px] text-on-surface-variant">Rencanakan harimu, kuasai waktumu.</p>
      </header>

      <div className="grid grid-cols-12 gap-6">
        {/* === Calendar Widget === */}
        <div className="col-span-12 lg:col-span-5">
          <div className="bg-white rounded-2xl border border-border-custom shadow-level-1 p-6">
            {/* Month nav */}
            <div className="flex items-center justify-between mb-6">
              <button onClick={prevMonth}
                className="p-2 rounded-xl hover:bg-border-custom transition-colors text-on-surface-variant">
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              <h3 className="text-[18px] font-bold text-primary"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {MONTHS[viewMonth]} {viewYear}
              </h3>
              <button onClick={nextMonth}
                className="p-2 rounded-xl hover:bg-border-custom transition-colors text-on-surface-variant">
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {DAYS.map(d => (
                <div key={d} className="text-center text-[12px] font-semibold text-on-surface-variant py-1">{d}</div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {calDays.map((day, i) => (
                <button
                  key={i}
                  onClick={() => day.month === 'current' && setSelectedDay(day.date)}
                  className={`
                    relative aspect-square flex flex-col items-center justify-center rounded-xl text-[13px] font-semibold transition-all duration-150
                    ${day.month !== 'current' ? 'text-outline/30' : ''}
                    ${day.isToday && day.month === 'current' ? 'ring-2 ring-primary' : ''}
                    ${selectedDay === day.date && day.month === 'current'
                      ? 'bg-primary text-white shadow-level-1 scale-[1.08]'
                      : day.month === 'current' ? 'hover:bg-border-custom text-on-surface' : ''}
                    ${day.isZonaMerah && day.month === 'current' && selectedDay !== day.date ? 'text-error' : ''}
                  `}
                >
                  {day.date}
                  {day.hasTask && day.month === 'current' && selectedDay !== day.date && (
                    <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${day.isZonaMerah ? 'bg-error' : 'bg-primary'}`} />
                  )}
                </button>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-5 flex items-center gap-4 text-[12px] text-on-surface-variant border-t border-border-custom pt-4">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary inline-block" />Ada tugas</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-error inline-block" />Zona Merah</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-outline/30 inline-block ring-2 ring-primary" />Hari ini</span>
            </div>
          </div>

        </div>

        {/* === Daily Schedule === */}
        <div className="col-span-12 lg:col-span-7">
          <div className="bg-white rounded-2xl border border-border-custom shadow-level-1 p-6 h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[18px] font-bold text-on-surface"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Jadwal —{' '}
                <span className="text-primary">
                  {selectedDay} {MONTHS[viewMonth]}
                </span>
              </h3>
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[12px] font-semibold">
                {daySchedule.length} tugas
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {loading ? (
                <div className="p-4 text-center text-on-surface-variant">Memuat jadwal...</div>
              ) : daySchedule.length === 0 ? (
                <div className="p-4 text-center text-on-surface-variant border-2 border-dashed border-border-custom rounded-xl">
                  Tidak ada tugas untuk tanggal ini.
                </div>
              ) : (
                daySchedule.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => openEditModal(item.raw)}
                    className={`flex gap-4 p-4 rounded-xl border transition-all duration-200 hover:shadow-level-1 group cursor-pointer ${
                      item.isZonaMerah
                        ? 'border-error bg-error/5 zona-merah-pulse'
                        : 'border-border-custom hover:border-primary/30'
                    }`}
                  >
                    {/* Time */}
                    <div className="flex-shrink-0 w-14 text-center">
                      <span className={`text-[13px] font-bold ${item.isZonaMerah ? 'text-error' : 'text-primary'}`}>
                        {item.time}
                      </span>
                    </div>

                    {/* Divider */}
                    <div className={`w-0.5 rounded-full flex-shrink-0 ${item.isZonaMerah ? 'bg-error' : 'bg-border-custom'}`} />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-[15px] font-semibold mb-1.5 group-hover:text-primary transition-colors ${
                        item.isZonaMerah ? 'text-error' : 'text-on-surface'
                      }`}
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        <div className="flex items-center text-[13px] font-bold text-on-surface line-clamp-1">
                          {item.isZonaMerah && <span className="material-symbols-outlined icon-fill text-error text-[14px] mr-1 inline-block align-text-bottom">error</span>}
                          {item.title}
                        </div>
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${typeColors[item.type] || 'bg-gray-100 text-gray-700'}`}>
                          {item.type}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-border-custom text-on-surface-variant">
                          {item.load}
                        </span>
                        {item.waSync && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-success/10 text-success flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">chat</span> WA
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action */}
                    <button className="flex-shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className={`material-symbols-outlined text-[20px] ${item.isZonaMerah ? 'text-error' : 'text-primary'}`}>
                        edit
                      </span>
                    </button>
                  </div>
                ))
              )}

            </div>
          </div>
        </div>
      </div>

      {/* ── Edit Task Modal ── */}
      {editTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-level-2 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-border-custom flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-[20px] font-bold text-primary" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Edit Tugas</h3>
              <button onClick={() => setEditTask(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-border-custom text-on-surface-variant transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="space-y-5">
                <div>
                  <label className="block text-[13px] font-semibold text-on-surface mb-1.5">Nama Tugas *</label>
                  <input type="text"
                    value={editForm.title}
                    onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full border border-border-custom rounded-xl px-4 py-2.5 text-[14px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 bg-background/50" />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-on-surface mb-1.5">Deskripsi Singkat</label>
                  <textarea rows={2}
                    value={editForm.description}
                    onChange={e => setEditForm({ ...editForm, description: e.target.value })}
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
                <button
                  onClick={handleSaveEdit}
                  disabled={isSavingEdit || !editForm.title.trim()}
                  className="w-full bg-primary text-white py-3 rounded-xl font-bold text-[15px] hover:bg-primary/90 transition-colors shadow-level-1 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSavingEdit ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="h-12" />
    </div>
  );
};

export default KalenderPage;
