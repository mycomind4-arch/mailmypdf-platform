import type { BrowserEvidence } from "./index.js";

export interface BrowserActionRecord {
  actionId: string;
  sessionId: string;
  action: "navigate" | "inspect" | "click" | "type" | "screenshot";
  url: string;
  timestamp: string;
  adapter: string;
  risk: "read" | "interactive" | "consequential";
  approved: boolean;
}

export function createEvidence(input: Omit<BrowserEvidence, "evidenceId">): BrowserEvidence {
  return {
    evidenceId: `browser-${crypto.randomUUID()}`,
    ...input,
  };
}

export function redactSensitiveUrl(url: string): string {
  const parsed = new URL(url);
  parsed.username = "";
  parsed.password = "";
  for (const key of [...parsed.searchParams.keys()]) {
    if (/token|secret|key|code|session|auth/i.test(key)) parsed.searchParams.set(key, "[REDACTED]");
  }
  return parsed.toString();
}
