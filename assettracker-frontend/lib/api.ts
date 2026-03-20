const API_BASE = 'http://localhost:8000';

export async function login(username: string, password: string) {
  const response = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  
  if (!response.ok) throw new Error('Login failed');
  
  const data = await response.json();
  localStorage.setItem('token', data.access_token);
  localStorage.setItem('role', data.role);
  return data;
}

export async function getAssets(token: string) {
  const response = await fetch(`${API_BASE}/assets`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!response.ok) throw new Error('Failed to fetch assets');
  
  return response.json();
}

export async function getDashboard(token: string) {
  const response = await fetch(`${API_BASE}/dashboard`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!response.ok) throw new Error('Failed to fetch dashboard');
  
  return response.json();
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
}

export function getToken() {
  return localStorage.getItem('token');
}

