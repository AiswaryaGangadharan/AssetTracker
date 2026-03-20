export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  initials: string;
  token?: string;
}

