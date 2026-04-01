export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  initials: string;
}

export interface Asset {
  id: string;
  name: string;
  type: string;
  assigned_to: number | null;
  assignee_name: string | null;
  assignee_initials: string | null;
  status: 'active' | 'inactive' | 'repair' | 'excellent';
  date: string;
  notes?: string;
}

export interface DashboardStats {
  total_assets: number;
  employees: number;
  active_assets: number;
  department_assets: number;
}