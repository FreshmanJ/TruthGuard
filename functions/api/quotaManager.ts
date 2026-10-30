export interface KVLike {
  get(key: string, type?: string): Promise<any>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<any>;
}

interface UserQuotaRecord {
  id: string;
  ips: Set<string>;
  browserIds: Set<string>;
  searchCount: number;
  aiCount: number;
  lastAccess: number;
}

export class DailyQuotaManager {
  private SEARCH_LIMIT = 120;
  private AI_LIMIT = 300;
  private dateStr = '';
  private records = new Map<string, UserQuotaRecord>();
  private ipToRecordId = new Map<string, string>();
  private browserToRecordId = new Map<string, string>();

  private getTodayDate(): string {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const cst = new Date(utc + 8 * 3600000); // UTC+8 China Standard Time
    return cst.toISOString().slice(0, 10);
  }

  private checkDateReset() {
    const today = this.getTodayDate();
    if (this.dateStr !== today) {
      this.dateStr = today;
      this.records.clear();
      this.ipToRecordId.clear();
      this.browserToRecordId.clear();
    }
  }

  public getOrCreateUser(ip: string, browserId: string): UserQuotaRecord {
    this.checkDateReset();
    const cleanIp = (ip || '127.0.0.1').trim();
    const cleanBrowser = (browserId || 'default_browser').trim();

    let recIdByIp = this.ipToRecordId.get(cleanIp);
    let recIdByBrowser = this.browserToRecordId.get(cleanBrowser);

    // Merge if both exist and differ (IP or browser match -> same user)
    if (recIdByIp && recIdByBrowser && recIdByIp !== recIdByBrowser) {
      const recA = this.records.get(recIdByIp);
      const recB = this.records.get(recIdByBrowser);
      if (recA && recB) {
        recA.searchCount = recA.searchCount + recB.searchCount;
        recA.aiCount = recA.aiCount + recB.aiCount;
        recB.ips.forEach(i => { recA.ips.add(i); this.ipToRecordId.set(i, recA.id); });
        recB.browserIds.forEach(b => { recA.browserIds.add(b); this.browserToRecordId.set(b, recA.id); });
        recA.lastAccess = Date.now();
        this.records.delete(recB.id);
        return recA;
      }
    }

    if (recIdByIp) {
      const rec = this.records.get(recIdByIp);
      if (rec) {
        rec.browserIds.add(cleanBrowser);
        this.browserToRecordId.set(cleanBrowser, rec.id);
        rec.lastAccess = Date.now();
        return rec;
      }
    }

    if (recIdByBrowser) {
      const rec = this.records.get(recIdByBrowser);
      if (rec) {
        rec.ips.add(cleanIp);
        this.ipToRecordId.set(cleanIp, rec.id);
        rec.lastAccess = Date.now();
        return rec;
      }
    }

    const newId = 'u_' + Math.random().toString(36).slice(2, 10);
    const newRec: UserQuotaRecord = {
      id: newId,
      ips: new Set([cleanIp]),
      browserIds: new Set([cleanBrowser]),
      searchCount: 0,
      aiCount: 0,
      lastAccess: Date.now()
    };
    this.records.set(newId, newRec);
    this.ipToRecordId.set(cleanIp, newId);
    this.browserToRecordId.set(cleanBrowser, newId);
    return newRec;
  }

  // Restore state from Cloudflare KV if memory is clean or cold-started
  private async syncFromKV(cleanIp: string, cleanBrowser: string, kv?: KVLike): Promise<void> {
    if (!kv) return;
    try {
      const today = this.getTodayDate();
      let targetRecId = this.ipToRecordId.get(cleanIp) || this.browserToRecordId.get(cleanBrowser);

      if (!targetRecId) {
        const [ipRecId, brRecId] = await Promise.all([
          kv.get(`q:${today}:ip:${cleanIp}`).catch(() => null),
          kv.get(`q:${today}:br:${cleanBrowser}`).catch(() => null),
        ]);
        targetRecId = brRecId || ipRecId;
      }

      if (targetRecId && !this.records.has(targetRecId)) {
        const raw = await kv.get(`q:${today}:rec:${targetRecId}`).catch(() => null);
        if (raw) {
          const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
          if (data && data.id) {
            const restored: UserQuotaRecord = {
              id: data.id,
              ips: new Set(data.ips || [cleanIp]),
              browserIds: new Set(data.browserIds || [cleanBrowser]),
              searchCount: Number(data.searchCount || 0),
              aiCount: Number(data.aiCount || 0),
              lastAccess: Number(data.lastAccess || Date.now())
            };
            this.records.set(restored.id, restored);
            restored.ips.forEach(i => this.ipToRecordId.set(i, restored.id));
            restored.browserIds.forEach(b => this.browserToRecordId.set(b, restored.id));
          }
        }
      }
    } catch (e) {
      console.warn('[QuotaManager KV Sync Error]:', e);
    }
  }

  // Persist updated state to Cloudflare KV asynchronously
  private async persistToKV(user: UserQuotaRecord, cleanIp: string, cleanBrowser: string, kv?: KVLike): Promise<void> {
    if (!kv) return;
    try {
      const today = this.getTodayDate();
      const payload = JSON.stringify({
        id: user.id,
        ips: Array.from(user.ips),
        browserIds: Array.from(user.browserIds),
        searchCount: user.searchCount,
        aiCount: user.aiCount,
        lastAccess: user.lastAccess,
      });
      const ttl = 86400 * 2; // Keep for 2 days then auto-purge

      await Promise.allSettled([
        kv.put(`q:${today}:rec:${user.id}`, payload, { expirationTtl: ttl }),
        kv.put(`q:${today}:ip:${cleanIp}`, user.id, { expirationTtl: ttl }),
        kv.put(`q:${today}:br:${cleanBrowser}`, user.id, { expirationTtl: ttl }),
      ]);
    } catch (e) {
      console.warn('[QuotaManager KV Persist Error]:', e);
    }
  }

  public async getQuota(ip: string, browserId: string, kv?: KVLike) {
    const cleanIp = (ip || '127.0.0.1').trim();
    const cleanBrowser = (browserId || 'default_browser').trim();

    if (kv) {
      await this.syncFromKV(cleanIp, cleanBrowser, kv);
    }

    const user = this.getOrCreateUser(cleanIp, cleanBrowser);
    return {
      date: this.dateStr || this.getTodayDate(),
      search: {
        used: user.searchCount,
        limit: this.SEARCH_LIMIT,
        remaining: Math.max(0, this.SEARCH_LIMIT - user.searchCount)
      },
      ai: {
        used: user.aiCount,
        limit: this.AI_LIMIT,
        remaining: Math.max(0, this.AI_LIMIT - user.aiCount)
      }
    };
  }

  public async checkAndConsumeSearch(
    ip: string,
    browserId: string,
    kv?: KVLike
  ): Promise<{ allowed: boolean; remaining: number; used: number; limit: number }> {
    const cleanIp = (ip || '127.0.0.1').trim();
    const cleanBrowser = (browserId || 'default_browser').trim();

    if (kv) {
      await this.syncFromKV(cleanIp, cleanBrowser, kv);
    }

    const user = this.getOrCreateUser(cleanIp, cleanBrowser);
    if (user.searchCount >= this.SEARCH_LIMIT) {
      return { allowed: false, remaining: 0, used: user.searchCount, limit: this.SEARCH_LIMIT };
    }
    user.searchCount += 1;
    user.lastAccess = Date.now();

    if (kv) {
      // Background async persist to KV
      this.persistToKV(user, cleanIp, cleanBrowser, kv).catch(() => {});
    }

    return { allowed: true, remaining: this.SEARCH_LIMIT - user.searchCount, used: user.searchCount, limit: this.SEARCH_LIMIT };
  }

  public async checkAndConsumeAI(
    ip: string,
    browserId: string,
    kv?: KVLike
  ): Promise<{ allowed: boolean; remaining: number; used: number; limit: number }> {
    const cleanIp = (ip || '127.0.0.1').trim();
    const cleanBrowser = (browserId || 'default_browser').trim();

    if (kv) {
      await this.syncFromKV(cleanIp, cleanBrowser, kv);
    }

    const user = this.getOrCreateUser(cleanIp, cleanBrowser);
    if (user.aiCount >= this.AI_LIMIT) {
      return { allowed: false, remaining: 0, used: user.aiCount, limit: this.AI_LIMIT };
    }
    user.aiCount += 1;
    user.lastAccess = Date.now();

    if (kv) {
      this.persistToKV(user, cleanIp, cleanBrowser, kv).catch(() => {});
    }

    return { allowed: true, remaining: this.AI_LIMIT - user.aiCount, used: user.aiCount, limit: this.AI_LIMIT };
  }
}

export const globalQuotaManager = new DailyQuotaManager();
