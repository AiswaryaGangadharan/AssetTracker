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
  status: 'available' | 'assigned' | 'maintenance';
  date: string;
  notes?: string;
}

export interface DashboardStats {
  total_assets: number;
  employees: number;
  active_assets: number;
  department_assets: number;
  my_requests?: number;
}

export interface Request {
  id: string;
  user_id: number;
  asset_type: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
  user_name?: string;
}

export interface Issue {
  id: string;
  asset_id: string;
  user_id: number;
  description: string;
  severity: 'low' | 'medium' | 'high';
  status: 'open' | 'resolved';
  timestamp: string;
}

export interface ActivityLog {
  id: string;
  asset_id: string;
  action: string;
  user_id: number;
  timestamp: string;
  notes: string;
}
