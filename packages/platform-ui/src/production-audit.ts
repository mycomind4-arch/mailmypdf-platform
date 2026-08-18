import { UI_CAPABILITIES, type CapabilityHealth } from './ui-capabilities.js';
export interface ProductionUiAudit { ready: boolean; checkedAt: string; missing: string[]; }
export function auditProductionUi(health: readonly CapabilityHealth[]): ProductionUiAudit {
  const missing = UI_CAPABILITIES.filter((name) => !health.some((x) => x.capability === name && x.state === 'ready'));
  return { ready: missing.length === 0, checkedAt: new Date().toISOString(), missing };
}
