import api from './axios';

async function fetchWithAuth(endpoint: string, options: any = {}) {
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

export async function getAssets(token: string) {
  return fetchWithAuth('/api/assets');
}

export async function getAllAssets(token: string) {
  return fetchWithAuth('/api/assets/all');
}

export async function getDashboard(token: string) {
  return fetchWithAuth('/api/dashboard');
}

export async function deleteAsset(token: string, assetId: string) {
  return fetchWithAuth(`/api/assets/${assetId}`, {
    method: 'DELETE',
  });
}

export async function createAsset(token: string, asset: any) {
  return fetchWithAuth('/api/assets', {
    method: 'POST',
    data: asset,
  });
}

export async function assignAsset(token: string, assetId: string, data: { user_id: number, user_name: string, user_initials: string }) {
  return fetchWithAuth(`/api/assets/${assetId}/assign`, {
    method: 'POST',
    data,
  });
}

export async function revokeAsset(token: string, assetId: string) {
  return fetchWithAuth(`/api/assets/${assetId}/revoke`, {
    method: 'POST',
  });
}

export async function requestAsset(token: string, data: { type: string, reason: string }) {
  return fetchWithAuth('/api/requests', {
    method: 'POST',
    data,
  });
}

export async function getRequests(token: string) {
  return fetchWithAuth('/api/requests');
}

export async function approveRequest(token: string, requestId: string) {
  return fetchWithAuth(`/api/requests/${requestId}/approve`, {
    method: 'POST',
  });
}

export async function rejectRequest(token: string, requestId: string) {
  return fetchWithAuth(`/api/requests/${requestId}/reject`, {
    method: 'POST',
  });
}

export async function getAssetActivity(token: string, assetId: string) {
  return fetchWithAuth(`/api/activity/${assetId}`);
}

export async function getUsers(token: string) {
  return fetchWithAuth('/api/users');
}