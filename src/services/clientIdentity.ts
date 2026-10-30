// Client and Browser identification for daily rate limiting
const BROWSER_ID_STORAGE_KEY = 'truthguard_browser_id';

export function getBrowserId(): string {
  if (typeof window === 'undefined') return 'unknown_browser';
  try {
    let id = localStorage.getItem(BROWSER_ID_STORAGE_KEY);
    if (!id || id.length < 8) {
      id = 'b_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 12);
      localStorage.setItem(BROWSER_ID_STORAGE_KEY, id);
    }
    return id;
  } catch {
    return 'fallback_browser';
  }
}
