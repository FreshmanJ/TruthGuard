# Privacy Policy for TruthGuard (事实检察官)

**Effective Date:** October 2026  
**Applicable Platform:** Microsoft Edge Add-ons & Google Chrome Web Store

TruthGuard ("we", "our", or "the Extension") is dedicated to providing real-time multi-source fact-checking and academic citation verification powered by Tencent Yuanbao Search and AI models. We take your privacy and data security very seriously.

---

### 1. Zero Tracking & No Data Harvesting
- We do **NOT** track your browsing history.
- We do **NOT** profile users or sell any personal data to third parties or advertising networks.
- We do **NOT** read, record, or transmit passwords, cookies, or sensitive form data.

---

### 2. Local Storage and API Credentials
- All user configurations, including API Keys (e.g., Tencent Yuanbao Search Key, LLM API Key), model identifiers, and proxy settings, are strictly stored on your local computer via `chrome.storage.local`.
- These credentials never pass through any intermediate server maintained by TruthGuard developers.

---

### 3. User-Initiated Verification Requests
- Text is sent to external services **ONLY** when you explicitly initiate a check (e.g., right-clicking highlighted text and choosing "使用 TruthGuard 事实核验" or submitting text in the extension popup).
- When triggered, the selected query is dispatched directly to:
  1. **Tencent Cloud Yuanbao Search API** (`api.wsa.cloud.tencent.com`) to retrieve authoritative passage evidence.
  2. **Configured LLM Inference Endpoint** (e.g., SenseNova, OpenAI-compatible API) for proposition arbitration and report synthesis.
- Both endpoints communicate over secure TLS/HTTPS channels.

---

### 4. Justification of Extension Permissions
| Permission | Purpose |
| :--- | :--- |
| `storage` | Stores user API keys, model preferences, and extension options locally. |
| `contextMenus` | Adds the right-click "🛡️ 使用 TruthGuard 事实核验" context menu option on text selection. |
| `activeTab` & `scripting` | Renders the verification floating capsule and topology process tree modal on the user's active tab when triggered. |
| `host_permissions: ["<all_urls>"]` | Allows fact-checking across various web pages (news, technical docs, encyclopedias) upon user command, and allows the background service worker to communicate directly with search and AI APIs without CORS restrictions. |

---

### 5. Data Deletion
Users maintain total control over their data:
- You may modify or delete your configured keys anytime in the extension popup settings.
- Removing or uninstalling the extension immediately purges all associated local data.

---

### 6. Contact & Support
If you have any questions or concerns regarding this policy, please open an issue on our GitHub repository or contact our developer email.
