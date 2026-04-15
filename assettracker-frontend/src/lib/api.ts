import api from './axios';

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  try {
    const response = await api({
      url: endpoint,
      ...options,
    });
    return response.data;
  } catch (error: any) {
    const detail = error.response?.data?.detail || error.message || 'Unknown error';
    throw new Error(detail);
  }
}

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'employee';
  department?: string;
}) {
  return fetchWithAuth('/api/auth/register', {
    method: 'POST',
    data,
  });
}

export async function loginUser(data: {
  email: string;
  password: string;
}) {
  return fetchWithAuth('/api/auth/login', {
    method: 'POST',
    data,
  });
}

export async function getAssets() {
  return fetchWithAuth('/api/assets');
}

export async function getDashboard() {
  return fetchWithAuth('/api/dashboard');
}

export async function deleteAsset(assetId: string) {
  return fetchWithAuth(`/api/assets/${assetId}`, {
    method: 'DELETE',
  });
}

export async function createAsset(asset: unknown) {
  return fetchWithAuth('/api/assets', {
    method: 'POST',
    data: asset,
  });
}

export async function assignAsset(assetId: string, data: { user_id: number }) {
  return fetchWithAuth(`/api/assets/${assetId}/assign`, {
    method: 'POST',
    data,
  });
}

export async function revokeAsset(assetId: string) {
  return fetchWithAuth(`/api/assets/${assetId}/revoke`, {
    method: 'POST',
  });
}

export async function requestAsset(data: { asset_type: string, reason: string }) {
  return fetchWithAuth('/api/requests', {
    method: 'POST',
    data,
  });
}

export async function getRequests() {
  return fetchWithAuth('/api/requests');
}

export async function approveRequest(requestId: string) {
  return fetchWithAuth(`/api/requests/${requestId}/approve`, {
    method: 'POST',
  });
}

export async function rejectRequest(requestId: string) {
  return fetchWithAuth(`/api/requests/${requestId}/reject`, {
    method: 'POST',
  });
}

export async function getAssetActivity(assetId: string) {
  return fetchWithAuth(`/api/activity/${assetId}`);
}

export async function getUsers() {
  return fetchWithAuth('/api/users');
}

export async function getIssues() {
  return fetchWithAuth('/api/issues');
}

export async function createIssue(data: { asset_id: string, description: string, severity: string }) {
  return fetchWithAuth('/api/issues', {
    method: 'POST',
    data,
  });
}

export async function resolveIssue(issueId: string) {
  return fetchWithAuth(`/api/issues/${issueId}/resolve`, { method: 'POST' });
}


