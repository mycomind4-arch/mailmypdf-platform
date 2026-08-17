import type {
  BrowserIntelligence,
  BrowserPolicy,
  BrowserSession,
  BrowserSessionInput,
} from "./index.js";

export interface BrowserAdapterMetadata {
  name: string;
  version: string;
  runtime: "node" | "worker" | "isolated-worker" | "other";
}

export interface BrowserAdapter extends BrowserIntelligence {
  readonly metadata: BrowserAdapterMetadata;
  validatePolicy(policy: BrowserPolicy): void;
  createSession(input: BrowserSessionInput): Promise<BrowserSession>;
}
