/**
 * @mailmypdf/pricing
 *
 * Canonical pricing engine for the MailMyPDF ecosystem.
 *
 * This package is the SINGLE SOURCE OF TRUTH for:
 * - Mailing service prices (standard / certified / registered)
 * - Workflow pricing bands (FREE → HIGH_STAKES)
 * - Workflow pricing profiles (preparation fee, included pages, mail policy)
 * - Fulfillment cost configuration (Lob/USPS pass-through costs)
 * - Quote calculation (deterministic, server-authoritative)
 * - Workflow capabilities (which mail services a workflow offers)
 * - Commercial status (feature flags for checkout gating)
 * - Discount validation (server-side)
 *
 * PRINCIPLES:
 * - The client never controls price. The server calculates every quote.
 * - The same inputs must produce the same quote (deterministic).
 * - Quote snapshots are persisted at checkout time.
 * - Only workflows with commercial_status === 'production' can accept payment.
 * - Lob/USPS costs are centralized here, not scattered across workflows.
 *
 * Backward compatibility: All existing exports (PRICES, LABELS, MAIL_TYPE_MAP,
 * PRICING_KEY_MAP, getPriceCents, getPriceForMailType, getLabel,
 * isValidPricingKey) are preserved unchanged.
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type PricingKey = "standard" | "certified" | "registered";

export type MailType = "first_class" | "certified" | "certified_return_receipt" | "registered";

export type MailClass = "standard" | "certified" | "registered";

export type PricingBand =
  | "FREE"
  | "ESSENTIAL"
  | "STANDARD"
  | "ADVANCED"
  | "HIGH_STAKES";

export type CommercialStatus = "disabled" | "internal" | "test" | "production";

export interface WorkflowCapabilities {
  digitalDelivery: boolean;
  basicMail: boolean;
  certifiedMail: boolean;
  returnReceipt: boolean;
  registeredMail: boolean;
}

export interface WorkflowPricingProfile {
  /** Stable workflow identifier (e.g., "cp2000-response") */
  workflowId: string;
  /** Vertical slug (e.g., "notice-respond") */
  verticalId: string;
  /** Pricing band */
  band: PricingBand;
  /** Base preparation fee in US cents (0 for FREE workflows) */
  basePriceCents: number;
  /** Currency code (always "usd" for now) */
  currency: string;
  /** Number of pages included in the base price (for mail-inclusive workflows) */
  includedPages: number;
  /** Whether basic mail is included in the base price */
  includedMail: "none" | "standard";
  /** Mail services available for this workflow */
  availableMailServices: MailClass[];
  /** Per-page charge for response pages beyond includedPages (cents) */
  extraPageRateCents: number;
  /** Per-page charge for supporting/evidence pages (cents) */
  supportingPageRateCents: number;
  /** Certified mail surcharge (cents, on top of standard mail) */
  certifiedMailSurchargeCents: number;
  /** Registered mail surcharge (cents, on top of standard mail) */
  registeredMailSurchargeCents: number;
  /** Commercial status — only 'production' can accept payment */
  commercialStatus: CommercialStatus;
  /** What this workflow can do (mail capability constraints) */
  capabilities: WorkflowCapabilities;
  /** Human-readable reason for the price (internal, not shown to customers) */
  pricingRationale?: string;
}

export interface FulfillmentCostConfig {
  /** Lob cost per piece for standard mail (cents) */
  standardCostCents: number;
  /** Lob cost per piece for certified mail (cents) */
  certifiedCostCents: number;
  /** Lob cost per piece for registered mail (cents) */
  registeredCostCents: number;
  /** Additional per-page cost for extra pages (cents) */
  extraPageCostCents: number;
  /** Margin added on top of Lob cost (cents) */
  mailMarginCents: number;
}

export interface QuoteInput {
  /** Workflow ID to price */
  workflowId: string;
  /** Vertical slug */
  verticalId: string;
  /** Actual page count of the final document (server-determined) */
  actualPages: number;
  /** Number of supporting/evidence pages (separate from response pages) */
  supportingPages?: number;
  /** Selected mail class (or undefined for digital-only) */
  mailClass?: MailClass;
  /** Discount code (validated server-side) */
  discountCode?: string;
}

export interface Quote {
  workflowId: string;
  verticalId: string;
  band: PricingBand;
  basePriceCents: number;
  includedPages: number;
  actualPages: number;
  includedMailValue: number;
  extraPageCost: number;
  supportingPageCost: number;
  mailService: MailClass | "none";
  mailServiceCost: number;
  mailUpgradeCost: number;
  discountCents: number;
  discountCode: string | null;
  subtotalCents: number;
  totalCents: number;
  currency: string;
  commercialStatus: CommercialStatus;
  capabilities: WorkflowCapabilities;
  /** ISO timestamp of quote creation */
  quotedAt: string;
}

export interface DiscountConfig {
  code: string;
  type: "percentage" | "fixed";
  /** Percentage (0-100) or fixed amount in cents */
  value: number;
  /** Workflow IDs this discount applies to (empty = all) */
  applicableWorkflowIds?: string[];
  /** Maximum uses (null = unlimited) */
  maxUses?: number | null;
  /** Expiration date (ISO) */
  expiresAt?: string | null;
  active: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIL PRICING (backward-compatible with existing exports)
// ═══════════════════════════════════════════════════════════════════════════

export const PRICES: Record<PricingKey, number> = {
  standard: 499,
  certified: 1494,
  registered: 3249,
} as const;

export const LABELS: Record<PricingKey, string> = {
  standard: "Standard Mailing",
  certified: "Certified Mailing",
  registered: "Registered Mailing",
} as const;

export const MAIL_TYPE_MAP: Record<PricingKey, MailType> = {
  standard: "first_class",
  certified: "certified",
  registered: "registered",
} as const;

export const PRICING_KEY_MAP: Record<MailType, PricingKey> = {
  first_class: "standard",
  certified: "certified",
  certified_return_receipt: "certified",
  registered: "registered",
} as const;

export function getPriceCents(key: PricingKey): number {
  const price = PRICES[key];
  if (price === undefined) throw new Error(`Unknown pricing key: ${key}`);
  return price;
}

export function getPriceForMailType(mailType: MailType): number {
  const key = PRICING_KEY_MAP[mailType];
  return getPriceCents(key);
}

export function getLabel(key: PricingKey): string {
  return LABELS[key] ?? key;
}

export function isValidPricingKey(key: string): key is PricingKey {
  return key in PRICES;
}

// ═══════════════════════════════════════════════════════════════════════════
// BAND DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

export const BAND_RANGES: Record<PricingBand, { min: number; max: number }> = {
  FREE: { min: 0, max: 0 },
  ESSENTIAL: { min: 499, max: 1499 },
  STANDARD: { min: 1999, max: 3999 },
  ADVANCED: { min: 4999, max: 8999 },
  HIGH_STAKES: { min: 9999, max: 14999 },
};

export const BAND_LABELS: Record<PricingBand, string> = {
  FREE: "Free",
  ESSENTIAL: "Essential",
  STANDARD: "Standard",
  ADVANCED: "Advanced",
  HIGH_STAKES: "High Stakes",
};

// ═══════════════════════════════════════════════════════════════════════════
// FULFILLMENT COST CONFIGURATION (centralized — update here, not in workflows)
// ═══════════════════════════════════════════════════════════════════════════

export const FULFILLMENT_COSTS: FulfillmentCostConfig = {
  standardCostCents: 105,    // ~$1.05 per piece (USPS First-Class 1oz)
  certifiedCostCents: 695,   // $6.95 per piece (USPS Certified Mail)
  registeredCostCents: 2450, // $24.50 per piece (USPS Registered Mail)
  extraPageCostCents: 5,     // ~$0.05 per extra page (USPS additional ounce)
  mailMarginCents: 300,      // $3.00 margin on premium mail services
};

// Customer-facing mail prices (derived from fulfillment costs + margin)
export const MAIL_CLASS_PRICES: Record<MailClass, number> = {
  standard: 499,    // $4.99
  certified: FULFILLMENT_COSTS.certifiedCostCents + FULFILLMENT_COSTS.mailMarginCents, // $9.95
  registered: FULFILLMENT_COSTS.registeredCostCents + FULFILLMENT_COSTS.mailMarginCents, // $27.50
};

// For backward compatibility: certified customer price includes base + surcharge
// The existing PRICES constant uses $14.94 for certified (includes base mailing $4.99 + surcharge $9.95)
// and $32.49 for registered ($4.99 + $27.50)
// MAIL_CLASS_PRICES represents the SURCHARGE on top of standard mail.
// The full mail price = PRICES[standard] + MAIL_CLASS_PRICES[mailClass] for premium,
// or just PRICES[standard] for standard.

export function getMailPrice(mailClass: MailClass): number {
  if (mailClass === "standard") return PRICES.standard;
  return PRICES.standard + MAIL_CLASS_PRICES[mailClass];
}

export function getMailSurcharge(mailClass: MailClass): number {
  if (mailClass === "standard") return 0;
  return MAIL_CLASS_PRICES[mailClass];
}

export function getMailCost(mailClass: MailClass): number {
  switch (mailClass) {
    case "standard": return FULFILLMENT_COSTS.standardCostCents;
    case "certified": return FULFILLMENT_COSTS.certifiedCostCents;
    case "registered": return FULFILLMENT_COSTS.registeredCostCents;
  }
}

export function getMailMargin(mailClass: MailClass): number {
  return getMailPrice(mailClass) - getMailCost(mailClass);
}

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT CAPABILITIES
// ═══════════════════════════════════════════════════════════════════════════

export const DEFAULT_CAPABILITIES: WorkflowCapabilities = {
  digitalDelivery: true,
  basicMail: true,
  certifiedMail: true,
  returnReceipt: true,
  registeredMail: true,
};

export const DIGITAL_ONLY_CAPABILITIES: WorkflowCapabilities = {
  digitalDelivery: true,
  basicMail: false,
  certifiedMail: false,
  returnReceipt: false,
  registeredMail: false,
};

// ═══════════════════════════════════════════════════════════════════════════
// WORKFLOW PRICING CATALOG
// ═══════════════════════════════════════════════════════════════════════════

const ALL_MAIL_SERVICES: MailClass[] = ["standard", "certified", "registered"];
const STANDARD_MAIL_ONLY: MailClass[] = ["standard"];
const STANDARD_AND_CERTIFIED: MailClass[] = ["standard", "certified"];

const STANDARD_INCLUDED_PAGES = 0;
const ESSENTIAL_INCLUDED_PAGES = 3;
const ADVANCED_INCLUDED_PAGES = 8;

const profile = (
  workflowId: string,
  verticalId: string,
  band: PricingBand,
  basePriceCents: number,
  opts: {
    includedPages?: number;
    includedMail?: "none" | "standard";
    availableMailServices?: MailClass[];
    extraPageRateCents?: number;
    supportingPageRateCents?: number;
    commercialStatus?: CommercialStatus;
    capabilities?: WorkflowCapabilities;
    pricingRationale?: string;
  } = {},
): WorkflowPricingProfile => ({
  workflowId,
  verticalId,
  band,
  basePriceCents,
  currency: "usd",
  includedPages: opts.includedPages ?? (band === "ADVANCED" || band === "HIGH_STAKES" ? ADVANCED_INCLUDED_PAGES : band === "FREE" ? 0 : ESSENTIAL_INCLUDED_PAGES),
  includedMail: opts.includedMail ?? (band === "ADVANCED" || band === "HIGH_STAKES" ? "standard" : "none"),
  availableMailServices: opts.availableMailServices ?? ALL_MAIL_SERVICES,
  extraPageRateCents: opts.extraPageRateCents ?? 40,
  supportingPageRateCents: opts.supportingPageRateCents ?? 25,
  certifiedMailSurchargeCents: getMailSurcharge("certified"),
  registeredMailSurchargeCents: getMailSurcharge("registered"),
  commercialStatus: opts.commercialStatus ?? "production",
  capabilities: opts.capabilities ?? DEFAULT_CAPABILITIES,
  pricingRationale: opts.pricingRationale ?? "",
});

// ── Core Mail (mailmypdf) ──────────────────────────────────────────────────

const mailmypdfProfiles: WorkflowPricingProfile[] = [
  profile("mail-a-pdf", "mailmypdf", "FREE", 0, {
    pricingRationale: "Commodity mailing tool — acquisition funnel",
    commercialStatus: "production",
  }),
  profile("write-a-letter", "mailmypdf", "FREE", 0, {
    pricingRationale: "Basic text to PDF — acquisition funnel",
    commercialStatus: "production",
  }),
  profile("send-a-letter", "mailmypdf", "ESSENTIAL", 499, {
    includedMail: "standard",
    includedPages: 2,
    pricingRationale: "Simple letter mailing — covers standard mail cost",
    commercialStatus: "production",
  }),
  profile("templates", "mailmypdf", "FREE", 0, {
    capabilities: DIGITAL_ONLY_CAPABILITIES,
    availableMailServices: [],
    pricingRationale: "Template library — SEO traffic driver",
    commercialStatus: "production",
  }),
  profile("future-self", "mailmypdf", "FREE", 0, {
    availableMailServices: STANDARD_AND_CERTIFIED,
    pricingRationale: "Novelty tool — social sharing potential",
    commercialStatus: "production",
  }),
  profile("proof-of-mailing", "mailmypdf", "ESSENTIAL", 499, {
    includedMail: "standard",
    includedPages: 2,
    pricingRationale: "Proof of mailing — covers standard mail cost with tracking",
    commercialStatus: "production",
  }),
  profile("proof-of-service", "mailmypdf", "ESSENTIAL", 499, {
    includedMail: "standard",
    includedPages: 2,
    availableMailServices: STANDARD_AND_CERTIFIED,
    pricingRationale: "Proof of service — covers standard mail with legal proof",
    commercialStatus: "production",
  }),
];

// ── Notice Respond ──────────────────────────────────────────────────────────

const noticeRespondProfiles: WorkflowPricingProfile[] = [
  profile("cp2000-response", "notice-respond", "ADVANCED", 6999, {
    includedMail: "standard",
    pricingRationale: "Specialized IRS CP2000 discrepancy analysis with evidence mapping, findings extraction, strategy generation, and draft validation",
    commercialStatus: "production",
  }),
  profile("cp14-response", "notice-respond", "ADVANCED", 5999, {
    includedMail: "standard",
    pricingRationale: "IRS CP14 authority gate with deadline extraction and strategy generation",
    commercialStatus: "production",
  }),
  profile("cp504-response", "notice-respond", "ADVANCED", 5999, {
    includedMail: "standard",
    pricingRationale: "IRS levy/lien notice with urgency analysis and remediation strategy",
    commercialStatus: "production",
  }),
  profile("cp523-response", "notice-respond", "ADVANCED", 5999, {
    includedMail: "standard",
    pricingRationale: "IRS installment agreement default with remediation strategy",
    commercialStatus: "production",
  }),
  profile("irs-notice", "notice-respond", "STANDARD", 2999, {
    pricingRationale: "Generic IRS notice analysis with domain logic",
    commercialStatus: "production",
  }),
  profile("tax-notice", "notice-respond", "STANDARD", 2999, {
    pricingRationale: "Generic tax notice analysis",
    commercialStatus: "production",
  }),
  profile("court-summons", "notice-respond", "ADVANCED", 6999, {
    includedMail: "standard",
    pricingRationale: "Court procedure analysis with filing requirements and deadline mapping — high stakes",
    commercialStatus: "production",
  }),
  profile("agency-action", "notice-respond", "STANDARD", 2499, {
    pricingRationale: "Generic agency action response with domain logic",
    commercialStatus: "production",
  }),
  profile("file-appeal", "notice-respond", "STANDARD", 2999, {
    pricingRationale: "Appeal filing with procedural requirements",
    commercialStatus: "production",
  }),
  profile("code-enforcement", "notice-respond", "STANDARD", 2499, {
    pricingRationale: "Code enforcement response with compliance analysis",
    commercialStatus: "production",
  }),
  profile("permit-correction", "notice-respond", "STANDARD", 2499, {
    pricingRationale: "Permit correction response with regulatory analysis",
    commercialStatus: "production",
  }),
  profile("dmv-notice", "notice-respond", "STANDARD", 2499, {
    pricingRationale: "DMV notice response with licensing domain logic",
    commercialStatus: "production",
  }),
  profile("ssa-notice", "notice-respond", "STANDARD", 2999, {
    pricingRationale: "SSA notice response with Social Security domain logic",
    commercialStatus: "production",
  }),
  profile("uscis-notice", "notice-respond", "STANDARD", 2999, {
    pricingRationale: "USCIS notice response with immigration domain logic",
    commercialStatus: "production",
  }),
  profile("benefits-notice", "notice-respond", "STANDARD", 2499, {
    pricingRationale: "Benefits notice response with agency-specific procedures",
    commercialStatus: "production",
  }),
];

// ── Dispute Mail ────────────────────────────────────────────────────────────

const disputeMailProfiles: WorkflowPricingProfile[] = [
  profile("debt-collection-dispute", "dispute-mail", "STANDARD", 2999, {
    pricingRationale: "Full gold-standard pipeline: fact extraction, evidence, strategy, draft, validation",
    commercialStatus: "production",
  }),
  profile("dispute-collection-agency", "dispute-mail", "STANDARD", 2999, {
    pricingRationale: "Targeted agency dispute with evidence-backed factual record",
    commercialStatus: "production",
  }),
  profile("debt-dispute", "dispute-mail", "STANDARD", 2999, {
    pricingRationale: "Account-level dispute with evidence and strategy generation",
    commercialStatus: "production",
  }),
  profile("debt-validation", "dispute-mail", "ESSENTIAL", 1499, {
    pricingRationale: "Focused validation request — simpler than full dispute",
    commercialStatus: "production",
  }),
  profile("credit-report", "dispute-mail", "STANDARD", 2999, {
    pricingRationale: "Bureau-specific factual dispute with tradeline analysis",
    commercialStatus: "production",
  }),
  profile("credit-report-collections", "dispute-mail", "STANDARD", 2999, {
    pricingRationale: "Collection account dispute with multi-party analysis",
    commercialStatus: "production",
  }),
  profile("hard-inquiry", "dispute-mail", "ESSENTIAL", 1499, {
    pricingRationale: "Focused inquiry dispute — single-issue workflow",
    commercialStatus: "production",
  }),
  profile("charge-off", "dispute-mail", "STANDARD", 2999, {
    pricingRationale: "Charge-off dispute with field-level analysis and evidence",
    commercialStatus: "production",
  }),
  profile("medical-collections", "dispute-mail", "STANDARD", 2999, {
    pricingRationale: "Medical collections dispute with healthcare domain logic",
    commercialStatus: "production",
  }),
  profile("student-loan", "dispute-mail", "STANDARD", 2999, {
    pricingRationale: "Student loan dispute with account-specific analysis",
    commercialStatus: "production",
  }),
  profile("credit-card-billing", "dispute-mail", "ESSENTIAL", 1499, {
    pricingRationale: "Billing error dispute — straightforward single-issue",
    commercialStatus: "production",
  }),
  profile("unauthorized-charge", "dispute-mail", "ESSENTIAL", 1499, {
    pricingRationale: "Unauthorized charge dispute — straightforward",
    commercialStatus: "production",
  }),
  profile("billing-error", "dispute-mail", "ESSENTIAL", 1499, {
    pricingRationale: "Billing error dispute — straightforward",
    commercialStatus: "production",
  }),
  profile("subscription-billing", "dispute-mail", "ESSENTIAL", 1499, {
    pricingRationale: "Subscription charge dispute — straightforward",
    commercialStatus: "production",
  }),
  profile("service-contract", "dispute-mail", "STANDARD", 2999, {
    pricingRationale: "Service contract dispute with contract analysis",
    commercialStatus: "production",
  }),
  profile("insurance-billing", "dispute-mail", "STANDARD", 2999, {
    pricingRationale: "Insurance billing dispute with insurance domain logic",
    commercialStatus: "production",
  }),
  profile("follow-up-no-response", "dispute-mail", "ESSENTIAL", 1299, {
    pricingRationale: "Follow-up letter — simpler template-driven workflow",
    commercialStatus: "production",
  }),
  profile("inadequate-response", "dispute-mail", "STANDARD", 2999, {
    pricingRationale: "Escalation with prior dispute analysis",
    commercialStatus: "production",
  }),
  profile("cease-contact", "dispute-mail", "ESSENTIAL", 1299, {
    pricingRationale: "Cease-contact documentation — simple legal request",
    commercialStatus: "production",
  }),
];

// ── Appeal Mail ──────────────────────────────────────────────────────────────

const appealMailProfiles: WorkflowPricingProfile[] = [
  profile("denied-claim", "appeal-mail", "ADVANCED", 6999, { includedMail: "standard", pricingRationale: "Full 18-step pipeline with X-Ray, grounds, evidence, arguments, stress test", commercialStatus: "production" }),
  profile("government-decision", "appeal-mail", "ADVANCED", 5999, { includedMail: "standard", pricingRationale: "Administrative appeal with procedural requirements", commercialStatus: "production" }),
  profile("court-ruling", "appeal-mail", "ADVANCED", 6999, { includedMail: "standard", pricingRationale: "Court ruling response with filing requirements — high stakes", commercialStatus: "production" }),
  profile("reconsideration", "appeal-mail", "STANDARD", 2999, { pricingRationale: "Focused reconsideration request — single-issue workflow", commercialStatus: "production" }),
  profile("insurance-claim-denial", "appeal-mail", "ADVANCED", 6999, { includedMail: "standard", pricingRationale: "Insurance denial with coverage analysis and policy interpretation", commercialStatus: "production" }),
  profile("insurance-denial-letter", "appeal-mail", "STANDARD", 2999, { pricingRationale: "Insurance denial response — standard analysis", commercialStatus: "production" }),
  profile("insurance-coverage-denial", "appeal-mail", "ADVANCED", 5999, { includedMail: "standard", pricingRationale: "Coverage denial with policy language analysis", commercialStatus: "production" }),
  profile("medical-insurance-denial", "appeal-mail", "ADVANCED", 6999, { includedMail: "standard", pricingRationale: "Medical insurance with clinical documentation analysis", commercialStatus: "production" }),
  profile("medical-necessity-appeal", "appeal-mail", "ADVANCED", 6999, { includedMail: "standard", pricingRationale: "Medical necessity with clinical evidence mapping", commercialStatus: "production" }),
  profile("prior-authorization-denial", "appeal-mail", "ADVANCED", 5999, { includedMail: "standard", pricingRationale: "Prior auth with authorization criteria analysis", commercialStatus: "production" }),
  profile("out-of-network-denial", "appeal-mail", "STANDARD", 3999, { pricingRationale: "Out-of-network with plan language analysis", commercialStatus: "production" }),
  profile("dental-insurance-appeal", "appeal-mail", "STANDARD", 3999, { pricingRationale: "Dental insurance with procedure and coverage analysis", commercialStatus: "production" }),
  profile("car-insurance-appeal", "appeal-mail", "STANDARD", 3999, { pricingRationale: "Auto claim with damage, liability, and coverage analysis", commercialStatus: "production" }),
  profile("life-insurance-denial", "appeal-mail", "ADVANCED", 5999, { includedMail: "standard", pricingRationale: "Life insurance with policy/exclusion analysis", commercialStatus: "production" }),
  profile("claim-denial-letter", "appeal-mail", "STANDARD", 2999, { pricingRationale: "Generic claim denial response", commercialStatus: "production" }),
  profile("ssdi-denial", "appeal-mail", "ADVANCED", 6999, { includedMail: "standard", pricingRationale: "SSDI with disability determination and medical evidence requirements", commercialStatus: "production" }),
  profile("ssi-denial", "appeal-mail", "ADVANCED", 5999, { includedMail: "standard", pricingRationale: "SSI with income/resource analysis", commercialStatus: "production" }),
  profile("social-security-denial", "appeal-mail", "ADVANCED", 5999, { includedMail: "standard", pricingRationale: "Social Security with overpayment/reconsideration analysis", commercialStatus: "production" }),
  profile("medicaid-denial", "appeal-mail", "ADVANCED", 5999, { includedMail: "standard", pricingRationale: "Medicaid with eligibility analysis", commercialStatus: "production" }),
  profile("unemployment-denial", "appeal-mail", "STANDARD", 3999, { pricingRationale: "Unemployment with eligibility analysis", commercialStatus: "production" }),
  profile("edd-denial", "appeal-mail", "STANDARD", 3999, { pricingRationale: "EDD denial with state-specific procedures", commercialStatus: "production" }),
  profile("financial-aid-appeal", "appeal-mail", "STANDARD", 2999, { pricingRationale: "Financial aid appeal — single-issue workflow", commercialStatus: "production" }),
  profile("sap-appeal", "appeal-mail", "STANDARD", 2999, { pricingRationale: "SAP appeal — single-issue workflow", commercialStatus: "production" }),
  profile("financial-aid-suspension-appeal", "appeal-mail", "STANDARD", 2999, { pricingRationale: "Financial aid suspension — single-issue", commercialStatus: "production" }),
  profile("financial-aid-reinstatement", "appeal-mail", "STANDARD", 2999, { pricingRationale: "Financial aid reinstatement — single-issue", commercialStatus: "production" }),
  profile("financial-aid-special-circumstances", "appeal-mail", "STANDARD", 2999, { pricingRationale: "Special circumstances appeal — single-issue", commercialStatus: "production" }),
  profile("scholarship-appeal", "appeal-mail", "STANDARD", 2999, { pricingRationale: "Scholarship appeal — single-issue", commercialStatus: "production" }),
  profile("fafsa-appeal", "appeal-mail", "STANDARD", 2999, { pricingRationale: "FAFSA appeal — single-issue", commercialStatus: "production" }),
  profile("license-suspension-appeal", "appeal-mail", "STANDARD", 3999, { pricingRationale: "License suspension with DMV domain logic", commercialStatus: "production" }),
  profile("drivers-license-suspension", "appeal-mail", "STANDARD", 3999, { pricingRationale: "Driver's license with DMV domain logic", commercialStatus: "production" }),
  profile("license-revocation-appeal", "appeal-mail", "STANDARD", 3999, { pricingRationale: "License revocation with DMV domain logic", commercialStatus: "production" }),
  profile("dmv-suspension-appeal", "appeal-mail", "STANDARD", 3999, { pricingRationale: "DMV suspension with DMV domain logic", commercialStatus: "production" }),
  profile("registration-suspension-appeal", "appeal-mail", "STANDARD", 3999, { pricingRationale: "Registration suspension with DMV domain logic", commercialStatus: "production" }),
];

// ── Immigration Mail ─────────────────────────────────────────────────────────

const immigrationProfiles: WorkflowPricingProfile[] = [
  profile("respond-to-notice", "immigration-mail", "ADVANCED", 5999, {
    includedMail: "standard",
    pricingRationale: "Immigration notice with authority resolution and USCIS domain logic",
    commercialStatus: "production",
  }),
  profile("supporting-documents", "immigration-mail", "STANDARD", 2999, {
    pricingRationale: "Supporting document submission — structured workflow",
    commercialStatus: "production",
  }),
  profile("explanation-letter", "immigration-mail", "STANDARD", 2999, {
    pricingRationale: "Immigration explanation letter — structured workflow",
    commercialStatus: "production",
  }),
];

// ── Small Business ───────────────────────────────────────────────────────────

const smallBusinessProfiles: WorkflowPricingProfile[] = [
  profile("payment-reminder", "mailmypdf-smallbusiness", "FREE", 0, {
    pricingRationale: "Simple payment reminder — acquisition funnel for business vertical",
    commercialStatus: "production",
  }),
  profile("payment-demand", "mailmypdf-smallbusiness", "STANDARD", 2499, {
    pricingRationale: "Formal payment demand with approval gates and audit record",
    commercialStatus: "production",
  }),
  profile("contract-renewal", "mailmypdf-smallbusiness", "ESSENTIAL", 1499, {
    pricingRationale: "Contract renewal correspondence — straightforward",
    commercialStatus: "production",
  }),
  profile("compliance-notice", "mailmypdf-smallbusiness", "STANDARD", 2499, {
    pricingRationale: "Compliance notice with regulatory/contractual obligation analysis",
    commercialStatus: "production",
  }),
  profile("customer-dispute-response", "mailmypdf-smallbusiness", "STANDARD", 2499, {
    pricingRationale: "Customer dispute response with evidence organization",
    commercialStatus: "production",
  }),
];

// ── Proposed (not yet production) ────────────────────────────────────────────

const proposedProfiles: WorkflowPricingProfile[] = [
  profile("records-request", "records-requests", "ESSENTIAL", 1299, { commercialStatus: "test", pricingRationale: "Records request — structured but simple" }),
  profile("benefits-appeal", "benefits-appeal", "STANDARD", 2999, { commercialStatus: "test", pricingRationale: "Benefits appeal with agency-specific procedures" }),
  profile("code-enforcement-notice", "code-enforcement", "STANDARD", 2499, { commercialStatus: "test", pricingRationale: "Code enforcement with compliance analysis" }),
  profile("govreply", "gov-reply", "ESSENTIAL", 1299, { commercialStatus: "disabled", pricingRationale: "Generic government reply — placeholder" }),
  profile("tenant-reply", "tenant-reply", "STANDARD", 2999, { commercialStatus: "disabled", pricingRationale: "Tenant reply with housing domain — placeholder" }),
  profile("permit-reply", "permit-response", "ESSENTIAL", 1299, { commercialStatus: "disabled", pricingRationale: "Permit response — placeholder" }),
];

// ═══════════════════════════════════════════════════════════════════════════
// CATALOG REGISTRY
// ═══════════════════════════════════════════════════════════════════════════

export const WORKFLOW_PRICING_CATALOG: WorkflowPricingProfile[] = [
  ...mailmypdfProfiles,
  ...noticeRespondProfiles,
  ...disputeMailProfiles,
  ...appealMailProfiles,
  ...immigrationProfiles,
  ...smallBusinessProfiles,
  ...proposedProfiles,
];

const catalogByWorkflowId = new Map<string, WorkflowPricingProfile>();
for (const p of WORKFLOW_PRICING_CATALOG) {
  catalogByWorkflowId.set(p.workflowId, p);
}

export function getWorkflowPricingProfile(workflowId: string): WorkflowPricingProfile | undefined {
  return catalogByWorkflowId.get(workflowId);
}

export function getWorkflowPricingProfileOrThrow(workflowId: string): WorkflowPricingProfile {
  const profile = catalogByWorkflowId.get(workflowId);
  if (!profile) throw new Error(`No pricing profile found for workflow: ${workflowId}`);
  return profile;
}

export function getAllPricingProfiles(): readonly WorkflowPricingProfile[] {
  return WORKFLOW_PRICING_CATALOG;
}

export function getProductionPricingProfiles(): readonly WorkflowPricingProfile[] {
  return WORKFLOW_PRICING_CATALOG.filter(p => p.commercialStatus === "production");
}

export function getPricingProfilesByVertical(verticalId: string): readonly WorkflowPricingProfile[] {
  return WORKFLOW_PRICING_CATALOG.filter(p => p.verticalId === verticalId);
}

// ═══════════════════════════════════════════════════════════════════════════
// DISCOUNT REGISTRY (extensible — add discounts here)
// ═══════════════════════════════════════════════════════════════════════════

const discountRegistry = new Map<string, DiscountConfig>();

export function registerDiscount(config: DiscountConfig): void {
  discountRegistry.set(config.code.toLowerCase(), config);
}

export function getDiscount(code: string): DiscountConfig | undefined {
  return discountRegistry.get(code.toLowerCase());
}

export function validateDiscount(
  code: string,
  workflowId: string,
): { valid: boolean; config?: DiscountConfig; error?: string } {
  const config = getDiscount(code);
  if (!config) return { valid: false, error: "Discount code not found." };
  if (!config.active) return { valid: false, error: "Discount code is no longer active." };
  if (config.expiresAt && new Date(config.expiresAt) < new Date()) {
    return { valid: false, error: "Discount code has expired." };
  }
  if (config.applicableWorkflowIds?.length && !config.applicableWorkflowIds.includes(workflowId)) {
    return { valid: false, error: "Discount code is not valid for this workflow." };
  }
  return { valid: true, config };
}

// ═══════════════════════════════════════════════════════════════════════════
// QUOTE ENGINE (deterministic, server-authoritative)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calculate a deterministic quote for a workflow.
 *
 * The same inputs MUST produce the same quote.
 * The client may display a quote, but the server is authoritative.
 * Persist a quote snapshot at checkout time to prevent price changes.
 */
export function calculateQuote(input: QuoteInput): Quote {
  const profile = getWorkflowPricingProfileOrThrow(input.workflowId);

  // Gate: non-production workflows cannot be quoted
  if (profile.commercialStatus !== "production") {
    throw new Error(`Workflow ${input.workflowId} is not available for purchase (status: ${profile.commercialStatus}).`);
  }

  const actualPages = Math.max(0, Math.floor(input.actualPages));
  const supportingPages = Math.max(0, Math.floor(input.supportingPages ?? 0));

  // Base price from profile
  const basePriceCents = profile.basePriceCents;

  // Included mail value
  const includedMailValue = profile.includedMail === "standard" ? PRICES.standard : 0;

  // Extra page charges (only for pages beyond included)
  const extraPages = profile.basePriceCents > 0 ? Math.max(0, actualPages - profile.includedPages) : 0;
  const extraPageCost = extraPages * profile.extraPageRateCents;

  // Supporting page charges (always additional)
  const supportingPageCost = profile.basePriceCents > 0 ? supportingPages * profile.supportingPageRateCents : 0;

  // Mail service selection
  let mailService: MailClass | "none" = "none";
  let mailServiceCost = 0;
  let mailUpgradeCost = 0;

  if (input.mailClass && profile.availableMailServices.includes(input.mailClass)) {
    mailService = input.mailClass;

    if (profile.includedMail === "standard" && input.mailClass === "standard") {
      // Standard mail is included — no additional charge
      mailServiceCost = 0;
      mailUpgradeCost = 0;
    } else if (input.mailClass === "standard") {
      // Standard mail, not included — charge standard price
      mailServiceCost = PRICES.standard;
      mailUpgradeCost = 0;
    } else if (input.mailClass === "certified") {
      // Certified: standard price + certified surcharge
      const base = profile.includedMail === "standard" ? 0 : PRICES.standard;
      mailServiceCost = base + profile.certifiedMailSurchargeCents;
      mailUpgradeCost = profile.certifiedMailSurchargeCents;
    } else if (input.mailClass === "registered") {
      // Registered: standard price + registered surcharge
      const base = profile.includedMail === "standard" ? 0 : PRICES.standard;
      mailServiceCost = base + profile.registeredMailSurchargeCents;
      mailUpgradeCost = profile.registeredMailSurchargeCents;
    }
  } else if (profile.includedMail === "standard" && !input.mailClass) {
    // Default to included standard mail if no class selected
    mailService = "standard";
    mailServiceCost = 0;
  }

  // Subtotal before discount
  const subtotalCents = basePriceCents + extraPageCost + supportingPageCost + mailServiceCost;

  // Discount
  let discountCents = 0;
  let discountCode: string | null = null;

  if (input.discountCode) {
    const validation = validateDiscount(input.discountCode, input.workflowId);
    if (validation.valid && validation.config) {
      discountCode = validation.config.code;
      if (validation.config.type === "percentage") {
        discountCents = Math.floor((subtotalCents * validation.config.value) / 100);
      } else {
        discountCents = Math.min(validation.config.value, subtotalCents);
      }
    }
  }

  const totalCents = Math.max(0, subtotalCents - discountCents);

  return {
    workflowId: input.workflowId,
    verticalId: input.verticalId,
    band: profile.band,
    basePriceCents,
    includedPages: profile.includedPages,
    actualPages,
    includedMailValue,
    extraPageCost,
    supportingPageCost,
    mailService,
    mailServiceCost,
    mailUpgradeCost,
    discountCents,
    discountCode,
    subtotalCents,
    totalCents,
    currency: profile.currency,
    commercialStatus: profile.commercialStatus,
    capabilities: profile.capabilities,
    quotedAt: new Date().toISOString(),
  };
}

/**
 * Serialize a quote for persistence (quote snapshot).
 * Store this at checkout time to lock in commercial terms.
 */
export function serializeQuote(quote: Quote): string {
  return JSON.stringify(quote);
}

/**
 * Deserialize a persisted quote snapshot.
 */
export function deserializeQuote(json: string): Quote {
  return JSON.parse(json) as Quote;
}

/**
 * Verify that a persisted quote matches a freshly calculated quote.
 * Used to detect price changes after checkout.
 */
export function quotesMatch(persisted: Quote, fresh: Quote): boolean {
  return (
    persisted.workflowId === fresh.workflowId &&
    persisted.totalCents === fresh.totalCents &&
    persisted.basePriceCents === fresh.basePriceCents &&
    persisted.mailServiceCost === fresh.mailServiceCost
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MARGIN CALCULATION (internal — not exposed to customers)
// ═══════════════════════════════════════════════════════════════════════════

export interface MarginEstimate {
  revenueCents: number;
  mailCostCents: number;
  stripeCostCents: number;
  estimatedAiCostCents: number;
  grossMarginCents: number;
  grossMarginPercent: number;
}

export function estimateMargin(
  quote: Quote,
  estimatedAiCostCents = 500,
): MarginEstimate {
  const mailClass = quote.mailService === "none" ? "standard" : quote.mailService;
  const mailCostCents = getMailCost(mailClass) + (quote.actualPages > 8 ? (quote.actualPages - 8) * FULFILLMENT_COSTS.extraPageCostCents : 0);
  const stripeCostCents = Math.floor(quote.totalCents * 0.029 + 30); // 2.9% + $0.30
  const revenueCents = quote.totalCents;
  const grossMarginCents = revenueCents - mailCostCents - stripeCostCents - estimatedAiCostCents;
  const grossMarginPercent = revenueCents > 0 ? Math.round((grossMarginCents / revenueCents) * 100) : 0;

  return {
    revenueCents,
    mailCostCents,
    stripeCostCents,
    estimatedAiCostCents,
    grossMarginCents,
    grossMarginPercent,
  };
}

/**
 * Flag workflows where included mailing may make pricing economically dangerous.
 */
export function flagDangerousMargins(profile: WorkflowPricingProfile): string[] {
  const warnings: string[] = [];

  if (profile.includedMail !== "none" && profile.band === "FREE") {
    warnings.push("FREE workflow with included mail — margin negative by definition.");
  }

  if (profile.includedMail === "standard" && profile.basePriceCents < 2000) {
    warnings.push("Low base price with included standard mail — margin at risk if pages exceed included.");
  }

  // Check if registered mail is available (it shouldn't be included)
  if (profile.availableMailServices.includes("registered")) {
    const registeredQuote = calculateQuote({
      workflowId: profile.workflowId,
      verticalId: profile.verticalId,
      actualPages: 20,
      mailClass: "registered",
    });
    const margin = estimateMargin(registeredQuote, 800);
    if (margin.grossMarginPercent < 40) {
      warnings.push(`Registered mail margin at risk: ${margin.grossMarginPercent}% on 20-page registered mailing.`);
    }
  }

  return warnings;
}
