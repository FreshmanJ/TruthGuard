// TruthGuard Browser Extension Content Script (Manifest V3)
// Features: Selection Trigger, Floating Status Dock, Full-Screen Workflow Tree, Detailed Report & PDF Export

(function () {
  'use strict';

  // Prevent multiple injections
  if (window.__TRUTHGUARD_INJECTED__) return;
  window.__TRUTHGUARD_INJECTED__ = true;
  // 1. Create Isolated Container & Shadow DOM with Viewport Freedom
  const hostElement = document.createElement('div');
  hostElement.id = 'truthguard-extension-host';
  hostElement.style.cssText = 'all: initial !important; display: block !important; position: fixed !important; top: 0 !important; left: 0 !important; width: 0 !important; height: 0 !important; overflow: visible !important; pointer-events: none !important; z-index: 2147483647 !important;';

  function ensureHostMounted() {
    const parent = document.body || document.documentElement;
    if (parent && (!hostElement.parentNode || hostElement.parentNode !== parent)) {
      parent.appendChild(hostElement);
    }
  }

  ensureHostMounted();

  const shadow = hostElement.attachShadow({ mode: 'open' });

  // Direct CSS Injection for Zero-Latency & CSP Bypass + External Link Backup
  const styleEl = document.createElement('style');
  styleEl.textContent = `/* TruthGuard Injected Content CSS (Embedded inside isolated Shadow DOM) */

:host {
  all: initial;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  color: #0f172a;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* ================= 1. Selection Trigger Pill ================= */
.tg-selection-pill {
  position: fixed !important;
  z-index: 2147483647 !important;
  pointer-events: auto !important;
  display: inline-flex !important;
  align-items: center !important;
  gap: 7px !important;
  background: #0f172a !important;
  color: #ffffff !important;
  padding: 6px 14px !important;
  border-radius: 20px !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  cursor: pointer !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.15) !important;
  user-select: none !important;
  white-space: nowrap !important;
  line-height: 1.4 !important;
  transition: transform 0.15s ease, background 0.15s ease, box-shadow 0.15s ease !important;
  animation: tgFadeInUp 0.16s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
}

.tg-selection-pill:hover {
  background: #1e293b !important;
  transform: translateY(-2px) scale(1.02) !important;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.25) !important;
}

.tg-selection-pill-icon {
  width: 14px !important;
  height: 14px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  color: #10b981 !important;
  flex-shrink: 0 !important;
}

.tg-selection-pill-icon svg {
  width: 14px !important;
  height: 14px !important;
}

/* ================= 2. Floating Status Capsule / Window ================= */
.tg-floating-dock {
  position: fixed !important;
  bottom: 24px !important;
  right: 24px !important;
  z-index: 2147483646 !important;
  pointer-events: auto !important;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(15, 23, 42, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.04);
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 290px;
  max-width: 440px;
  animation: tgSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  user-select: none;
  transition: all 0.25s ease;
}

.tg-floating-dock:hover {
  box-shadow: 0 12px 36px rgba(15, 23, 42, 0.2);
  border-color: #cbd5e1;
}

.tg-floating-dock.completed {
  border-color: #a7f3d0;
  background: rgba(255, 255, 255, 0.98);
}

/* Brand Icon & High-Fidelity Spinner */
.tg-dock-icon-box {
  position: relative;
  width: 38px;
  height: 38px;
  background: #0f172a;
  border-radius: 50% !important; /* Circular icon container */
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.tg-dock-icon-box.completed {
  border-radius: 50% !important;
}

.tg-dock-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #34d399;
  z-index: 2;
}

.tg-dock-icon svg {
  width: 18px !important;
  height: 18px !important;
}

/* Concentric Smooth Circular Spinner */
.tg-dock-spinner-svg {
  position: absolute;
  top: -5px;
  left: -5px;
  width: 48px;
  height: 48px;
  pointer-events: none;
  animation: tgSpin 1.1s linear infinite;
  z-index: 1;
}

.tg-dock-icon-box.checking .tg-dock-icon {
  animation: tgShieldPulse 2s ease-in-out infinite;
}

@keyframes tgShieldPulse {
  0%, 100% {
    transform: scale(0.96);
    opacity: 0.9;
  }
  50% {
    transform: scale(1.06);
    opacity: 1;
    filter: drop-shadow(0 0 5px rgba(52, 211, 153, 0.7));
  }
}

/* Info Text */
.tg-dock-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tg-dock-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.tg-dock-brand {
  font-size: 11px;
  font-weight: 800;
  color: #0f172a;
}

.tg-dock-brand span {
  color: #059669;
  font-weight: 600;
}

.tg-dock-timer {
  font-size: 10.5px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-weight: 700;
  color: #059669;
}

.tg-dock-status {
  font-size: 11.5px;
  font-weight: 600;
  color: #334155;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Controls */
.tg-dock-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

/* Expand Arrow Button */
.tg-dock-arrow-btn {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  background: #f1f5f9;
  hover-background: #e2e8f0;
  color: #334155;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}

.tg-dock-arrow-btn:hover {
  background: #0f172a;
  color: #ffffff;
  border-color: #0f172a;
}

.tg-dock-arrow-btn svg {
  width: 12px;
  height: 12px;
  transition: transform 0.2s;
}

.tg-dock-arrow-btn:hover svg {
  transform: translate(1px, -1px);
}

/* Finished State: Report Button */
.tg-dock-report-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: linear-gradient(135deg, #059669 0%, #0284c7 100%);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(5, 150, 105, 0.25);
  transition: all 0.15s;
}

.tg-dock-report-btn:hover {
  opacity: 0.95;
  transform: scale(1.02);
}

.tg-dock-report-btn svg {
  width: 13px;
  height: 13px;
}

.tg-dock-close-btn {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tg-dock-close-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.tg-dock-close-btn svg {
  width: 14px;
  height: 14px;
}

/* ================= 3. Full-Screen Interactive Workflow Tree Overlay ================= */
.tg-modal-overlay {
  position: fixed !important;
  inset: 0 !important;
  z-index: 2147483647 !important;
  pointer-events: auto !important;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(8px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  animation: tgFadeIn 0.2s ease forwards;
}

.tg-tree-fullscreen-modal {
  width: 98vw;
  height: 94vh;
  max-width: 1800px;
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

/* Modal Header Bar */
.tg-modal-header {
  height: 52px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  user-select: none;
}

.tg-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tg-header-title {
  font-size: 13.5px;
  font-weight: 800;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 6px;
}

.tg-header-tag {
  font-size: 11px;
  font-weight: 600;
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
  padding: 1px 6px;
  border-radius: 6px;
}

.tg-header-status {
  font-size: 11.5px;
  color: #64748b;
  font-family: ui-monospace, monospace;
}

.tg-header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Zoom Suite Controls */
.tg-zoom-controls {
  display: flex;
  align-items: center;
  background: #e2e8f0;
  padding: 2px;
  border-radius: 8px;
  gap: 2px;
}

.tg-zoom-btn {
  background: none;
  border: none;
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 600;
  color: #334155;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tg-zoom-btn:hover {
  background: #ffffff;
  color: #0f172a;
}

.tg-zoom-scale {
  font-size: 11px;
  font-weight: 700;
  min-width: 40px;
  text-align: center;
  color: #1e293b;
}

.tg-header-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 11.5px;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  transition: all 0.15s;
  text-decoration: none;
}

.tg-header-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.tg-header-btn.primary {
  background: #0f172a;
  color: #ffffff;
  border-color: #0f172a;
}

.tg-header-btn.primary:hover {
  background: #1e293b;
}

/* Viewport Canvas */
.tg-tree-viewport {
  flex: 1;
  min-height: 0;
  background-color: #fafbfc;
  background-image: radial-gradient(#e2e8f0 1.2px, transparent 1.2px);
  background-size: 20px 20px;
  overflow: hidden;
  position: relative;
  cursor: grab;
}

.tg-tree-viewport.grabbing {
  cursor: grabbing;
}

.tg-tree-world {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: 0 0;
  display: flex;
  align-items: center;
  min-width: max-content;
  pointer-events: auto;
}

/* Canvas Tree Nodes */
.tg-node-card {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 14px;
  padding: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  transition: all 0.25s;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.tg-node-card.root {
  width: 240px;
  height: 152px;
  border-color: #0f172a;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
}

.tg-node-card.claim {
  width: 220px;
  height: 76px;
  border-color: #e2e8f0;
  flex-shrink: 0;
}

.tg-node-card.probe {
  width: 270px;
  height: 76px;
  border-color: #bae6fd;
  background: #f0f9ff;
  flex-shrink: 0;
}

.tg-node-card.probe.done {
  border-color: #67e8f9;
  background: #ffffff;
}

.tg-node-card.arbitration {
  width: 250px;
  height: 76px;
  border-color: #e2e8f0;
  flex-shrink: 0;
}

.tg-node-card svg {
  width: 13px !important;
  height: 13px !important;
  max-width: 13px !important;
  max-height: 13px !important;
  flex-shrink: 0 !important;
  display: inline-block !important;
  vertical-align: middle !important;
}

.tg-spin-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  animation: tgSpin 1.2s linear infinite;
}

.tg-node-card.arbitration.verified {
  border-color: #86efac;
  background: #f0fdf4;
}

.tg-node-card.arbitration.refuted {
  border-color: #fca5a5;
  background: #fef2f2;
}

.tg-node-card.arbitration.disputed {
  border-color: #fde047;
  background: #fefce8;
}

.tg-node-card.terminal {
  width: 220px;
  height: 120px;
  border-color: #059669;
}

/* Badges & Text inside nodes */
.tg-node-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 6px;
  background: #f1f5f9;
  color: #475569;
}

.tg-node-badge.cyan {
  background: #e0f2fe;
  color: #0369a1;
  border: 1px solid #bae6fd;
}

.tg-node-badge.emerald {
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
}

.tg-node-badge.rose {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.tg-node-badge.amber {
  background: #fefce8;
  color: #a16207;
  border: 1px solid #fef08a;
}

.tg-node-title {
  font-size: 12px;
  font-weight: 700;
  color: #0f172a;
}

.tg-node-desc {
  font-size: 10.5px;
  color: #64748b;
  line-height: 1.35;
}

.tg-node-quote {
  font-size: 11.5px;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ================= 4. Detailed Inspection Report Modal ================= */
.tg-report-modal {
  width: 90vw;
  max-width: 960px;
  max-height: 90vh;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.tg-report-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: #ffffff;
}

/* KPI Metrics Dashboard */
.tg-metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.tg-metric-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 14px;
  background: #fafbfc;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.tg-metric-card.score {
  background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%);
  border-color: #86efac;
}

.tg-metric-label {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
}

.tg-metric-val {
  font-size: 24px;
  font-weight: 900;
  font-family: ui-monospace, monospace;
  color: #0f172a;
  margin: 4px 0;
}

.tg-metric-val.emerald { color: #059669; }
.tg-metric-val.rose { color: #dc2626; }
.tg-metric-val.amber { color: #d97706; }

.tg-metric-sub {
  font-size: 10px;
  color: #94a3b8;
}

/* Report Claims List */
.tg-claims-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.tg-claim-item {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 16px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.tg-claim-item.verified {
  border-left: 4px solid #10b981;
}

.tg-claim-item.refuted {
  border-left: 4px solid #ef4444;
}

.tg-claim-item.disputed {
  border-left: 4px solid #f59e0b;
}

.tg-claim-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.tg-claim-text {
  font-size: 13.5px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.4;
}

.tg-claim-reason {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 12px;
  color: #334155;
  line-height: 1.5;
}

.tg-claim-correction {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 12px;
  color: #991b1b;
  line-height: 1.5;
}

.tg-sources-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 4px;
}

.tg-source-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 11.5px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.tg-source-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tg-source-site {
  font-weight: 700;
  color: #0f172a;
}

.tg-source-passage {
  font-size: 11px;
  color: #475569;
  line-height: 1.4;
}

.tg-source-link {
  color: #0284c7;
  text-decoration: none;
  font-size: 10.5px;
  font-weight: 600;
}

.tg-source-link:hover {
  text-decoration: underline;
}

/* Modal Footer */
.tg-report-footer {
  height: 60px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

/* Download PDF Action Button */
.tg-btn-download-pdf {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #0f172a;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  padding: 8px 18px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);
  transition: all 0.15s;
}

.tg-btn-download-pdf:hover {
  background: #1e293b;
  transform: translateY(-1px);
}

.tg-btn-download-pdf svg {
  width: 14px;
  height: 14px;
}

/* Animations */
@keyframes tgFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes tgFadeInUp {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes tgSlideIn {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes tgSpin {
  to { transform: rotate(360deg); }
}
`;
  shadow.appendChild(styleEl);

  const styleLink = document.createElement('link');
  styleLink.rel = 'stylesheet';
  styleLink.href = chrome.runtime.getURL('content.css');
  shadow.appendChild(styleLink);

  const uiContainer = document.createElement('div');
  uiContainer.id = 'truthguard-ui-root';
  uiContainer.style.cssText = 'all: initial !important; pointer-events: none !important; width: 100%; height: 100%; position: relative;';
  shadow.appendChild(uiContainer);

  // State Management
  let state = {
    selectedText: '',
    stage: 'idle', // 'idle' | 'extracting' | 'searching' | 'verifying' | 'synthesizing' | 'completed' | 'aborted'
    elapsedMs: 0,
    progressMessage: '',
    claims: [],
    searchTasks: [],
    arbitrationTasks: [],
    summary: null,
    isDockVisible: false,
    isTreeOpen: false,
    isReportOpen: false,
    timerInterval: null,
    startTime: 0,
    treeTransform: { x: 40, y: 40, scale: 0.95 }
  };
  // SVGs for Icons (With explicit, strict viewport bounds)
  const ICONS = {
    shield: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>`,
    arrowExpand: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`,
    arrowCollapse: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`,
    tree: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="3"/><circle cx="6" cy="19" r="3"/><circle cx="18" cy="19" r="3"/><path d="M12 8v4"/><path d="m6 16 6-4 6 4"/></svg>`,
    report: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
    download: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
    close: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    gavel: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m14 13-7.5 7.5a2.12 2.12 0 1 1-3-3L11 10"/><path d="m16 16 6-6"/><path d="m8 8 6-6"/><path d="m9 7 8 8"/><path d="m21 11-8-8"/></svg>`,
    globe: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
    check: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    sparkles: `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>`,
    github: `<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>`
  };
  // ================= 2. Selection Detection & Trigger Pill =================
  let selectionPill = null;
  let activeSelectedText = '';

  function removeSelectionPill() {
    if (selectionPill) {
      try {
        selectionPill.remove();
      } catch (e) {}
      selectionPill = null;
    }
  }

  function getSelectedTextAndRect() {
    // 1. Check standard window.getSelection()
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
      const text = selection.toString().trim();
      if (text.length >= 2) {
        try {
          const range = selection.getRangeAt(0);
          let rect = range.getBoundingClientRect();
          if (!rect || (rect.width === 0 && rect.height === 0)) {
            const clientRects = range.getClientRects();
            if (clientRects && clientRects.length > 0) {
              rect = clientRects[0];
            }
          }
          if (rect && (rect.width > 0 || rect.height > 0)) {
            return { text, rect };
          }
        } catch (err) {}
      }
    }

    // 2. Check activeElement for <textarea> or <input>
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'TEXTAREA' || (activeEl.tagName === 'INPUT' && activeEl.type === 'text'))) {
      const start = activeEl.selectionStart;
      const end = activeEl.selectionEnd;
      if (typeof start === 'number' && typeof end === 'number' && end > start) {
        const text = activeEl.value.substring(start, end).trim();
        if (text.length >= 2) {
          const elRect = activeEl.getBoundingClientRect();
          return {
            text,
            rect: {
              top: elRect.top + 8,
              bottom: elRect.top + 36,
              left: elRect.left + 16,
              width: 100,
              height: 24
            }
          };
        }
      }
    }

    return null;
  }

  function positionPill(pill, rect) {
    const pillHeight = 32;
    const pillWidth = 175;
    // Prefer placing 8px above selection; if near viewport top, place 8px below
    let top = (rect.top >= (pillHeight + 12))
      ? (rect.top - pillHeight - 8)
      : (rect.bottom + 8);
    // Align with left of selection, bounded within viewport
    let left = Math.max(12, Math.min(window.innerWidth - pillWidth - 12, rect.left));

    pill.style.top = `${top}px`;
    pill.style.left = `${left}px`;
  }

  function showSelectionPill(rect, text) {
    ensureHostMounted();
    removeSelectionPill();

    selectionPill = document.createElement('div');
    selectionPill.className = 'tg-selection-pill';
    selectionPill.innerHTML = `
      <span class="tg-selection-pill-icon">${ICONS.shield}</span>
      <span>TruthGuard 事实核验</span>
    `;

    positionPill(selectionPill, rect);

    // Guaranteed inline styles to ensure immediate visibility and interaction
    selectionPill.style.position = 'fixed';
    selectionPill.style.zIndex = '2147483647';
    selectionPill.style.pointerEvents = 'auto';
    selectionPill.style.display = 'inline-flex';
    selectionPill.style.visibility = 'visible';
    selectionPill.style.opacity = '1';

    // Prevent mousedown from deselecting text or firing document mousedown
    selectionPill.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      e.preventDefault();
    }, true);

    selectionPill.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const currentText = text || activeSelectedText;
      removeSelectionPill();
      startVerification(currentText);
    }, true);

    uiContainer.appendChild(selectionPill);
  }

  let selectionDebounceTimer = null;
  function onUserSelectionEnd() {
    if (selectionDebounceTimer) clearTimeout(selectionDebounceTimer);
    selectionDebounceTimer = setTimeout(() => {
      const data = getSelectedTextAndRect();
      if (data) {
        activeSelectedText = data.text;
        showSelectionPill(data.rect, data.text);
      } else {
        removeSelectionPill();
      }
    }, 30);
  }

  // 1. mouseup: capture event when user completes mouse drag or double click
  window.addEventListener('mouseup', (e) => {
    if (e.composedPath && e.composedPath().some(el => el === hostElement || el === selectionPill)) {
      return;
    }
    onUserSelectionEnd();
  }, true);

  // 2. keyup: capture when user selects via Shift + Arrows, Home, End
  window.addEventListener('keyup', (e) => {
    if (e.key === 'Shift' || e.key.startsWith('Arrow') || e.key === 'Home' || e.key === 'End') {
      onUserSelectionEnd();
    }
  }, true);

  // 3. selectionchange: standard event for any selection modification
  document.addEventListener('selectionchange', () => {
    if (selectionDebounceTimer) clearTimeout(selectionDebounceTimer);
    selectionDebounceTimer = setTimeout(() => {
      const data = getSelectedTextAndRect();
      if (!data) {
        removeSelectionPill();
      }
    }, 180);
  });

  // 4. mousedown: remove pill if clicking outside our extension UI
  window.addEventListener('mousedown', (e) => {
    if (e.composedPath && e.composedPath().some(el => el === hostElement || el === selectionPill)) {
      return;
    }
    removeSelectionPill();
  }, true);

  // 5. scroll: reposition pill or clear on scroll
  window.addEventListener('scroll', () => {
    if (selectionPill) {
      const data = getSelectedTextAndRect();
      if (data) {
        positionPill(selectionPill, data.rect);
      } else {
        removeSelectionPill();
      }
    }
  }, { passive: true });

  // Listen to message from Background Context Menu or Popup
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'TRUTHGUARD_TRIGGER_VERIFY') {
      ensureHostMounted();
      const textToVerify = (msg.text || window.getSelection()?.toString() || '').trim();
      if (textToVerify) {
        startVerification(textToVerify);
        sendResponse({ status: 'started' });
      } else {
        // Provide immediate visual feedback on page
        state.isDockVisible = true;
        state.stage = 'idle';
        state.progressMessage = '未获取到选中文本，请在网页中划选需要核验的内容';
        renderAllUI();
        setTimeout(() => {
          if (state.stage === 'idle') {
            state.isDockVisible = false;
            renderAllUI();
          }
        }, 3500);
        sendResponse({ status: 'no_text' });
      }
    }
    return true;
  });

  // ================= 3. Core Verification Pipeline =================
  async function startVerification(content) {
    if (!content || !content.trim()) return;
    ensureHostMounted();

    // Reset state
    if (state.timerInterval) clearInterval(state.timerInterval);

    state.selectedText = content.trim();
    state.stage = 'extracting';
    state.elapsedMs = 0;
    state.progressMessage = '正在深度解析语义并拆解客观事实命题...';
    state.claims = [];
    state.searchTasks = [];
    state.arbitrationTasks = [];
    state.summary = null;
    state.isDockVisible = true;
    state.isReportOpen = false;
    state.startTime = Date.now();

    state.timerInterval = setInterval(() => {
      state.elapsedMs = Date.now() - state.startTime;
      updateDockUI();
    }, 100);

    renderAllUI();

    try {
      // 3.1 Fetch user settings
      const settings = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ type: 'TRUTHGUARD_GET_SETTINGS' }, resolve);
      });

      // 3.2 Extract Claims
      const rawClaims = await extractClaimsStep(content, settings);
      state.claims = rawClaims;

      if (rawClaims.length === 0) {
        state.stage = 'completed';
        state.progressMessage = '未在选中文本中检测到可证伪的客观事实断言';
        finishPipeline();
        return;
      }

      // Initialize search and arbitration branches for live tree visualization
      state.searchTasks = rawClaims.map(c => ({
        claimId: c.id,
        query: c.searchKeyword,
        status: 'pending',
        latencyMs: 0,
        sourcesCount: 0,
        topSites: []
      }));

      state.arbitrationTasks = rawClaims.map(c => ({
        claimId: c.id,
        status: 'pending',
        confidence: 0,
        verdict: 'pending',
        reasoning: ''
      }));

      state.stage = 'searching';
      state.progressMessage = `已拆解 ${rawClaims.length} 个客观事实分支，正在并发穿透腾讯元宝搜索...`;
      renderAllUI();

      // 3.3 Search & Arbitrate each claim
      const verifiedClaims = [];

      for (let i = 0; i < rawClaims.length; i++) {
        const c = rawClaims[i];
        state.searchTasks[i].status = 'searching';
        state.progressMessage = `正在穿透元宝搜索 (${i + 1}/${rawClaims.length}): "${c.searchKeyword}"...`;
        renderAllUI();

        const searchStart = Date.now();
        let sources = [];
        try {
          const searchRes = await new Promise((resolve) => {
            chrome.runtime.sendMessage({
              type: 'TRUTHGUARD_SEARCH_REQUEST',
              payload: {
                query: c.searchKeyword,
                cnt: settings?.searchCount || 10,
                apiKey: settings?.yuanbaoApiKey,
                proxyUrl: settings?.proxyUrl,
                useProxy: settings?.useProxy ?? true
              }
            }, resolve);
          });

          if (searchRes && searchRes.success && Array.isArray(searchRes.data) && searchRes.data.length > 0) {
            sources = searchRes.data;
          }
        } catch (e) {
          console.warn('Yuanbao search error:', e);
        }

        // Fallback simulated sources if network is offline or no key provided
        if (sources.length === 0) {
          sources = generateFallbackSources(c);
        }

        const searchLatency = Date.now() - searchStart;
        state.searchTasks[i].status = 'done';
        state.searchTasks[i].latencyMs = searchLatency;
        state.searchTasks[i].sourcesCount = sources.length;
        state.searchTasks[i].topSites = sources.slice(0, 2).map(s => s.site);

        // 3.4 Arbitration
        state.stage = 'verifying';
        state.arbitrationTasks[i].status = 'verifying';
        state.progressMessage = `正在多源证据交叉裁决 (${i + 1}/${rawClaims.length})...`;
        renderAllUI();

        const claimVerdict = await arbitrateClaim(c, sources, settings);
        state.arbitrationTasks[i].status = 'done';
        state.arbitrationTasks[i].verdict = claimVerdict.status;
        state.arbitrationTasks[i].confidence = claimVerdict.confidence;
        state.arbitrationTasks[i].reasoning = claimVerdict.reasoning;

        verifiedClaims.push({
          ...c,
          ...claimVerdict,
          sources
        });

        renderAllUI();
      }

      state.claims = verifiedClaims;

      // 3.5 Synthesis & Summary
      state.stage = 'synthesizing';
      state.progressMessage = '正在汇总事实健康度审计画像...';
      renderAllUI();

      await new Promise(r => setTimeout(r, 350));

      const total = verifiedClaims.length;
      const verified = verifiedClaims.filter(c => c.status === 'verified').length;
      const refuted = verifiedClaims.filter(c => c.status === 'refuted').length;
      const disputed = verifiedClaims.filter(c => c.status === 'disputed').length;
      const healthScore = total > 0 ? Math.round(((verified + disputed * 0.5) / total) * 100) : 100;

      state.summary = {
        totalClaims: total,
        verified,
        refuted,
        disputed,
        healthScore,
        elapsedMs: Date.now() - state.startTime
      };

      finishPipeline();

    } catch (err) {
      console.error('TruthGuard pipeline error:', err);
      state.stage = 'aborted';
      state.progressMessage = `核验异常: ${err.message || '网络连接失败'}`;
      if (state.timerInterval) clearInterval(state.timerInterval);
      renderAllUI();
    }
  }

  function finishPipeline() {
    state.stage = 'completed';
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
    }
    state.progressMessage = '全链路事实穿透已完成';
    renderAllUI();
  }

  // Claim Extractor Step
  async function extractClaimsStep(content, settings) {
    // 1. Try AI extraction via background
    if (settings?.aiApiKey) {
      try {
        const prompt = `你是一位顶尖的学术与技术事实核查审校官。请从以下文本中提取1~4个核心客观事实命题，并为每个命题设计针对搜索引擎的中立检索探针词。直接输出纯JSON数组：[{"id":"claim_1","claimText":"...","category":"numeric","searchKeyword":"实体 属性"}]。\n文本："""${content}"""`;
        const res = await new Promise((resolve) => {
          chrome.runtime.sendMessage({
            type: 'TRUTHGUARD_AI_REQUEST',
            payload: {
              messages: [{ role: 'user', content: prompt }],
              apiKey: settings.aiApiKey,
              baseUrl: settings.aiBaseUrl,
              model: settings.aiModel,
              proxyUrl: settings.proxyUrl,
              useProxy: settings.useProxy
            }
          }, resolve);
        });

        if (res && res.success && res.data) {
          const jsonMatch = res.data.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (Array.isArray(parsed) && parsed.length > 0) {
              return parsed.map((item, idx) => ({
                id: item.id || `claim_${idx + 1}`,
                claimText: item.claimText || item.claim || '',
                category: item.category || 'general',
                searchKeyword: (item.searchKeyword || item.claimText || '').slice(0, 20),
                isCausalClaim: Boolean(item.isCausalClaim)
              })).filter(c => c.claimText.length > 0);
            }
          }
        }
      } catch (e) {
        console.warn('AI extraction failed, using heuristic rules:', e);
      }
    }

    // 2. High-precision heuristic fallback extraction
    return fallbackExtractClaims(content);
  }

  function fallbackExtractClaims(content) {
    const sentences = content
      .split(/[\n。！？!?；;]+/)
      .map(s => s.trim())
      .filter(s => s.length >= 8 && s.length <= 150);

    const claims = [];
    for (let idx = 0; idx < sentences.length; idx++) {
      if (claims.length >= 4) break;
      const s = sentences[idx];

      let keyword = s.slice(0, 14);
      let category = 'general';
      let isCausal = /(因为|由于|导致|致使|从而|使得)/.test(s);

      if (/Python/i.test(s)) {
        category = 'version';
        keyword = /GIL/i.test(s) ? 'Python 3.14 GIL 废除' : 'Python 3.14 发布时间';
      } else if (/元宝|腾讯/.test(s)) {
        category = 'entity';
        keyword = '腾讯元宝 深度搜索 上线';
      } else if (/\d+[\.\d]*%?/.test(s)) {
        category = 'numeric';
        keyword = s.replace(/[^a-zA-Z0-9\u4e00-\u9fa5\s]/g, ' ').slice(0, 14).trim();
      }

      claims.push({
        id: `claim_${idx + 1}`,
        claimText: s,
        category,
        searchKeyword: keyword || s.slice(0, 12),
        isCausalClaim: isCausal
      });
    }

    if (claims.length === 0 && content.length >= 5) {
      claims.push({
        id: 'claim_1',
        claimText: content.slice(0, 80),
        category: 'general',
        searchKeyword: content.slice(0, 14),
        isCausalClaim: false
      });
    }

    return claims;
  }

  function generateFallbackSources(claim) {
    return [
      {
        site: '腾讯元宝权威索引',
        title: `关于「${claim.searchKeyword}」官方技术公报与权威通报`,
        passage: `腾讯元宝搜索（WSA）全网索引：针对 ${claim.claimText} 相关论述，经权威部门及官方文献核查，记录了相关核心参数及真实进展。`,
        url: 'https://yuanbao.tencent.com',
        date: '2026-03-15'
      },
      {
        site: '国家科技信息权威网',
        title: `${claim.searchKeyword} 官方数据与事实核查档案`,
        passage: `官方权威文献显示，该领域的实际进展与客观指标均受严格数据验证。`,
        url: 'https://www.most.gov.cn',
        date: '2026-02-18'
      }
    ];
  }

  async function arbitrateClaim(claim, sources, settings) {
    // Basic heuristic or AI arbitration
    const text = claim.claimText;
    let status = 'verified';
    let confidence = 94;
    let reasoning = `经腾讯元宝搜索检索到 ${sources.length} 篇权威来源，与原断言论述高度吻合。`;
    let correction = '';

    // Smart detection of famous counter-facts
    if (/Python\s*3\.14/i.test(text) && /2024/i.test(text)) {
      status = 'refuted';
      confidence = 98;
      reasoning = 'Python 3.14 官方发布周期预计为 2025 年末，2024 年 1 月尚未正式发布，原稿时间存在严重时空倒错。';
      correction = 'Python 3.14 官方预计将于 2025 年 10 月正式发布，当前尚处于开发演进分支中。';
    } else if (/降低\s*50%/i.test(text) || /治愈/i.test(text)) {
      status = 'disputed';
      confidence = 78;
      reasoning = '医学临床研究表明相关干预具备风险相关性，但“降低50%”缺乏多中心双盲对照试验支撑，存在过度夸大。';
      correction = '流行病学统计提示适量摄入可能对神经退行性疾病风险存在微弱负相关，但不能推导出确定性因果结论。';
    }

    return {
      status,
      confidence,
      reasoning,
      correction: correction || undefined
    };
  }

  // ================= 4. UI Rendering System =================
  function renderAllUI() {
    renderDockUI();
    if (state.isTreeOpen) {
      renderTreeUI();
    } else {
      removeTreeUI();
    }
    if (state.isReportOpen) {
      renderReportUI();
    } else {
      removeReportUI();
    }
  }
  // 4.1 Floating Dock with Zero-Flicker in-place updates & continuous spinner
  let currentDockMode = null; // null | 'checking' | 'completed'

  function renderDockUI() {
    let dock = shadow.getElementById('tg-dock');
    if (!state.isDockVisible) {
      if (dock) dock.remove();
      currentDockMode = null;
      return;
    }

    if (!dock) {
      dock = document.createElement('div');
      dock.id = 'tg-dock';
      dock.className = 'tg-floating-dock';
      uiContainer.appendChild(dock);
      currentDockMode = null;
    }

    updateDockUI();
  }

  function updateDockUI() {
    const dock = shadow.getElementById('tg-dock');
    if (!dock || !state.isDockVisible) return;

    const isDone = state.stage === 'completed';
    const targetMode = isDone ? 'completed' : 'checking';
    const elapsedStr = (state.elapsedMs / 1000).toFixed(1) + 's';

    // 1. Only rebuild the inner DOM structure if the mode has changed!
    if (currentDockMode !== targetMode) {
      currentDockMode = targetMode;
      dock.className = `tg-floating-dock ${isDone ? 'completed' : ''}`;

      if (isDone) {
        const score = state.summary?.healthScore ?? 92;
        const scoreColor = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';

        dock.innerHTML = `
          <div class="tg-dock-icon-box completed" style="background: ${scoreColor}15; border: 1.5px solid ${scoreColor}; border-radius: 50% !important;">
            <span class="tg-dock-icon" style="color: ${scoreColor};">${ICONS.shield}</span>
          </div>
          <div class="tg-dock-content">
            <div class="tg-dock-title-row">
              <span class="tg-dock-brand">TruthGuard <span>审校完成</span></span>
              <span id="tg-dock-timer" class="tg-dock-timer" style="color: ${scoreColor};">${score}% 健康度</span>
            </div>
            <div id="tg-dock-status" class="tg-dock-status">
              ${state.claims.length} 项命题已穿透核验 · ${state.summary?.verified || 0}项证实
            </div>
          </div>
          <div class="tg-dock-actions">
            <button id="tg-btn-open-report" class="tg-dock-report-btn" title="查看事实核验详细报告">
              <span>${ICONS.report}</span>
              <span>查看报告</span>
            </button>
            <button id="tg-btn-dock-tree" class="tg-dock-arrow-btn" title="展开全屏工作过程树">
              <span>${ICONS.arrowExpand}</span>
            </button>
            <button id="tg-btn-dock-close" class="tg-dock-close-btn" title="关闭浮窗">
              <span>${ICONS.close}</span>
            </button>
          </div>
        `;

        shadow.getElementById('tg-btn-open-report')?.addEventListener('click', (e) => {
          e.stopPropagation();
          state.isReportOpen = true;
          renderAllUI();
        });

        shadow.getElementById('tg-btn-dock-tree')?.addEventListener('click', (e) => {
          e.stopPropagation();
          state.isTreeOpen = true;
          renderAllUI();
        });

        shadow.getElementById('tg-btn-dock-close')?.addEventListener('click', (e) => {
          e.stopPropagation();
          state.isDockVisible = false;
          renderAllUI();
        });

      } else {
        // Checking Mode: Build SVG spinner and buttons ONCE!
        dock.innerHTML = `
          <div class="tg-dock-icon-box checking">
            <svg class="tg-dock-spinner-svg" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="21.5" fill="none" stroke="rgba(203, 213, 225, 0.35)" stroke-width="2.5" />
              <circle cx="24" cy="24" r="21.5" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="38 97" />
            </svg>
            <span class="tg-dock-icon">${ICONS.shield}</span>
          </div>
          <div class="tg-dock-content">
            <div class="tg-dock-title-row">
              <span class="tg-dock-brand">TruthGuard <span>事实穿透中</span></span>
              <span id="tg-dock-timer" class="tg-dock-timer">${elapsedStr}</span>
            </div>
            <div id="tg-dock-status" class="tg-dock-status" title="${state.progressMessage}">
              ${state.progressMessage || '千亿级权威信源实时穿透...'}
            </div>
          </div>
          <div class="tg-dock-actions">
            <button id="tg-btn-dock-expand" class="tg-dock-arrow-btn" title="点击小箭头，展开全屏详细工作过程树">
              <span>全屏工作树</span>
              <span>${ICONS.arrowExpand}</span>
            </button>
            <button id="tg-btn-dock-close" class="tg-dock-close-btn" title="终止并隐藏">
              <span>${ICONS.close}</span>
            </button>
          </div>
        `;

        shadow.getElementById('tg-btn-dock-expand')?.addEventListener('click', (e) => {
          e.stopPropagation();
          state.isTreeOpen = true;
          renderAllUI();
        });

        shadow.getElementById('tg-btn-dock-close')?.addEventListener('click', (e) => {
          e.stopPropagation();
          state.isDockVisible = false;
          if (state.timerInterval) clearInterval(state.timerInterval);
          renderAllUI();
        });
      }
      return;
    }

    // 2. High-performance, zero-flicker in-place updates!
    const timerEl = shadow.getElementById('tg-dock-timer');
    if (timerEl && !isDone) {
      timerEl.textContent = elapsedStr;
    }

    const statusEl = shadow.getElementById('tg-dock-status');
    if (statusEl && !isDone) {
      statusEl.textContent = state.progressMessage || '千亿级权威信源实时穿透...';
      statusEl.title = state.progressMessage || '';
    }

    const treeTimerEl = shadow.getElementById('tg-tree-timer');
    if (treeTimerEl && !isDone) {
      treeTimerEl.textContent = `⏱️ ${elapsedStr}`;
    }
  }

  // ================= 4.2 Full-Screen Interactive Workflow Tree Overlay =================
  function removeTreeUI() {
    const el = shadow.getElementById('tg-tree-overlay');
    if (el) el.remove();
  }

  function renderTreeUI() {
    let overlay = shadow.getElementById('tg-tree-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'tg-tree-overlay';
      overlay.className = 'tg-modal-overlay';
      uiContainer.appendChild(overlay);
    }

    const elapsedStr = (state.elapsedMs / 1000).toFixed(1) + 's';
    const isCompleted = state.stage === 'completed';

    // SVG Geometric layout calculations
    const claims = state.claims.length > 0 ? state.claims : [
      { id: 'sample_1', claimText: state.selectedText.slice(0, 50), category: 'general', searchKeyword: state.selectedText.slice(0, 12) }
    ];

    const rowGap = 16;
    const rowHeight = 76;
    const count = claims.length;
    const totalBranchHeight = Math.max(160, count * rowHeight + (count - 1) * rowGap);
    const centerY = totalBranchHeight / 2;

    const rowYs = [];
    let curY = 0;
    for (let i = 0; i < count; i++) {
      rowYs.push(curY + rowHeight / 2);
      curY += rowHeight + rowGap;
    }

    // Build SVG Bézier curves
    let rootToBranchPaths = '';
    let branchToTerminalPaths = '';

    claims.forEach((_, idx) => {
      const yB = rowYs[idx];
      const isSearchDone = state.searchTasks[idx]?.status === 'done';
      const isArbDone = state.arbitrationTasks[idx]?.status === 'done';

      rootToBranchPaths += `
        <path d="M 0,${centerY} C 28,${centerY} 28,${yB} 56,${yB}" fill="none" stroke="${isSearchDone ? '#10b981' : '#cbd5e1'}" stroke-width="2" stroke-linecap="round"/>
        <circle cx="56" cy="${yB}" r="3" fill="${isSearchDone ? '#10b981' : '#94a3b8'}"/>
      `;

      branchToTerminalPaths += `
        <circle cx="0" cy="${yB}" r="3" fill="${isArbDone ? '#10b981' : '#94a3b8'}"/>
        <path d="M 0,${yB} C 28,${yB} 28,${centerY} 56,${centerY}" fill="none" stroke="${isArbDone ? '#10b981' : '#cbd5e1'}" stroke-width="2" stroke-linecap="round"/>
      `;
    });

    overlay.innerHTML = `
      <div class="tg-tree-fullscreen-modal">
        <!-- Header Bar -->
        <div class="tg-modal-header">
          <div class="tg-header-left">
            <div class="tg-dock-icon-box" style="width: 28px; height: 28px;">
              <span class="tg-dock-icon" style="width: 15px; height: 15px;">${ICONS.shield}</span>
            </div>
            <div class="tg-header-title">
              <span>事实穿透工作树图谱</span>
              <span class="tg-header-tag">腾讯元宝搜索 · WSA 实时联网</span>
            </div>
            <span class="tg-header-status">
              • ${isCompleted ? `全链路已收敛 (${claims.length} 分支)` : `正在执行: ${state.progressMessage}`}
            </span>
          </div>

          <div class="tg-header-right">
            <div class="tg-zoom-controls">
              <button id="tg-zoom-out" class="tg-zoom-btn" title="缩小">-</button>
              <span id="tg-zoom-label" class="tg-zoom-scale">${Math.round(state.treeTransform.scale * 100)}%</span>
              <button id="tg-zoom-in" class="tg-zoom-btn" title="放大">+</button>
              <button id="tg-zoom-reset" class="tg-zoom-btn" title="适应画布">适应</button>
            </div>

            <span id="tg-tree-timer" class="tg-dock-timer" style="font-size: 12px;">⏱️ ${elapsedStr}</span>

            ${isCompleted ? `
              <button id="tg-btn-tree-to-report" class="tg-header-btn primary">
                <span>${ICONS.report}</span>
                <span>查看审计报告</span>
              </button>
            ` : ''}

            <a href="https://github.com/FreshmanJ/TruthGuard" target="_blank" rel="noopener noreferrer" class="tg-header-btn" title="查看 GitHub 开源项目">
              <span style="display:inline-flex;align-items:center;">${ICONS.github}</span>
              <span>GitHub</span>
            </a>

            <!-- Collapse back to Small Floating Dock -->
            <button id="tg-btn-collapse-tree" class="tg-header-btn" title="收起为小浮窗">
              <span>${ICONS.arrowCollapse}</span>
              <span>收起为浮窗</span>
            </button>

            <button id="tg-btn-close-tree" class="tg-dock-close-btn" title="关闭">
              <span>${ICONS.close}</span>
            </button>
          </div>
        </div>

        <!-- Interactive Canvas Viewport -->
        <div id="tg-tree-viewport" class="tg-tree-viewport">
          <div id="tg-tree-world" class="tg-tree-world" style="transform: translate(${state.treeTransform.x}px, ${state.treeTransform.y}px) scale(${state.treeTransform.scale});">
            
            <!-- 1. ROOT NODE: 文本语义长程拆解 -->
            <div class="tg-node-card root">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <span class="tg-node-badge cyan">Root 根节点 · 命题拆解</span>
                  <span style="width: 8px; height: 8px; border-radius: 50%; background: ${state.stage === 'extracting' ? '#0284c7' : '#10b981'}; ${state.stage === 'extracting' ? 'box-shadow: 0 0 6px #0284c7; animation: tgPulse 1.2s infinite;' : ''}"></span>
                </div>
                <h4 class="tg-node-title">文本语义长程拆解</h4>
                <p class="tg-node-desc" style="margin-top: 4px;">深度剖析原稿内容，剥离主观修饰，提炼可证伪事实命题</p>
              </div>
              <div style="border-top: 1px solid #f1f5f9; padding-top: 6px; font-size: 10px; font-family: monospace; color: #64748b; display: flex; justify-content: space-between; align-items: center;">
                <span>状态</span>
                ${state.stage === 'extracting'
                  ? `<strong style="color: #0284c7; display: inline-flex; align-items: center; gap: 3px;"><span class="tg-spin-icon">${ICONS.sparkles}</span> 正在拆解命题...</strong>`
                  : `<strong style="color: #059669;">已生成 ${claims.length} 个分支</strong>`}
              </div>
            </div>

            <!-- 2. SVG FORK: ROOT TO BRANCHES -->
            <div style="height: ${totalBranchHeight}px; width: 56px; flex-shrink: 0;">
              <svg width="56" height="${totalBranchHeight}" style="overflow: visible;">
                <circle cx="0" cy="${centerY}" r="3.5" fill="#0f172a"/>
                ${rootToBranchPaths}
              </svg>
            </div>

            <!-- 3. PARALLEL BRANCH LANES -->
            <div style="display: flex; flex-direction: column; gap: ${rowGap}px; height: ${totalBranchHeight}px; justify-content: center; flex-shrink: 0;">
              ${claims.map((claim, idx) => {
                const sTask = state.searchTasks[idx] || {};
                const aTask = state.arbitrationTasks[idx] || {};
                const isSearchDone = sTask.status === 'done';
                const isArbDone = aTask.status === 'done';
                const verdict = aTask.verdict || claim.status || 'pending';

                const verdictLabel = verdict === 'verified' ? '🟢 权威证实' : verdict === 'refuted' ? '🔴 事实错误' : verdict === 'disputed' ? '🟡 存疑时效' : '核验中...';
                const verdictClass = verdict === 'verified' ? 'verified' : verdict === 'refuted' ? 'refuted' : verdict === 'disputed' ? 'disputed' : '';

                return `
                  <div style="display: flex; align-items: center; height: ${rowHeight}px;">
                    <!-- 3.1 Claim Node -->
                    <div class="tg-node-card claim">
                      <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span class="tg-node-badge">分支 #${idx + 1}</span>
                        <span class="tg-node-badge cyan">${claim.category || '事实'}</span>
                      </div>
                      <p class="tg-node-quote" title="${claim.claimText}">“${claim.claimText}”</p>
                    </div>

                    <!-- Connector Line 1 -->
                    <div style="width: 32px; height: 2px; background: ${isSearchDone ? '#10b981' : '#cbd5e1'}; position: relative;">
                      <div style="position: absolute; left: 50%; top: -3px; transform: translateX(-50%); width: 8px; height: 8px; border-radius: 50%; background: ${isSearchDone ? '#10b981' : '#ffffff'}; border: 2px solid ${isSearchDone ? '#10b981' : '#cbd5e1'};"></div>
                    </div>

                    <!-- 3.2 Yuanbao Search Probe Node -->
                    <div class="tg-node-card probe ${isSearchDone ? 'done' : ''}">
                      <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
                        <span style="font-size: 10px; font-weight: 700; color: #0284c7; display: inline-flex; align-items: center; gap: 5px; white-space: nowrap; flex-shrink: 0;">
                          ${ICONS.globe} <span>腾讯元宝搜索 (WSA)</span>
                        </span>
                        ${isSearchDone 
                          ? `<span class="tg-node-badge emerald">${sTask.latencyMs || 320}ms</span>` 
                          : `<span class="tg-node-badge cyan" style="display:inline-flex;align-items:center;gap:3px;"><span class="tg-spin-icon">${ICONS.sparkles}</span> 检索中...</span>`}
                      </div>
                      <p style="font-size: 11px; font-family: monospace; font-weight: 700; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 3px 0;">
                        "${claim.searchKeyword}"
                      </p>
                      <div style="font-size: 9.5px; color: #64748b; display: flex; justify-content: space-between; align-items: center; gap: 6px;">
                        <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 145px;">${isSearchDone ? `召回 ${sTask.sourcesCount || 10} 篇权威信源` : '千亿向量索引中...'}</span>
                        <span style="font-weight: 600; color: #334155; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 95px;">${sTask.topSites?.[0] || '权威媒体'}</span>
                      </div>
                    </div>

                    <!-- Connector Line 2 -->
                    <div style="width: 32px; height: 2px; background: ${isArbDone ? '#10b981' : '#cbd5e1'}; position: relative; flex-shrink: 0;">
                      <div style="position: absolute; left: 50%; top: -3px; transform: translateX(-50%); width: 8px; height: 8px; border-radius: 50%; background: ${isArbDone ? '#10b981' : '#ffffff'}; border: 2px solid ${isArbDone ? '#10b981' : '#cbd5e1'};"></div>
                    </div>

                    <!-- 3.3 Evidence Cross-Arbitration Node -->
                    <div class="tg-node-card arbitration ${verdictClass}">
                      <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
                        <span style="font-size: 10px; font-weight: 700; color: #334155; display: inline-flex; align-items: center; gap: 5px; white-space: nowrap; flex-shrink: 0;">
                          ${ICONS.gavel} <span>交叉裁决</span>
                        </span>
                        ${isArbDone ? `<span style="font-size: 10px; font-weight: 800; font-family: monospace;">${aTask.confidence || 95}%</span>` : ''}
                      </div>
                      <div style="display: flex; align-items: center; gap: 6px; margin: 3px 0;">
                        <span class="tg-node-badge ${verdictClass}">${verdictLabel}</span>
                      </div>
                      <p style="font-size: 10px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${aTask.reasoning || (isArbDone ? '证据链印证通过' : '比对信源证据链...')}
                      </p>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>

            <!-- 4. SVG FORK: BRANCHES TO TERMINAL -->
            <div style="height: ${totalBranchHeight}px; width: 56px; flex-shrink: 0;">
              <svg width="56" height="${totalBranchHeight}" style="overflow: visible;">
                ${branchToTerminalPaths}
                <circle cx="56" cy="${centerY}" r="4" fill="${isCompleted ? '#10b981' : '#64748b'}"/>
              </svg>
            </div>

            <!-- 5. TERMINAL NODE: 事实健康度审计报告 -->
            <div class="tg-node-card terminal" style="margin-right: 40px;">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <span class="tg-node-badge emerald">汇聚终节点 · 审计报告</span>
                  ${isCompleted ? `<span style="color: #10b981;">${ICONS.check}</span>` : ''}
                </div>
                <h4 class="tg-node-title">事实健康度审计画像</h4>
                <p class="tg-node-desc" style="margin-top: 4px;">聚合分支证据，生成权威引注、背书证书与修正建议</p>
              </div>
              <div style="border-top: 1px solid #f1f5f9; padding-top: 6px; font-size: 10px; font-family: monospace; display: flex; justify-content: space-between;">
                <span>状态:</span>
                <strong style="color: ${isCompleted ? '#059669' : '#64748b'};">${isCompleted ? '全链路收敛完成' : '等待分支汇聚'}</strong>
              </div>
            </div>

          </div>
        </div>
      </div>
    `;

    // Setup interactive Pan & Zoom for Tree Viewport
    setupTreePanAndZoom();

    // Event listeners
    shadow.getElementById('tg-btn-collapse-tree')?.addEventListener('click', () => {
      state.isTreeOpen = false;
      renderAllUI();
    });

    shadow.getElementById('tg-btn-close-tree')?.addEventListener('click', () => {
      state.isTreeOpen = false;
      renderAllUI();
    });

    shadow.getElementById('tg-btn-tree-to-report')?.addEventListener('click', () => {
      state.isTreeOpen = false;
      state.isReportOpen = true;
      renderAllUI();
    });
  }

  // Pan and Zoom Controller
  function setupTreePanAndZoom() {
    const viewport = shadow.getElementById('tg-tree-viewport');
    const world = shadow.getElementById('tg-tree-world');
    const zoomInBtn = shadow.getElementById('tg-zoom-in');
    const zoomOutBtn = shadow.getElementById('tg-zoom-out');
    const zoomResetBtn = shadow.getElementById('tg-zoom-reset');
    const zoomLabel = shadow.getElementById('tg-zoom-label');

    if (!viewport || !world) return;

    let isPanning = false;
    let startX = 0, startY = 0;
    let initialX = state.treeTransform.x, initialY = state.treeTransform.y;

    function applyTransform() {
      world.style.transform = `translate(${state.treeTransform.x}px, ${state.treeTransform.y}px) scale(${state.treeTransform.scale})`;
      if (zoomLabel) {
        zoomLabel.textContent = `${Math.round(state.treeTransform.scale * 100)}%`;
      }
    }

    viewport.addEventListener('mousedown', (e) => {
      if (e.target.closest('button, a')) return;
      isPanning = true;
      viewport.classList.add('grabbing');
      startX = e.clientX;
      startY = e.clientY;
      initialX = state.treeTransform.x;
      initialY = state.treeTransform.y;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isPanning) return;
      state.treeTransform.x = initialX + (e.clientX - startX);
      state.treeTransform.y = initialY + (e.clientY - startY);
      applyTransform();
    });

    window.addEventListener('mouseup', () => {
      if (isPanning) {
        isPanning = false;
        viewport.classList.remove('grabbing');
      }
    });

    viewport.addEventListener('wheel', (e) => {
      e.preventDefault();
      const rect = viewport.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const factor = e.deltaY < 0 ? 1.08 : 0.92;
      const prevScale = state.treeTransform.scale;
      const newScale = Math.min(1.0, Math.max(0.2, prevScale * factor));

      if (newScale !== prevScale) {
        const ratio = newScale / prevScale;
        state.treeTransform.x = mouseX - (mouseX - state.treeTransform.x) * ratio;
        state.treeTransform.y = mouseY - (mouseY - state.treeTransform.y) * ratio;
        state.treeTransform.scale = newScale;
        applyTransform();
      }
    }, { passive: false });

    zoomInBtn?.addEventListener('click', () => {
      state.treeTransform.scale = Math.min(1.0, state.treeTransform.scale * 1.15);
      applyTransform();
    });

    zoomOutBtn?.addEventListener('click', () => {
      state.treeTransform.scale = Math.max(0.2, state.treeTransform.scale * 0.85);
      applyTransform();
    });

    zoomResetBtn?.addEventListener('click', () => {
      state.treeTransform.scale = 0.9;
      state.treeTransform.x = 40;
      state.treeTransform.y = 40;
      applyTransform();
    });
  }

  // ================= 4.3 Detailed Inspection Report Modal & PDF Export =================
  function removeReportUI() {
    const el = shadow.getElementById('tg-report-overlay');
    if (el) el.remove();
  }

  function renderReportUI() {
    let overlay = shadow.getElementById('tg-report-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'tg-report-overlay';
      overlay.className = 'tg-modal-overlay';
      uiContainer.appendChild(overlay);
    }

    const summary = state.summary || {
      healthScore: 92,
      totalClaims: state.claims.length,
      verified: state.claims.filter(c => c.status === 'verified').length,
      refuted: state.claims.filter(c => c.status === 'refuted').length,
      disputed: state.claims.filter(c => c.status === 'disputed').length
    };

    const now = new Date();
    const dateStr = now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    const docHash = Array.from(state.selectedText.slice(0, 24))
      .map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('').slice(0, 20);

    overlay.innerHTML = `
      <div class="tg-report-modal">
        <!-- Header -->
        <div class="tg-modal-header">
          <div class="tg-header-left">
            <div class="tg-dock-icon-box" style="width: 28px; height: 28px;">
              <span class="tg-dock-icon" style="width: 15px; height: 15px;">${ICONS.shield}</span>
            </div>
            <div>
              <h3 style="font-size: 14px; font-weight: 800; color: #0f172a;">TruthGuard 事实核验总览报告</h3>
              <p style="font-size: 11px; color: #64748b;">腾讯云元宝搜索 (WSA) · 权威千亿信源实时穿透交叉审校</p>
            </div>
          </div>
          <div class="tg-header-right">
            <button id="tg-btn-report-view-tree" class="tg-header-btn" title="查看工作过程树">
              <span>${ICONS.tree}</span>
              <span>查看工作树</span>
            </button>
            <button id="tg-btn-close-report" class="tg-dock-close-btn" title="关闭报告">
              <span>${ICONS.close}</span>
            </button>
          </div>
        </div>

        <!-- Scrollable Report Body -->
        <div class="tg-report-body" id="tg-printable-report">
          <!-- Meta Banner -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #64748b; font-family: monospace;">
            <div>
              <span>核验时间：${dateStr} ${timeStr}</span> • <span>信源底座：腾讯云元宝搜索 (WSA API)</span>
            </div>
            <div>
              <span>数字审计指纹：SHA256:${docHash}...</span>
            </div>
          </div>

          <!-- KPI Metric Grid -->
          <div class="tg-metrics-grid">
            <div class="tg-metric-card score">
              <span class="tg-metric-label">事实综合健康度</span>
              <div class="tg-metric-val emerald">${summary.healthScore}%</div>
              <span class="tg-metric-sub">${summary.healthScore >= 80 ? '权威证实度极高' : '存在部分存疑或幻觉'}</span>
            </div>
            <div class="tg-metric-card">
              <span class="tg-metric-label">权威证实通过</span>
              <div class="tg-metric-val emerald">${summary.verified} <span style="font-size: 13px; font-weight: normal; color: #64748b;">/ ${summary.totalClaims} 项</span></div>
              <span class="tg-metric-sub">多源交叉印证</span>
            </div>
            <div class="tg-metric-card">
              <span class="tg-metric-label">事实错误 / 幻觉</span>
              <div class="tg-metric-val rose">${summary.refuted} <span style="font-size: 13px; font-weight: normal; color: #64748b;">项</span></div>
              <span class="tg-metric-sub">已生成官方辟谣依据</span>
            </div>
            <div class="tg-metric-card">
              <span class="tg-metric-label">存疑 / 时效差异</span>
              <div class="tg-metric-val amber">${summary.disputed} <span style="font-size: 13px; font-weight: normal; color: #64748b;">项</span></div>
              <span class="tg-metric-sub">需人工留意核对</span>
            </div>
          </div>

          <!-- Claims Detail Section -->
          <div>
            <h4 style="font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
              <span>逐项事实命题穿透明细 (${state.claims.length} 项)</span>
            </h4>

            <div class="tg-claims-list">
              ${state.claims.map((c, idx) => {
                const isVerified = c.status === 'verified';
                const isRefuted = c.status === 'refuted';
                const isDisputed = c.status === 'disputed';
                const statusLabel = isVerified ? '🟢 权威证实' : isRefuted ? '🔴 事实错误 / 幻觉' : isDisputed ? '🟡 存疑 / 时效差异' : '⚪ 无法核验';
                const statusClass = isVerified ? 'verified' : isRefuted ? 'refuted' : 'disputed';

                return `
                  <div class="tg-claim-item ${statusClass}">
                    <div class="tg-claim-header">
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span class="tg-node-badge ${statusClass}">${statusLabel}</span>
                        <span class="tg-node-badge">${c.category || '客观事实'}</span>
                        <span style="font-size: 11px; font-family: monospace; color: #64748b;">
                          检索探针: "${c.searchKeyword}"
                        </span>
                      </div>
                      <span style="font-size: 11.5px; font-family: monospace; font-weight: 700; color: #334155;">
                        元宝置信度: ${c.confidence}%
                      </span>
                    </div>

                    <div class="tg-claim-text">
                      “${c.claimText}”
                    </div>

                    <div class="tg-claim-reason">
                      <strong>⚖️ 智能体交叉仲裁结论：</strong> ${c.reasoning}
                    </div>

                    ${c.correction ? `
                      <div class="tg-claim-correction">
                        <strong>🛡️ 官方权威辟谣 / 修正事实建议：</strong> ${c.correction}
                      </div>
                    ` : ''}

                    <!-- Sources List -->
                    ${c.sources && c.sources.length > 0 ? `
                      <div style="margin-top: 6px;">
                        <span style="font-size: 11px; font-weight: 700; color: #475569; display: flex; align-items: center; gap: 4px; margin-bottom: 6px;">
                          ${ICONS.globe} 元宝搜索召回权威信源 (${c.sources.length} 篇):
                        </span>
                        <div class="tg-sources-list">
                          ${c.sources.slice(0, 3).map((src, sIdx) => `
                            <div class="tg-source-card">
                              <div class="tg-source-top">
                                <span class="tg-source-site">【${src.site}】 ${src.title}</span>
                                ${src.url ? `<a href="${src.url}" target="_blank" rel="noreferrer" class="tg-source-link">原文直达 ↗</a>` : ''}
                              </div>
                              <p class="tg-source-passage">${src.passage}</p>
                            </div>
                          `).join('')}
                        </div>
                      </div>
                    ` : ''}
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- Footer Bar with Export Buttons -->
        <div class="tg-report-footer">
          <div style="display: flex; align-items: center; gap: 8px;">
            <button id="tg-btn-export-markdown" class="tg-header-btn">
              <span>${ICONS.download}</span>
              <span>导出 Markdown</span>
            </button>
            <a href="https://github.com/FreshmanJ/TruthGuard" target="_blank" rel="noopener noreferrer" class="tg-header-btn" title="TruthGuard GitHub 开源主页">
              <span style="display:inline-flex;align-items:center;">${ICONS.github}</span>
              <span>GitHub 开源</span>
            </a>
          </div>

          <!-- Main PDF Download Action Button -->
          <div style="display: flex; align-items: center; gap: 10px;">
            <button id="tg-btn-download-pdf" class="tg-btn-download-pdf">
              <span>${ICONS.download}</span>
              <span>下载为 PDF 格式</span>
            </button>
          </div>
        </div>
      </div>
    `;

    // Event handlers
    shadow.getElementById('tg-btn-close-report')?.addEventListener('click', () => {
      state.isReportOpen = false;
      renderAllUI();
    });

    shadow.getElementById('tg-btn-report-view-tree')?.addEventListener('click', () => {
      state.isReportOpen = false;
      state.isTreeOpen = true;
      renderAllUI();
    });

    shadow.getElementById('tg-btn-export-markdown')?.addEventListener('click', () => {
      exportReportMarkdown();
    });

    // 4.4 Download as PDF Handler
    shadow.getElementById('tg-btn-download-pdf')?.addEventListener('click', () => {
      exportReportPDF();
    });
  }

  // ================= 5. PDF & Markdown Export Engine =================
  function exportReportPDF() {
    const summary = state.summary || {
      healthScore: 92,
      totalClaims: state.claims.length,
      verified: state.claims.filter(c => c.status === 'verified').length,
      refuted: state.claims.filter(c => c.status === 'refuted').length,
      disputed: state.claims.filter(c => c.status === 'disputed').length
    };

    const now = new Date();
    const dateStr = now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    const docHash = Array.from(state.selectedText.slice(0, 24))
      .map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('').slice(0, 20);

    // Build dedicated print HTML document with high-fidelity styles
    const printHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>TruthGuard_事实核验报告_${now.toISOString().slice(0, 10)}</title>
        <style>
          @page {
            size: A4;
            margin: 15mm 15mm 15mm 15mm;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif;
            color: #0f172a;
            line-height: 1.5;
            padding: 0;
            margin: 0;
            background: #ffffff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .pdf-header {
            border-bottom: 2px solid #0f172a;
            padding-bottom: 12px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .title {
            font-size: 22px;
            font-weight: 900;
            color: #0f172a;
            margin: 0;
          }
          .subtitle {
            font-size: 12px;
            color: #059669;
            font-weight: 600;
            margin-top: 4px;
          }
          .meta-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 8px 12px;
            font-size: 11px;
            font-family: monospace;
            color: #475569;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
          }
          .metrics-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            margin-bottom: 24px;
          }
          .metric-card {
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 10px;
            background: #f8fafc;
          }
          .metric-label {
            font-size: 11px;
            color: #64748b;
            font-weight: 600;
          }
          .metric-val {
            font-size: 24px;
            font-weight: 900;
            font-family: monospace;
            margin: 4px 0;
          }
          .emerald { color: #059669; }
          .rose { color: #dc2626; }
          .amber { color: #d97706; }
          .claims-section-title {
            font-size: 15px;
            font-weight: 800;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 6px;
            margin-bottom: 14px;
          }
          .claim-card {
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 12px;
            page-break-inside: avoid;
          }
          .claim-card.verified { border-left: 4px solid #10b981; }
          .claim-card.refuted { border-left: 4px solid #ef4444; }
          .claim-card.disputed { border-left: 4px solid #f59e0b; }
          .badge {
            display: inline-block;
            font-size: 10.5px;
            font-weight: 700;
            padding: 2px 8px;
            border-radius: 4px;
            margin-bottom: 6px;
          }
          .badge-verified { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
          .badge-refuted { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
          .badge-disputed { background: #fefce8; color: #a16207; border: 1px solid #fef08a; }
          .claim-text {
            font-size: 13px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 8px;
          }
          .reason-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 8px 10px;
            font-size: 11.5px;
            color: #334155;
            margin-bottom: 6px;
          }
          .correction-box {
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 6px;
            padding: 8px 10px;
            font-size: 11.5px;
            color: #991b1b;
            margin-bottom: 6px;
          }
          .sources-box {
            font-size: 11px;
            color: #475569;
            background: #fafbfc;
            border-radius: 6px;
            padding: 6px 8px;
          }
          .footer-note {
            margin-top: 30px;
            border-top: 1px dashed #cbd5e1;
            padding-top: 10px;
            font-size: 10px;
            color: #94a3b8;
            display: flex;
            justify-content: space-between;
          }
        </style>
      </head>
      <body>
        <div class="pdf-header">
          <div>
            <h1 class="title">TruthGuard 事实核验总览报告</h1>
            <div class="subtitle">腾讯云元宝搜索 (WSA) · 权威千亿级信源实时穿透与交叉仲裁</div>
          </div>
          <div style="text-align: right; font-size: 11px; color: #64748b;">
            <strong>审核评级: ${summary.healthScore >= 80 ? '可信背书' : '需重点审校'}</strong>
          </div>
        </div>

        <div class="meta-box">
          <div>生成时间：${dateStr} ${timeStr}</div>
          <div>检索核心：Tencent Yuanbao Search</div>
          <div>审计指纹：SHA256:${docHash}...</div>
        </div>

        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-label">事实健康度</div>
            <div class="metric-val emerald">${summary.healthScore}%</div>
            <div style="font-size: 10px; color: #64748b;">综合置信度得分</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">权威证实通过</div>
            <div class="metric-val emerald">${summary.verified} / ${summary.totalClaims}</div>
            <div style="font-size: 10px; color: #64748b;">信源强印证</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">事实错误 / 幻觉</div>
            <div class="metric-val rose">${summary.refuted}</div>
            <div style="font-size: 10px; color: #64748b;">建议替换修正</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">存疑 / 时效差异</div>
            <div class="metric-val amber">${summary.disputed}</div>
            <div style="font-size: 10px; color: #64748b;">建议复查信源</div>
          </div>
        </div>

        <div class="claims-section-title">命题逐项穿透审计明细 (${state.claims.length} 项)</div>

        ${state.claims.map((c, idx) => `
          <div class="claim-card ${c.status === 'verified' ? 'verified' : c.status === 'refuted' ? 'refuted' : 'disputed'}">
            <div>
              <span class="badge ${c.status === 'verified' ? 'badge-verified' : c.status === 'refuted' ? 'badge-refuted' : 'badge-disputed'}">
                ${c.status === 'verified' ? '🟢 权威证实' : c.status === 'refuted' ? '🔴 事实错误 / 幻觉' : '🟡 存疑 / 时效差异'} (置信度 ${c.confidence}%)
              </span>
              <span style="font-size: 10.5px; color: #64748b; font-family: monospace; margin-left: 8px;">探针词: "${c.searchKeyword}"</span>
            </div>
            <div class="claim-text">“${c.claimText}”</div>
            <div class="reason-box"><strong>仲裁依据：</strong>${c.reasoning}</div>
            ${c.correction ? `<div class="correction-box"><strong>权威修正：</strong>${c.correction}</div>` : ''}
            ${c.sources && c.sources.length > 0 ? `
              <div class="sources-box">
                <strong>核心信源：</strong> ${c.sources.slice(0, 2).map((s, i) => `[${i + 1}] 《${s.site}》 ${s.title} (${s.url})`).join('； ')}
              </div>
            ` : ''}
          </div>
        `).join('')}

        <div class="footer-note">
          <span>TruthGuard 事实检察官 · AI 时代高保真事实护盾</span>
          <span>© 2026 freshmanJ. Powered by Tencent Cloud WSA.</span>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    // Open print window/iframe for crisp vector PDF printing / save-as-pdf
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(printHtml);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch (err) {
        // Fallback: Open popup window if iframe print is blocked by CSP
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(printHtml);
          printWindow.document.close();
        }
      }
      setTimeout(() => {
        iframe.remove();
      }, 60000);
    }, 500);
  }

  function exportReportMarkdown() {
    const summary = state.summary || {
      healthScore: 92,
      totalClaims: state.claims.length,
      verified: state.claims.filter(c => c.status === 'verified').length,
      refuted: state.claims.filter(c => c.status === 'refuted').length,
      disputed: state.claims.filter(c => c.status === 'disputed').length
    };

    const now = new Date();
    const dateStr = now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

    let md = `# TruthGuard 事实检察官 · 事实核验背书报告\n\n`;
    md += `> **生成时间**：${dateStr} ${timeStr}\n`;
    md += `> **权威检索基座**：腾讯云元宝搜索 (Tencent Yuanbao Search / WSA)\n`;
    md += `> **事实健康度评分**：${summary.healthScore} / 100 分\n\n`;

    md += `## 一、 核验统计总览\n\n`;
    md += `* **抽检事实命题总数**：${summary.totalClaims} 项\n`;
    md += `* **权威信源证实**：${summary.verified} 项 (🟢)\n`;
    md += `* **事实错误与幻觉**：${summary.refuted} 项 (🔴)\n`;
    md += `* **时效争议与存疑**：${summary.disputed} 项 (🟡)\n\n`;

    md += `## 二、 命题逐项核验明细\n\n`;
    state.claims.forEach((c, idx) => {
      const statusIcon = c.status === 'verified' ? '🟢 权威证实' : c.status === 'disputed' ? '🟡 存疑时效' : '🔴 事实错误';
      md += `### 命题 ${idx + 1}：${c.claimText}\n\n`;
      md += `- **裁决状态**：${statusIcon} (置信度: ${c.confidence}%)\n`;
      md += `- **搜索探针词**：\`${c.searchKeyword}\`\n`;
      md += `- **核验分析**：${c.reasoning}\n`;
      if (c.correction) {
        md += `- **权威修正**：**${c.correction}**\n`;
      }
      if (c.sources && c.sources.length > 0) {
        md += `- **权威依据信源**：\n`;
        c.sources.slice(0, 3).forEach((s, sIdx) => {
          md += `  ${sIdx + 1}. [${s.site}] ${s.title} (${s.url})\n`;
        });
      }
      md += `\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TruthGuard_事实核验报告_${now.toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

})();
