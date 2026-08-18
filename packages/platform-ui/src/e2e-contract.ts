import { UI_CAPABILITIES, allCapabilitiesReady, type CapabilityHealth } from './ui-capabilities.js';
export function assertUiContract(health: readonly CapabilityHealth[]): void {
  if (!allCapabilitiesReady(health)) {
    const missing = UI_CAPABILITIES.filter((name) => !health.some((x) => x.capability === name && x.state === 'ready'));
    throw new Error(`UI capabilities not ready: ${missing.join(', ')}`);
  }
}
