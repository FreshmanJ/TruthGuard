import { getBrowserId } from './clientIdentity';

export interface QuotaDetail {
  used: number;
  limit: number;
  remaining: number;
}

export interface QuotaInfo {
  date: string;
  search: QuotaDetail;
  ai: QuotaDetail;
}

export async function fetchQuotaUsage(): Promise<QuotaInfo> {
  const browserId = getBrowserId();
  try {
    const res = await fetch('/api/quota', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Client-Id': browserId,
        'X-Browser-Id': browserId,
      },
    });

    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('Failed to fetch quota from server:', err);
  }

  return {
    date: new Date().toISOString().slice(0, 10),
    search: { used: 0, limit: 120, remaining: 120 },
    ai: { used: 0, limit: 300, remaining: 300 },
  };
}
