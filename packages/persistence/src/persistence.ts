/**
 * Persistence contracts promoted from the vertical hardening work.
 *
 * The platform owns contracts and safety semantics, not a database or
 * provider integration. Applications implement these interfaces.
 */

export type RepositoryErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "CONFLICT"
  | "NOT_CONFIGURED"
  | "PERSISTENCE_FAILURE";

export class RepositoryError extends Error {
  readonly code: RepositoryErrorCode;
  constructor(code: RepositoryErrorCode, message: string) {
    super(message);
    this.name = "RepositoryError";
    this.code = code;
  }
}

export interface OwnedRecord {
  readonly id: string;
  readonly ownerId: string;
  readonly updatedAt: string;
}

export interface VersionedRecord extends OwnedRecord {
  readonly version: number;
}

export interface OwnedRepository<T extends OwnedRecord> {
  load(id: string, ownerId: string): Promise<T | null>;
  save(record: T): Promise<T>;
  delete(id: string, ownerId: string): Promise<boolean>;
  exists(id: string, ownerId: string): Promise<boolean>;
}

export interface AuditEntry {
  readonly id: string;
  readonly ownerId: string;
  readonly recordId: string;
  readonly action: string;
  readonly actorId?: string;
  readonly createdAt: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface AppendOnlyAuditStore {
  append(entry: AuditEntry): Promise<void>;
  list(recordId: string, ownerId: string): Promise<readonly AuditEntry[]>;
}

export interface SaveState<T> {
  readonly status: "idle" | "saving" | "saved" | "failed";
  readonly value?: T;
  readonly error?: unknown;
  readonly retryCount: number;
}

export function requireOwnerId(ownerId: string | undefined | null): string {
  if (!ownerId || !ownerId.trim()) {
    throw new RepositoryError("VALIDATION_ERROR", "ownerId is required for persistence access");
  }
  return ownerId.trim();
}

export function assertOwner(recordOwnerId: string, requestedOwnerId: string): void {
  requireOwnerId(requestedOwnerId);
  if (recordOwnerId !== requestedOwnerId) {
    throw new RepositoryError("UNAUTHORIZED", "Record is not owned by the requested owner");
  }
}

/**
 * Merge append-only version history so a stale write cannot erase versions
 * that were created by a newer writer.
 */
export function mergeAppendOnlyVersions<T extends { id: string; version: number }>(
  existing: readonly T[],
  incoming: readonly T[],
): T[] {
  const byId = new Map<string, T>();
  for (const version of existing) byId.set(version.id, version);
  for (const version of incoming) {
    if (!byId.has(version.id)) byId.set(version.id, version);
  }
  return [...byId.values()].sort((a, b) => a.version - b.version || a.id.localeCompare(b.id));
}

export async function executeSave<T>(
  save: () => Promise<T>,
  retryCount = 0,
): Promise<SaveState<T>> {
  try {
    const value = await save();
    return { status: "saved", value, retryCount: 0 };
  } catch (error) {
    return { status: "failed", error, retryCount: retryCount + 1 };
  }
}

export function createSavingState<T>(retryCount = 0): SaveState<T> {
  return { status: "saving", retryCount };
}
