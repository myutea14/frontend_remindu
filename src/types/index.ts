// ─── Core Domain Types for Remind.u ──────────────────────────────────────────

export interface User {
  id: number;
  name: string;
  email: string;
  phone_wa: string | null;
  wa_connected: boolean;
  xp_points: number;
  level: number;
  extreme_mode: boolean;
  role: string;
  avatar?: string | null;
  avatar_url?: string | null;
}

export interface Task {
  id: number;
  user_id: number;
  group_id: number | null;
  title: string;
  description: string | null;
  output_type: OutputType;
  load_type: LoadType;
  involvement_type: InvolvementType;
  status: TaskStatus;
  kanban_column: KanbanStatus | null;
  kanban_order: number | null;
  deadline: string;
  is_zona_merah: boolean;
  xp_reward: number;
  wa_notif_enabled: boolean;
  last_wa_notif_sent_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  group?: { id: number; name: string } | null;
  user?: { id: number; name: string } | null;
}

export type OutputType = 'Tugas' | 'Kuis / Ujian' | 'Organisasi' | 'Pribadi';
export type LoadType = 'Ringan' | 'Sedang' | 'Berat';
export type InvolvementType = 'Pribadi' | 'Kelompok';
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'overdue';
export type KanbanStatus = 'todo' | 'in_progress' | 'done';

export interface TaskCreatePayload {
  title: string;
  description?: string;
  output_type: OutputType;
  load_type: LoadType;
  involvement_type: InvolvementType;
  deadline: string;
  group_id?: number | null;
  xp_reward?: number;
  wa_notif_enabled?: boolean;
  assigned_to?: number;
  assign_to_all?: boolean;
}

export interface TaskUpdatePayload {
  title?: string;
  description?: string | null;
  output_type?: OutputType;
  load_type?: LoadType;
  involvement_type?: InvolvementType;
  status?: TaskStatus;
  kanban_column?: KanbanStatus;
  deadline?: string;
  wa_notif_enabled?: boolean;
}

// ─── Group ───────────────────────────────────────────────────────────────────

export interface GroupMember {
  id: number;
  name: string;
  xp_points: number;
  wa_connected: boolean;
  level: number;
  tasks_completed: number;
  avatar?: string | null;
  avatar_url?: string | null;
  pivot: {
    role: 'ketua' | 'anggota';
    joined_at: string | null;
  };
}

export interface Group {
  id: number;
  name: string;
  description: string | null;
  subject: string | null;
  invite_code: string;
  created_by: number;
  members: GroupMember[];
  created_at: string;
  updated_at: string;
}

export interface GroupCreatePayload {
  name: string;
  description?: string;
  subject?: string;
}

export interface GroupUpdatePayload {
  name?: string;
  description?: string;
  subject?: string;
}

// ─── Achievement ─────────────────────────────────────────────────────────────

export interface Achievement {
  id: number;
  icon: string;
  label: string;
  desc: string;
  earned: boolean;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface DashboardStats {
  total_tasks_completed: number;
  total_xp: string;
  active_groups: number;
  focus_hours: number;
  streak_days: number;
}

export interface DashboardData {
  user: {
    name: string;
    xp_points: number;
    level: number;
    wa_connected: boolean;
    extreme_mode: boolean;
  };
  stats: DashboardStats;
  achievements: Achievement[];
  zona_merah_count: number;
  active_tasks: Task[];
  recent_xp: XpLog[];
  focus_score: number;
  focus_score_trend: number;
}

// ─── XP Log ──────────────────────────────────────────────────────────────────

export interface XpLog {
  id: number;
  user_id: number;
  task_id: number | null;
  xp_amount: number;
  reason: string;
  description?: string;
  level_at_event: number;
  points?: number;
  created_at: string;
  task?: { id: number; output_type: OutputType; load_type: LoadType; group_id?: number | null } | null;
}

// ─── Paginated Response ──────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// ─── Profile Update ──────────────────────────────────────────────────────────

export interface ProfileUpdatePayload {
  name?: string;
  phone_wa?: string | null;
  extreme_mode?: boolean;
}

// ─── Notifications & Chat ────────────────────────────────────────────────────

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  action_url: string | null;
  created_at: string;
}

export interface GroupMessage {
  id: number;
  group_id: number;
  user_id: number;
  message: string;
  created_at: string;
  user?: {
    id: number;
    name: string;
    avatar?: string | null;
    avatar_url?: string | null;
  };
}

export interface SearchResult {
  tasks: Task[];
  groups: Group[];
}
