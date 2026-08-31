/**
 * Fulfillment adapter — concrete MailMyPDF mailing implementation.
 *
 * Centralizes:
 *   - The MailMyPDF API call (submit a mailing)
 *   - Idempotency (prevent duplicate submissions for the same case)
 *   - Result recording (tracking number, proof ID)
 *
 * No vertical implements its own fulfillment path. This is the only
 * entry point from "approved" to "submitted".
 */

import type { PlatformId } from "@mailmypdf/core";
import type { CaseRepository, ApprovedPacket } from "./repository.js";

export interface FulfillmentRequest {
  caseId: PlatformId;
  ownerId: PlatformId;
  packet: ApprovedPacket;
  workflowId: string;
}

export interface FulfillmentResult {
  provider: string;
  submissionId: string;
  trackingNumber?: string | undefined;
  proofId?: string | undefined;
}

export interface FulfillmentClient {
  submit(request: FulfillmentRequest): Promise<FulfillmentResult>;
}

export interface MailMyPDFConfig {
  endpoint: string;
  apiKey: string;
}

export function createMailMyPDFFulfillment(
  fetcher: typeof fetch,
  config: MailMyPDFConfig,
  repo: CaseRepository,
): FulfillmentClient {
  return {
    async submit(request): Promise<FulfillmentResult> {
      // Idempotency: check if this case was already submitted
      const existing = await repo.getById(request.caseId, request.ownerId);
      if (existing?.status === "submitted" || existing?.status === "tracking" || existing?.status === "completed") {
        // Already submitted — return existing result from payload
        const priorResult = existing.payload?.fulfillmentResult as FulfillmentResult | undefined;
        if (priorResult) return priorResult;
        throw new Error("Case was already submitted but no fulfillment result was found.");
      }

      if (existing?.status !== "approved" && existing?.status !== "queued") {
        throw new Error(`Case must be approved or queued before fulfillment. Current: ${existing?.status}`);
      }

      if (!config.endpoint || !config.apiKey) {
        throw new Error("MailMyPDF fulfillment configuration is incomplete.");
      }

      // Transition to queued (if not already)
      if (existing?.status === "approved") {
        await repo.updateStatus(request.caseId, request.ownerId, "approved", "queued");
      }

      // Verify document hash matches what was approved
      const packet = request.packet;
      const currentHash = await sha256Hex(new TextEncoder().encode(packet.finalLetter));
      if (currentHash !== packet.documentHash) {
        throw new Error("Document integrity violation: letter hash does not match approved hash.");
      }

      // Submit to MailMyPDF
      const response = await fetcher(`${config.endpoint.replace(/\/$/, "")}/api/v1/mail`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${config.apiKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          requestId: request.caseId,
          workflowId: request.workflowId,
          recipient: {
            name: packet.recipient.name,
            address1: packet.recipient.address1,
            address2: packet.recipient.address2,
            city: packet.recipient.city,
            state: packet.recipient.state,
            postalCode: packet.recipient.zip,
          },
          document: {
            filename: `${request.workflowId}-${request.caseId}.pdf`,
            contentBase64: btoa(packet.finalLetter),
            sha256: packet.documentHash,
          },
          mailingClass: packet.mailingMethod,
        }),
      });

      if (!response.ok) {
        await repo.updateStatus(request.caseId, request.ownerId, "queued", "failed");
        throw new Error(`MailMyPDF fulfillment failed with HTTP ${response.status}`);
      }

      const payload = (await response.json()) as Partial<FulfillmentResult>;
      if (!payload.submissionId || !payload.provider) {
        await repo.updateStatus(request.caseId, request.ownerId, "queued", "failed");
        throw new Error("MailMyPDF fulfillment response is missing required submission data.");
      }

      const result: FulfillmentResult = {
        provider: payload.provider,
        submissionId: payload.submissionId,
        trackingNumber: payload.trackingNumber,
        proofId: payload.proofId,
      };

      // Record the fulfillment event for audit
      await repo.recordAuditEvent({
        caseId: request.caseId,
        eventType: "fulfillment_submitted",
        actor: "system",
        payload: {
          submissionId: result.submissionId,
          provider: result.provider,
          trackingNumber: result.trackingNumber,
          documentHash: packet.documentHash,
        },
      });

      // Transition to submitted
      await repo.updateStatus(request.caseId, request.ownerId, "queued", "submitted", {
        payload: { fulfillmentResult: result },
      });

      return result;
    },
  };
}

async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", bytes as BufferSource);
  return Array.from(new Uint8Array(digest), (v) => v.toString(16).padStart(2, "0")).join("");
}
