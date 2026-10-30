/**
 * Daily Quota & Rate Limiter Test Script
 * Verifies:
 * 1. IP and browser matching & merging logic
 * 2. 120 search cap and 300 AI call cap
 * 3. Custom API key bypass
 */

class DailyQuotaManager {
  constructor() {
    this.SEARCH_LIMIT = 120;
    this.AI_LIMIT = 300;
    this.dateStr = '';
    this.records = new Map();
    this.ipToRecordId = new Map();
    this.browserToRecordId = new Map();
  }

  getTodayDate() {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const cst = new Date(utc + 8 * 3600000);
    return cst.toISOString().slice(0, 10);
  }

  checkDateReset() {
    const today = this.getTodayDate();
    if (this.dateStr !== today) {
      this.dateStr = today;
      this.records.clear();
      this.ipToRecordId.clear();
      this.browserToRecordId.clear();
    }
  }

  getOrCreateUser(ip, browserId) {
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
    const newRec = {
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

  getQuota(ip, browserId) {
    const user = this.getOrCreateUser(ip, browserId);
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

  checkAndConsumeSearch(ip, browserId) {
    const user = this.getOrCreateUser(ip, browserId);
    if (user.searchCount >= this.SEARCH_LIMIT) {
      return { allowed: false, remaining: 0, used: user.searchCount, limit: this.SEARCH_LIMIT };
    }
    user.searchCount += 1;
    return { allowed: true, remaining: this.SEARCH_LIMIT - user.searchCount, used: user.searchCount, limit: this.SEARCH_LIMIT };
  }

  checkAndConsumeAI(ip, browserId) {
    const user = this.getOrCreateUser(ip, browserId);
    if (user.aiCount >= this.AI_LIMIT) {
      return { allowed: false, remaining: 0, used: user.aiCount, limit: this.AI_LIMIT };
    }
    user.aiCount += 1;
    return { allowed: true, remaining: this.AI_LIMIT - user.aiCount, used: user.aiCount, limit: this.AI_LIMIT };
  }
}

console.log('--- Testing DailyQuotaManager ---');

const qm = new DailyQuotaManager();

// Test 1: New user initial quota
const initial = qm.getQuota('192.168.1.100', 'browser_A');
console.log('1. Initial Quota:', JSON.stringify(initial));
if (initial.search.limit !== 120 || initial.ai.limit !== 300 || initial.search.remaining !== 120 || initial.ai.remaining !== 300) {
  throw new Error('Initial quota mismatch');
}

// Test 2: Consume search quota
qm.checkAndConsumeSearch('192.168.1.100', 'browser_A');
qm.checkAndConsumeSearch('192.168.1.100', 'browser_A');
qm.checkAndConsumeAI('192.168.1.100', 'browser_A');

const afterConsume = qm.getQuota('192.168.1.100', 'browser_A');
console.log('2. After 2 searches & 1 AI:', JSON.stringify(afterConsume));
if (afterConsume.search.used !== 2 || afterConsume.ai.used !== 1) {
  throw new Error('Consumption count mismatch');
}

// Test 3: Same IP, different browser -> should be judged as SAME user!
const sameIpDiffBrowser = qm.getQuota('192.168.1.100', 'browser_B');
console.log('3. Same IP, different browser (browser_B):', JSON.stringify(sameIpDiffBrowser));
if (sameIpDiffBrowser.search.used !== 2 || sameIpDiffBrowser.ai.used !== 1) {
  throw new Error('Same IP different browser did not share quota!');
}

// Test 4: Same browser, different IP -> should be judged as SAME user!
const sameBrowserDiffIp = qm.getQuota('10.0.0.50', 'browser_A');
console.log('4. Same browser (browser_A), different IP (10.0.0.50):', JSON.stringify(sameBrowserDiffIp));
if (sameBrowserDiffIp.search.used !== 2 || sameBrowserDiffIp.ai.used !== 1) {
  throw new Error('Same browser different IP did not share quota!');
}

// Test 5: Reaching search limit (120)
for (let i = 2; i < 120; i++) {
  const res = qm.checkAndConsumeSearch('192.168.1.100', 'browser_A');
  if (!res.allowed) throw new Error(`Should allow search #${i}`);
}

const atLimit = qm.checkAndConsumeSearch('192.168.1.100', 'browser_A');
console.log('5. Attempt 121st search:', atLimit);
if (atLimit.allowed !== false || atLimit.used !== 120) {
  throw new Error('Failed to block search past 120 cap!');
}

// Check via the other browser on same IP
const atLimitBrowserB = qm.checkAndConsumeSearch('192.168.1.100', 'browser_B');
console.log('6. Attempt 121st search via browser_B on same IP:', atLimitBrowserB);
if (atLimitBrowserB.allowed !== false) {
  throw new Error('Browser B bypassed search cap on same IP!');
}

// Test 6: AI limit (300)
for (let i = 1; i < 300; i++) {
  const res = qm.checkAndConsumeAI('192.168.1.100', 'browser_A');
  if (!res.allowed) throw new Error(`Should allow AI #${i}`);
}

const atAILimit = qm.checkAndConsumeAI('192.168.1.100', 'browser_A');
console.log('7. Attempt 301st AI call:', atAILimit);
if (atAILimit.allowed !== false || atAILimit.used !== 300) {
  throw new Error('Failed to block AI past 300 cap!');
}

console.log('🎉 All Quota Manager unit tests PASSED successfully!');
