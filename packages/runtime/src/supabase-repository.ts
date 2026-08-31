/**
 * Supabase adapter for the CaseRepository interface.
 *
 * Implements the shared repository contract using Supabase as the
 * storage backend. This is the adapter used by appeal-mail, notice-respond,
 * and any other Supabase-based vertical.
 *
 * Table schema (create via migration):
 *   cases:
 *     id uuid primary key
 *     workflow_id text not null
 *     vertical_id text not null
 *     owner_id uuid not null
 *     status text not null default 'draft'
 *     title text not null
 *     payload jsonb default '{}'
 *     evidence jsonb default '[]'
 *     packet jsonb
 *     version int not null default 1
 *     created_at timestamptz default now()
 *     updated_at timestamptz default now()
 *
 *   audit_events:
 *     id uuid primary key
 *     case_id uuid not null references cases(id)
 *     event_type text not null
 *     actor text not null
 *     actor_id text
 *     payload jsonb default '{}'
 *     event_hash text not null
 *     occurred_at timestamptz default now()
 */

import type { PlatformId } from "./types.js";
import type { CaseState } from "./case-lifecycle.js";
import type { CaseRecord, CaseRepository, AuditEvent, EvidenceItem, ApprovedPacket, CreateCaseInput } from "./repository.js";

/**
 * Supabase client shape — only the methods we need.
 * This avoids a hard dependency on @supabase/supabase-js.
 */
export interface SupabaseLike {
  from(table: string): SupabaseTableBuilder;
}

interface SupabaseTableBuilder {
  select(columns?: string): SupabaseFilterBuilder;
  insert(row: Record<string, unknown> | Record<string, unknown>[]): SupabaseFilterBuilder;
  update(row: Record<string, unknown>): SupabaseFilterBuilder;
}

interface SupabaseFilterBuilder {
  eq(column: string, value: unknown): SupabaseFilterBuilder;
  order(column: string, options?: { ascending?: boolean }): SupabaseFilterBuilder;
  range(from: number, to: number): SupabaseFilterBuilder;
  single(): Promise<{ data: Record<string, unknown> | null; error: unknown }>;
  then<T = { data: unknown[] | null; error: unknown }>(resolve: (v: T) => T, reject?: (e: unknown) => T): T;
}

function toCaseRecord(row: Record<string, unknown>): CaseRecord {
  return {
    id: String(row.id) as PlatformId,
    workflowId: String(row.workflow_id),
    verticalId: String(row.vertical_id),
    ownerId: String(row.owner_id) as PlatformId,
    status: String(row.status) as CaseState,
    title: String(row.title),
    payload: (row.payload as Record<string, unknown>) ?? {},
    evidence: (row.evidence as EvidenceItem[]) ?? [],
    packet: row.packet as ApprovedPacket | undefined,
    version: Number(row.version) ?? 1,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function toAuditEvent(row: Record<string, unknown>): AuditEvent {
  return {
    id: String(row.id) as PlatformId,
    caseId: String(row.case_id) as PlatformId,
    eventType: String(row.event_type),
    actor: String(row.actor) as AuditEvent["actor"],
    actorId: row.actor_id as string | undefined,
    payload: (row.payload as Record<string, unknown>) ?? {},
    eventHash: String(row.event_hash),
    occurredAt: String(row.occurred_at),
  };
}

export function createSupabaseRepository(client: SupabaseLike): CaseRepository {
  return {
    async create(input: CreateCaseInput) {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      await (client.from("cases").insert({
        id,
        workflow_id: input.workflowId,
        vertical_id: input.verticalId,
        owner_id: input.ownerId,
        status: "draft",
        title: input.title,
        payload: input.payload ?? {},
        evidence: [],
        version: 1,
        created_at: now,
        updated_at: now,
      }) as SupabaseFilterBuilder).then(
        () => ({ data: null, error: null }),
        (e: unknown) => ({ data: null, error: e }),
      );
      return { id: id as PlatformId };
    },

    async getById(id, ownerId) {
      const { data, error } = await client
        .from("cases")
        .select("*")
        .eq("id", id)
        .eq("owner_id", ownerId)
        .single();
      if (error || !data) return null;
      return toCaseRecord(data);
    },

    async listByOwner(ownerId, options = {}) {
      let query = client.from("cases").select("*").eq("owner_id", ownerId) as SupabaseFilterBuilder;
      if (options.workflowId) query = query.eq("workflow_id", options.workflowId);
      if (options.status) query = query.eq("status", options.status);
      const limit = options.limit ?? 50;
      const offset = options.offset ?? 0;
      query = query.order("created_at", { ascending: false }).range(offset, offset + limit) as SupabaseFilterBuilder;
      const result = await (query as unknown as Promise<{ data: Record<string, unknown>[] | null; error: unknown }>)
        .then(
          (r) => r,
          (e) => ({ data: null, error: e }),
        );
      const records = (result.data ?? []).map(toCaseRecord);
      return { records, hasMore: records.length === limit };
    },

    async updateStatus(id, ownerId, from, to, patch) {
      const now = new Date().toISOString();
      const updateData: Record<string, unknown> = { status: to, updated_at: now };
      if (patch?.payload) updateData.payload = patch.payload;
      if (patch?.packet) updateData.packet = patch.packet;

      const result = await (client
        .from("cases")
        .update(updateData)
        .eq("id", id)
        .eq("owner_id", ownerId)
        .eq("status", from) as SupabaseFilterBuilder)
        .then(
          (r) => r,
          (e) => ({ data: null, error: e }),
        ) as { data: Record<string, unknown> | null; error: unknown };

      if (result.error || !result.data) {
        throw new Error("Case update failed — case may not exist or status changed concurrently.");
      }
      return toCaseRecord(result.data);
    },

    async updatePayload(id, ownerId, payload, expectedVersion) {
      const now = new Date().toISOString();
      const result = await (client
        .from("cases")
        .update({ payload, updated_at: now, version: expectedVersion + 1 })
        .eq("id", id)
        .eq("owner_id", ownerId)
        .eq("version", expectedVersion) as SupabaseFilterBuilder)
        .then(
          (r) => r,
          (e) => ({ data: null, error: e }),
        ) as { data: Record<string, unknown> | null; error: unknown };

      if (result.error || !result.data) {
        throw new Error("Payload update failed — version conflict.");
      }
      return toCaseRecord(result.data);
    },

    async addEvidence(id, ownerId, item) {
      // Read current evidence, append, write back
      const current = await this.getById(id, ownerId);
      if (!current) throw new Error("Case not found.");
      const evidence = [...current.evidence, item];
      const now = new Date().toISOString();
      await (client
        .from("cases")
        .update({ evidence, updated_at: now })
        .eq("id", id)
        .eq("owner_id", ownerId)
        .eq("version", current.version) as SupabaseFilterBuilder)
        .then(
          () => ({ data: null, error: null }),
          (e: unknown) => ({ data: null, error: e }),
        );
    },

    async setPacket(id, ownerId, packet, expectedVersion) {
      const now = new Date().toISOString();
      const result = await (client
        .from("cases")
        .update({ packet, updated_at: now, version: expectedVersion + 1 })
        .eq("id", id)
        .eq("owner_id", ownerId)
        .eq("version", expectedVersion) as SupabaseFilterBuilder)
        .then(
          (r) => r,
          (e) => ({ data: null, error: e }),
        ) as { data: Record<string, unknown> | null; error: unknown };

      if (result.error || !result.data) {
        throw new Error("Packet update failed — version conflict.");
      }
      return toCaseRecord(result.data);
    },

    async recordAuditEvent(input) {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      // Compute event hash for chain integrity
      const hashInput = `${input.caseId}|${input.eventType}|${now}|${JSON.stringify(input.payload)}`;
      const hashBytes = new TextEncoder().encode(hashInput);
      const digest = await crypto.subtle.digest("SHA-256", hashBytes as BufferSource);
      const eventHash = Array.from(new Uint8Array(digest), (v) => v.toString(16).padStart(2, "0")).join("");

      await (client.from("audit_events").insert({
        id,
        case_id: input.caseId,
        event_type: input.eventType,
        actor: input.actor,
        actor_id: input.actorId ?? null,
        payload: input.payload,
        event_hash: eventHash,
        occurred_at: now,
      }) as SupabaseFilterBuilder).then(
        () => ({ data: null, error: null }),
        (e: unknown) => ({ data: null, error: e }),
      );

      return {
        id: id as PlatformId,
        caseId: input.caseId,
        eventType: input.eventType,
        actor: input.actor,
        actorId: input.actorId,
        payload: input.payload,
        eventHash,
        occurredAt: now,
      };
    },

    async getAuditTrail(caseId, ownerId) {
      // Verify ownership first
      const case_ = await this.getById(caseId, ownerId);
      if (!case_) return [];
      const result = await (client
        .from("audit_events")
        .select("*")
        .eq("case_id", caseId)
        .order("occurred_at", { ascending: true }) as SupabaseFilterBuilder)
        .then(
          (r) => r,
          (e) => ({ data: null, error: e }),
        ) as { data: Record<string, unknown>[] | null; error: unknown };
      return (result.data ?? []).map(toAuditEvent);
    },
  };
}
