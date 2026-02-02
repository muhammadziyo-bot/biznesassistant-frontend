export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to: number;
  created_by: number;
  created_at: string;
  updated_at: string;
  due_date: string | null;
  completed_at: string | null;
}

export interface TaskUser {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: string;
}

export interface TaskFormData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to: number;
  due_date: string;
}

export interface TaskFilters {
  status?: string;
  priority?: string;
  assigned_to?: number;
  search?: string;
}
