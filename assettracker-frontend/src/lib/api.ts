const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function fetchWithAuth(endpoint: string, token: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function getAssets(token: string) {
  return fetchWithAuth('/api/assets', token);
}

export async function getAllAssets(token: string) {
  return fetchWithAuth('/api/assets/all', token);
}

export async function getDashboard(token: string) {
  return fetchWithAuth('/api/dashboard', token);
}

export async function deleteAsset(token: string, assetId: string) {
  return fetchWithAuth(`/api/assets/${assetId}`, token, {
    method: 'DELETE',
  });
}

export async function createAsset(token: string, asset: any) {
  return fetchWithAuth('/api/assets', token, {
    method: 'POST',
    body: JSON.stringify(asset),
  });
}

export async function getUsers(token: string) {
  return fetchWithAuth('/api/users', token);
}