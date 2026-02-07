type SyncResponse = {
  data: any | null;
  lastUpdated: number | null;
};

const getDefaultApiUrl = () => {
  if (typeof window === 'undefined') return '';
  const { protocol, hostname } = window.location;
  if (!hostname) return '';
  return `${protocol}//${hostname}:8787`;
};

const API_URL = (import.meta as any).env?.VITE_SYNC_API_URL || getDefaultApiUrl();

const normalizeBaseUrl = (value: string) => value.replace(/\/$/, '');

const buildUrl = (familyId: string) => {
  const base = normalizeBaseUrl(API_URL);
  return `${base}/api/sync?familyId=${encodeURIComponent(familyId)}`;
};

const buildHeaders = (password?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (password) headers['x-sync-pass'] = password;
  return headers;
};

const isConfigured = () => Boolean(API_URL && API_URL.trim().length > 0);

const loadData = async (familyId: string, password?: string): Promise<SyncResponse> => {
  const response = await fetch(buildUrl(familyId), {
    headers: buildHeaders(password)
  });
  if (response.status === 401) {
    throw new Error('sync_auth_failed');
  }
  if (!response.ok) {
    throw new Error('sync_load_failed');
  }
  return response.json();
};

const saveData = async (familyId: string, payload: any, password?: string) => {
  const response = await fetch(buildUrl(familyId), {
    method: 'POST',
    headers: buildHeaders(password),
    body: JSON.stringify({
      data: payload,
      lastUpdated: payload?.lastUpdated ?? Date.now()
    })
  });
  if (response.status === 401) {
    throw new Error('sync_auth_failed');
  }
  if (response.status === 409) {
    const json = await response.json();
    const error = new Error('sync_conflict');
    (error as any).server = json;
    throw error;
  }
  if (!response.ok) {
    throw new Error('sync_save_failed');
  }
  return response.json();
};

const generateFamilyId = () => {
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
};

export const syncService = {
  isConfigured,
  loadData,
  saveData,
  generateFamilyId,
  getApiUrl: () => API_URL
};