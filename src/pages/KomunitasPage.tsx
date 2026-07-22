import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

// UX Polish: skeleton loading state and empty group placeholder
// UX Polish: loading states verified
import WhatsAppIcon from '../components/ui/WhatsAppIcon';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import type { Task, Group as GroupType, GroupMember, GroupCreatePayload, GroupUpdatePayload, TaskCreatePayload, OutputType, LoadType, KanbanStatus } from '../types';
import TimePicker24 from '../components/ui/TimePicker24';

// ─── Types ──────────────────────────────────────────────────────────────────

interface KanbanTask {
  id: number;
  userId: number;
  title: string;
  assignee: string;
  avatarInitial: string;
  avatarColor: string;
  avatarUrl?: string | null;
  type: string;
  load: string;
  dueDate: string;
  status: KanbanStatus;
}

interface MemberDisplay {
  id: number;
  name: string;
  initial: string;
  color: string;
  avatarUrl?: string | null;
  role: 'ketua' | 'anggota';
  xp: number;
  tasksCompleted: number;
  waConnected: boolean;
}

interface GroupDisplay {
  id: number;
  name: string;
  subject: string;
  inviteCode: string;
  memberCount: number;
  createdBy: number;
  rawMembers: GroupMember[];
}

const kanbanCols: { id: KanbanStatus; label: string; icon: string; color: string }[] = [
  { id: 'todo',        label: 'To-Do',       icon: 'radio_button_unchecked', color: 'text-on-surface-variant' },
  { id: 'in_progress', label: 'In Progress',  icon: 'timelapse',              color: 'text-secondary' },
  { id: 'done',        label: 'Done',         icon: 'check_circle',           color: 'text-success' },
];

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

// ─── Sub-components ──────────────────────────────────────────────────────────

const KanbanCard: React.FC<{ task: KanbanTask; onMove: (id: number, dir: 'forward' | 'back') => void; onDelete?: (id: number) => void; isAuthorized: boolean }> = ({ task, onMove, onDelete, isAuthorized }) => {
  const canMoveForward = isAuthorized && task.status !== 'done';
  const canMoveBack    = isAuthorized && task.status !== 'todo';

  return (
    <div className="bg-white rounded-xl border border-border-custom p-4 shadow-level-1 hover:shadow-level-2 transition-all duration-200 group">
      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mb-2.5">
        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-primary/10 text-primary">{task.type}</span>
        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-border-custom text-on-surface-variant">{task.load}</span>
      </div>

      {/* Title */}
      <p className="text-[14px] font-semibold text-on-surface mb-3 leading-snug line-clamp-2"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {task.title}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 overflow-hidden"
            style={{ backgroundColor: task.avatarColor }}>
            {task.avatarUrl ? (
              <img src={task.avatarUrl} alt={task.assignee} className="w-full h-full object-cover" />
            ) : (
              task.avatarInitial
            )}
          </div>
          <span className="text-[11px] text-on-surface-variant truncate max-w-[80px]">{task.assignee.split(' ')[0]}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-on-surface-variant flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[13px]">schedule</span>
            {task.dueDate}
          </span>
        </div>
      </div>

      {/* Move buttons */}
      {isAuthorized && (
        <div className="flex gap-1.5 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
          {canMoveBack && (
            <button onClick={() => onMove(task.id, 'back')}
              className="flex-1 text-[11px] font-semibold py-1 rounded-lg border border-border-custom hover:bg-border-custom transition-colors text-on-surface-variant">
              ← Mundur
            </button>
          )}
          {canMoveForward && (
            <button onClick={() => onMove(task.id, 'forward')}
              className="flex-1 text-[11px] font-semibold py-1 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors">
              Maju →
            </button>
          )}
          {task.status === 'done' && onDelete && (
            <button onClick={() => onDelete(task.id)}
              className="flex-1 text-[11px] font-semibold py-1 rounded-lg bg-error/10 text-error hover:bg-error hover:text-white transition-colors">
              Arsipkan
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────────────

const KomunitasPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [tasks, setTasks]             = useState<KanbanTask[]>([]);
  const [groups, setGroups]           = useState<GroupDisplay[]>([]);
  const [activeGroup, setActiveGroup] = useState<GroupDisplay | null>(null);
  const [tab, setTab]                 = useState<'kanban' | 'members'>('kanban');
  const [showInvite, setShowInvite]   = useState(false);
  const [inviteInput, setInviteInput] = useState('');
  
  const [showCreate, setShowCreate]   = useState(false);
  const [createData, setCreateData]   = useState<GroupCreatePayload>({ name: '', subject: '' });
  const [loading, setLoading]         = useState(true);

  // Group options dropdown
  const [showGroupMenu, setShowGroupMenu] = useState(false);
  const groupMenuRef = useRef<HTMLDivElement>(null);

  // Edit group modal
  const [showEditGroup, setShowEditGroup] = useState(false);
  const [editGroupData, setEditGroupData] = useState<GroupUpdatePayload>({ name: '', subject: '' });
  const [isSavingGroup, setIsSavingGroup] = useState(false);

  // Add group task modal
  const [showAddTask, setShowAddTask] = useState(false);
  const [groupTaskForm, setGroupTaskForm] = useState<TaskCreatePayload>({
    title: '',
    description: '',
    deadline: '',
    output_type: 'Komunitas',
    load_type: 'Ringan',
    involvement_type: 'Kelompok',
    assign_to_all: false,
  });
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (groupMenuRef.current && !groupMenuRef.current.contains(e.target as Node)) {
        setShowGroupMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await api.get('/groups');
      const loadedGroups: GroupDisplay[] = response.data.map((g: GroupType) => ({
        id: g.id,
        name: g.name,
        subject: g.subject || 'Umum',
        inviteCode: g.invite_code,
        memberCount: g.members ? g.members.length : 0,
        createdBy: g.created_by,
        rawMembers: g.members || [],
      }));
      setGroups(loadedGroups);
      if (loadedGroups.length > 0 && !activeGroup) {
        setActiveGroup(loadedGroups[0]);
      } else if (activeGroup) {
        // Refresh active group data
        const updated = loadedGroups.find(g => g.id === activeGroup.id);
        if (updated) setActiveGroup(updated);
        else if (loadedGroups.length > 0) setActiveGroup(loadedGroups[0]);
        else setActiveGroup(null);
      }
    } catch (e) {
      console.error("Gagal load grup", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroupTasks = async (groupId: number) => {
    try {
      const response = await api.get(`/tasks?group_id=${groupId}`);
      const data: Task[] = response.data.data || response.data;
      const loadedTasks: KanbanTask[] = data.map((t) => {
        const userName = t.user?.name || 'Anggota';
        // Simple consistent color based on name length/char
        const colors = ['#076559', '#6CA8A5', '#B5DBD9', '#14C97A', '#635C5D'];
        const colorIdx = userName.length % colors.length;
        
        // Build avatar_url: backend appends it on full model load but not on eager-load select.
        // Fallback: build URL from avatar filename if avatar_url not present.
        const avatarUrl = t.user?.avatar_url || (t.user?.avatar ? `http://localhost:8000/storage/avatars/${t.user.avatar}` : null);
        return {
          id: t.id,
          userId: t.user_id,
          title: t.title,
          assignee: userName,
          avatarInitial: userName.charAt(0).toUpperCase(),
          avatarColor: colors[colorIdx],
          avatarUrl,
          type: t.output_type,
          load: t.load_type,
          dueDate: new Date(t.deadline).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }),
          status: (t.status === 'overdue' ? 'todo' : t.status) as KanbanStatus,
        };
      });
      setTasks(loadedTasks);
    } catch (e) {
      console.error("Gagal load tasks", e);
    }
  };

  useEffect(() => {
    if (activeGroup) {
      fetchGroupTasks(activeGroup.id);
    }
  }, [activeGroup]);

  const handleCreate = async () => {
    if (!createData.name.trim()) return;
    try {
      await api.post('/groups', createData);
      setShowCreate(false);
      setCreateData({ name: '', subject: '' });
      fetchGroups();
    } catch (e) {
      alert("Gagal membuat grup");
    }
  };

  const handleJoin = async () => {
    if (!inviteInput.trim()) return;
    try {
      await api.post('/groups/join', { invite_code: inviteInput });
      setShowInvite(false);
      setInviteInput('');
      fetchGroups();
    } catch (e) {
      alert("Gagal bergabung grup. Pastikan kode benar.");
    }
  };

  const moveTask = async (id: number, dir: 'forward' | 'back') => {
    const order: KanbanStatus[] = ['todo', 'in_progress', 'done'];
    const currentTask = tasks.find(t => t.id === id);
    if (!currentTask) return;
    
    const idx = order.indexOf(currentTask.status);
    const newIdx = dir === 'forward' ? Math.min(idx + 1, 2) : Math.max(idx - 1, 0);
    const newStatus = order[newIdx];

    // Optimistic UI update
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      return { ...t, status: newStatus };
    }));

    // API update
    try {
      if (newStatus === 'done') {
        await api.post(`/tasks/${id}/done`);
      } else {
        await api.patch(`/tasks/${id}`, { status: newStatus });
      }
      await refreshUser(); // Update XP points globally
    } catch (e) {
      console.error("Gagal update status task", e);
      // Revert if failed
      setTasks(prev => prev.map(t => {
        if (t.id !== id) return t;
        return { ...t, status: currentTask.status };
      }));
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    const confirmDelete = window.confirm("Arsipkan tugas ini? Tugas akan dihilangkan dari papan Kanban.");
    if (!confirmDelete) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (e) {
      console.error(e);
      alert("Gagal mengarsipkan tugas.");
    }
  };

  // ── Group management handlers ──
  const handleEditGroup = async () => {
    if (!activeGroup) return;
    setIsSavingGroup(true);
    try {
      await api.put(`/groups/${activeGroup.id}`, editGroupData);
      setShowEditGroup(false);
      await fetchGroups();
    } catch (e) {
      alert("Gagal mengedit grup.");
    } finally {
      setIsSavingGroup(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!activeGroup) return;
    if (!window.confirm(`Yakin ingin menghapus grup "${activeGroup.name}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    try {
      await api.delete(`/groups/${activeGroup.id}`);
      setActiveGroup(null);
      setShowGroupMenu(false);
      await fetchGroups();
    } catch (e) {
      alert("Gagal menghapus grup.");
    }
  };

  const handleLeaveGroup = async () => {
    if (!activeGroup) return;
    if (!window.confirm(`Yakin ingin keluar dari grup "${activeGroup.name}"?`)) return;
    try {
      await api.post(`/groups/${activeGroup.id}/leave`);
      setActiveGroup(null);
      setShowGroupMenu(false);
      await fetchGroups();
    } catch (e: unknown) {
      const errorMsg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || "Gagal keluar dari grup.";
      alert(errorMsg);
    }
  };

  const handleRemoveMember = async (memberId: number, memberName: string) => {
    if (!activeGroup) return;
    if (!window.confirm(`Yakin ingin mengeluarkan ${memberName} dari grup?`)) return;
    try {
      await api.delete(`/groups/${activeGroup.id}/members/${memberId}`);
      await fetchGroups();
    } catch (e: unknown) {
      const errorMsg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || "Gagal mengeluarkan anggota.";
      alert(errorMsg);
    }
  };

  const handleAddGroupTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGroup) return;
    setIsAddingTask(true);
    try {
      await api.post('/tasks', { ...groupTaskForm, group_id: activeGroup.id });
      setShowAddTask(false);
      setGroupTaskForm({
        title: '',
        description: '',
        deadline: '',
        output_type: 'Komunitas',
        load_type: 'Ringan',
        involvement_type: 'Kelompok',
        assign_to_all: false,
        assigned_to: user?.id,
      });
      fetchGroupTasks(activeGroup.id);
    } catch (error) {
      alert("Gagal menambah tugas grup.");
    } finally {
      setIsAddingTask(false);
    }
  };

  const isKetua = user && activeGroup ? activeGroup.createdBy === user.id : false;

  const activeMembers: MemberDisplay[] = activeGroup?.rawMembers?.map((m, i) => ({
    id: m.id,
    name: m.name,
    initial: m.name.charAt(0).toUpperCase(),
    color: ['#076559', '#6CA8A5', '#B5DBD9', '#14C97A', '#635C5D'][i % 5],
    avatarUrl: m.avatar_url,
    role: m.pivot.role,
    xp: m.xp_points || 0,
    tasksCompleted: m.tasks_completed ?? 0,
    waConnected: m.wa_connected,
  })) || [];

  const handleCopyInvite = () => {
    if (activeGroup) {
      navigator.clipboard.writeText(activeGroup.inviteCode);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-[40px] font-bold leading-tight tracking-tight text-primary mb-2"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Komunitas & Grup
          </h2>
          <p className="text-[18px] text-on-surface-variant">Kolaborasi, pantau progress, dan raih lebih banyak XP bersama.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowInvite(true)}
            className="px-4 py-2.5 border-2 border-primary text-primary rounded-xl text-[14px] font-semibold hover:bg-primary/10 transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">link</span>
            Gabung Grup
          </button>
          <button onClick={() => setShowCreate(true)} className="px-4 py-2.5 bg-primary text-white rounded-xl text-[14px] font-semibold hover:bg-primary/90 transition-colors shadow-level-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Buat Grup
          </button>
        </div>
      </header>

      {/* Create Group modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-level-2 p-6 w-full max-w-sm">
            <h3 className="text-[20px] font-bold text-primary mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Buat Grup Baru
            </h3>
            <input value={createData.name} onChange={e => setCreateData({ ...createData, name: e.target.value })}
              placeholder="Nama Grup"
              className="w-full border border-border-custom rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/40 mb-3" />
            <input value={createData.subject || ''} onChange={e => setCreateData({ ...createData, subject: e.target.value })}
              placeholder="Mata Kuliah / Subjek"
              className="w-full border border-border-custom rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/40 mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setShowCreate(false)}
                className="flex-1 py-2.5 border border-border-custom rounded-xl text-[14px] font-semibold text-on-surface-variant hover:bg-border-custom transition-colors">
                Batal
              </button>
              <button onClick={handleCreate} className="flex-1 py-2.5 bg-primary text-white rounded-xl text-[14px] font-semibold hover:bg-primary/90 transition-colors">
                Buat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join via invite code modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-level-2 p-6 w-full max-w-sm">
            <h3 className="text-[20px] font-bold text-primary mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Gabung dengan Kode Invite
            </h3>
            <input value={inviteInput} onChange={e => setInviteInput(e.target.value)}
              placeholder="Contoh: SO-X7K2"
              className="w-full border border-border-custom rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/40 mb-4 text-center tracking-[0.2em] uppercase font-mono" />
            <div className="flex gap-3">
              <button onClick={() => setShowInvite(false)}
                className="flex-1 py-2.5 border border-border-custom rounded-xl text-[14px] font-semibold text-on-surface-variant hover:bg-border-custom transition-colors">
                Batal
              </button>
              <button onClick={handleJoin} className="flex-1 py-2.5 bg-primary text-white rounded-xl text-[14px] font-semibold hover:bg-primary/90 transition-colors">
                Gabung
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Group modal */}
      {showEditGroup && activeGroup && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-level-2 p-6 w-full max-w-sm">
            <h3 className="text-[20px] font-bold text-primary mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Edit Grup
            </h3>
            <input value={editGroupData.name || ''} onChange={e => setEditGroupData({ ...editGroupData, name: e.target.value })}
              placeholder="Nama Grup"
              className="w-full border border-border-custom rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/40 mb-3" />
            <input value={editGroupData.subject || ''} onChange={e => setEditGroupData({ ...editGroupData, subject: e.target.value })}
              placeholder="Mata Kuliah / Subjek"
              className="w-full border border-border-custom rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/40 mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setShowEditGroup(false)}
                className="flex-1 py-2.5 border border-border-custom rounded-xl text-[14px] font-semibold text-on-surface-variant hover:bg-border-custom transition-colors">
                Batal
              </button>
              <button onClick={handleEditGroup} disabled={isSavingGroup}
                className="flex-1 py-2.5 bg-primary text-white rounded-xl text-[14px] font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
                {isSavingGroup ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Group Task modal */}
      {showAddTask && activeGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-level-2 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-border-custom flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-[20px] font-bold text-primary" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Tambah Tugas Grup — {activeGroup.name}
              </h3>
              <button onClick={() => setShowAddTask(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-border-custom text-on-surface-variant transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <form onSubmit={handleAddGroupTask} className="p-6 overflow-y-auto">
              <div className="space-y-5">
                <div>
                  <label className="block text-[13px] font-semibold text-on-surface mb-1.5">Nama Tugas *</label>
                  <input required type="text"
                    value={groupTaskForm.title} onChange={e => setGroupTaskForm({ ...groupTaskForm, title: e.target.value })}
                    placeholder="Contoh: Buat slide presentasi"
                    className="w-full border border-border-custom rounded-xl px-4 py-2.5 text-[14px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 bg-background/50" />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-on-surface mb-1.5">Deskripsi Singkat</label>
                  <textarea rows={2}
                    value={groupTaskForm.description} onChange={e => setGroupTaskForm({ ...groupTaskForm, description: e.target.value })}
                    className="w-full border border-border-custom rounded-xl px-4 py-2.5 text-[14px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 bg-background/50" />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-[13px] font-semibold text-on-surface mb-1.5">Tanggal Tenggat *</label>
                    <input required type="date" 
                      min={getLocalISODate()}
                      value={groupTaskForm.deadline ? groupTaskForm.deadline.split('T')[0] : ''}
                      onChange={e => {
                        const date = e.target.value;
                        const time = (groupTaskForm.deadline && groupTaskForm.deadline.includes('T')) ? groupTaskForm.deadline.split('T')[1].substring(0,5) : (date === getLocalISODate() ? getLocalISOTime() : '23:59');
                        setGroupTaskForm({...groupTaskForm, deadline: date ? `${date}T${time}` : ''});
                      }}
                      className="w-full border border-border-custom rounded-xl px-4 py-2.5 text-[14px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 bg-background/50" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[13px] font-semibold text-on-surface mb-1.5">Jam *</label>
                    <TimePicker24
                      required={true}
                      min={(groupTaskForm.deadline && groupTaskForm.deadline.startsWith(getLocalISODate())) ? getLocalISOTime() : undefined}
                      value={(groupTaskForm.deadline && groupTaskForm.deadline.includes('T')) ? groupTaskForm.deadline.split('T')[1].substring(0,5) : ''}
                      onChange={time => {
                        const date = (groupTaskForm.deadline && groupTaskForm.deadline.includes('T')) ? groupTaskForm.deadline.split('T')[0] : getLocalISODate();
                        setGroupTaskForm({...groupTaskForm, deadline: `${date}T${time}`});
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
                          onClick={() => setGroupTaskForm({...groupTaskForm, load_type: t})}
                          className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-colors border ${
                            groupTaskForm.load_type === t 
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
                <button type="submit" disabled={isAddingTask}
                  className="w-full bg-primary text-white py-3 rounded-xl font-bold text-[15px] hover:bg-primary/90 transition-colors shadow-level-1 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isAddingTask ? 'Menyimpan...' : 'Tambah Tugas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center p-8 text-on-surface-variant">Memuat komunitas...</div>
      ) : groups.length === 0 ? (
        <div className="text-center p-12 border-2 border-dashed border-border-custom rounded-xl text-on-surface-variant">
          Anda belum memiliki grup. Buat atau gabung ke grup untuk memulai!
        </div>
      ) : activeGroup ? (
      <div className="grid grid-cols-12 gap-6">
        {/* Group list sidebar */}
        <div className="col-span-12 lg:col-span-3">
          <div className="bg-white rounded-2xl border border-border-custom shadow-level-1 p-4">
            <h4 className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wider mb-3 px-1">Grupku</h4>
            <div className="flex flex-col gap-2">
              {groups.filter(g => {
                if (!searchQuery) return true;
                const lowerQ = searchQuery.toLowerCase();
                return g.name.toLowerCase().includes(lowerQ) || g.subject.toLowerCase().includes(lowerQ);
              }).map(g => (
                <button key={g.id} onClick={() => setActiveGroup(g)}
                  className={`w-full text-left p-3 rounded-xl transition-all duration-150 ${
                    activeGroup.id === g.id ? 'bg-primary text-white shadow-level-1' : 'hover:bg-border-custom text-on-surface'
                  }`}>
                  <p className={`text-[14px] font-semibold leading-tight mb-0.5 ${activeGroup.id === g.id ? 'text-white' : 'text-on-surface'}`}>
                    {g.name}
                  </p>
                  <p className={`text-[11px] ${activeGroup.id === g.id ? 'text-white/70' : 'text-on-surface-variant'}`}>
                    {g.subject} · {g.memberCount} anggota
                  </p>
                </button>
              ))}
            </div>

            {/* Invite code display */}
            <div className="mt-4 p-3 bg-border-custom/40 rounded-xl">
              <p className="text-[11px] text-on-surface-variant font-semibold mb-1">Kode Invite Grupmu:</p>
              <div className="flex items-center justify-between">
                <span className="text-[16px] font-bold text-primary tracking-widest font-mono">{activeGroup.inviteCode}</span>
                <button onClick={handleCopyInvite} className="p-1 hover:bg-border-custom rounded-lg transition-colors">
                  <span className="material-symbols-outlined text-[16px] text-on-surface-variant">content_copy</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="col-span-12 lg:col-span-9">
          {/* Group header */}
          <div className="bg-white rounded-2xl border border-border-custom shadow-level-1 p-5 mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-[22px] font-bold text-primary" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {activeGroup.name}
              </h3>
              <p className="text-[13px] text-on-surface-variant">{activeGroup.subject} · {activeGroup.memberCount} anggota</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Tab switcher */}
              <div className="flex bg-border-custom/50 rounded-xl p-1 gap-1">
                {(['kanban', 'members'] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all ${
                      tab === t ? 'bg-white text-primary shadow-level-1' : 'text-on-surface-variant hover:text-on-surface'
                    }`}>
                    {t === 'kanban' ? <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">view_kanban</span> Kanban</span> : <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">group</span> Anggota</span>}
                  </button>
                ))}
              </div>

              {/* Group options menu */}
              <div className="relative" ref={groupMenuRef}>
                <button
                  onClick={() => setShowGroupMenu(!showGroupMenu)}
                  className="p-2 rounded-xl hover:bg-border-custom transition-colors text-on-surface-variant"
                >
                  <span className="material-symbols-outlined text-[20px]">more_vert</span>
                </button>
                {showGroupMenu && (
                  <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl border border-border-custom shadow-level-2 py-1 z-10">
                    {isKetua && (
                      <button
                        onClick={() => {
                          setEditGroupData({ name: activeGroup.name, subject: activeGroup.subject });
                          setShowEditGroup(true);
                          setShowGroupMenu(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-on-surface hover:bg-border-custom/50 flex items-center gap-2 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                        Edit Grup
                      </button>
                    )}
                    {!isKetua && (
                      <button
                        onClick={() => { setShowGroupMenu(false); handleLeaveGroup(); }}
                        className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-on-surface-variant hover:bg-border-custom/50 flex items-center gap-2 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">logout</span>
                        Keluar Grup
                      </button>
                    )}
                    {isKetua && (
                      <button
                        onClick={() => { setShowGroupMenu(false); handleDeleteGroup(); }}
                        className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-error hover:bg-error/5 flex items-center gap-2 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                        Hapus Grup
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Kanban Board ── */}
          {tab === 'kanban' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {kanbanCols.map(col => {
                const colTasks = tasks.filter(t => t.status === col.id);
                return (
                  <div key={col.id} className="bg-white rounded-2xl border border-border-custom shadow-level-1 p-4">
                    {/* Column header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className={`material-symbols-outlined text-[18px] icon-fill ${col.color}`}>{col.icon}</span>
                        <h4 className="text-[15px] font-bold text-on-surface">{col.label}</h4>
                      </div>
                      <span className="w-6 h-6 rounded-full bg-border-custom flex items-center justify-center text-[12px] font-bold text-on-surface-variant">
                        {colTasks.length}
                      </span>
                    </div>

                    <div className="flex flex-col gap-3 min-h-[120px]">
                      {colTasks.map(task => (
                        <KanbanCard key={task.id} task={task} onMove={moveTask} onDelete={handleDeleteTask} isAuthorized={isKetua || task.userId === user?.id} />
                      ))}
                      {colTasks.length === 0 && (
                        <div className="flex-1 flex items-center justify-center border-2 border-dashed border-border-custom rounded-xl h-24 text-[12px] text-on-surface-variant">
                          Tidak ada tugas
                        </div>
                      )}
                    </div>

                    {col.id === 'todo' && (
                      <button
                        onClick={() => setShowAddTask(true)}
                        className="mt-3 w-full border-2 border-dashed border-border-custom rounded-xl p-2 text-[12px] text-on-surface-variant hover:border-primary/40 hover:text-primary transition-colors flex items-center justify-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[15px]">add</span>
                        Tambah tugas
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Members Tab ── */}
          {tab === 'members' && (
            <div className="bg-white rounded-2xl border border-border-custom shadow-level-1 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-custom bg-background">
                    <th className="text-left px-5 py-3 text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">Anggota</th>
                    <th className="text-left px-5 py-3 text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider hidden md:table-cell">Role</th>
                    <th className="text-right px-5 py-3 text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">XP</th>
                    <th className="text-right px-5 py-3 text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider hidden sm:table-cell">Tugas Selesai</th>
                    <th className="text-center px-5 py-3 text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">WA</th>
                    {isKetua && <th className="text-right px-5 py-3 text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">Aksi</th>}
                  </tr>
                </thead>
                <tbody>
                  {activeMembers.map((m, i) => (
                    <tr key={m.id}
                      className={`border-b border-border-custom last:border-0 hover:bg-background transition-colors ${i === 0 ? 'bg-primary/3' : ''}`}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0 overflow-hidden"
                            style={{ backgroundColor: m.color }}>
                            {m.avatarUrl ? (
                              <img src={m.avatarUrl} alt={m.name} className="w-full h-full object-cover" />
                            ) : (
                              m.initial
                            )}
                          </div>
                          <div>
                            <p className="text-[14px] font-semibold text-on-surface">{m.name}</p>
                            {m.role === 'ketua' && (
                              <p className="text-[11px] text-primary font-semibold flex items-center justify-center gap-1"><span className="material-symbols-outlined text-[14px]">stars</span> Ketua</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          m.role === 'ketua' ? 'bg-primary/10 text-primary' : 'bg-border-custom text-on-surface-variant'
                        }`}>
                          {m.role === 'ketua' ? 'Ketua' : 'Anggota'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className="text-[14px] font-bold text-primary">{m.xp.toLocaleString()}</span>
                        <span className="text-[11px] text-on-surface-variant ml-1">XP</span>
                      </td>
                      <td className="px-5 py-3.5 text-right hidden sm:table-cell">
                        <span className="text-[14px] font-semibold text-on-surface">{m.tasksCompleted}</span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {m.waConnected ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 bg-success/10 rounded-full">
                            <WhatsAppIcon className="w-4 h-4 fill-success" />
                          </span>
                        ) : (
                          <span className="text-[11px] text-on-surface-variant">—</span>
                        )}
                      </td>
                      {isKetua && (
                        <td className="px-5 py-3.5 text-right">
                          {m.role !== 'ketua' && (
                            <button onClick={() => handleRemoveMember(m.id, m.name)} className="px-3 py-1.5 bg-error/10 text-error hover:bg-error/20 rounded-lg text-[11px] font-semibold transition-colors">
                              Keluarkan
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      ) : null}
      <div className="h-12" />
    </div>
  );
};

export default KomunitasPage;
