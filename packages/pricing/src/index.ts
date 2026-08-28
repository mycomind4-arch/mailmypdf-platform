/**
 * @mailmypdf/pricing
 *
 * Centralized pricing for all MailMyPDF verticals.
 *
 * Prices are in US cents. All verticals must use these constants
 * instead of defining their own. Price changes happen here, once,
 * and propagate to every vertical at build time.
 *
 * The checkout flow maps the user-facing "mailing method" name
 * (standard/certified/registered) to the MailMyPDF MailType
 * (first_class/certified/certified_return_receipt/registered).
 */

export type PricingKey = "standard" | "certified" | "registered";

export type MailType = "first_class" | "certified" | "certified_return_receipt" | "registered";

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

/**
 * Maps the user-facing pricing key to the MailMyPDF MailType.
 * "standard" maps to "first_class" (the API term).
 */
export const MAIL_TYPE_MAP: Record<PricingKey, MailType> = {
  standard: "first_class",
  certified: "certified",
  registered: "registered",
} as const;

/**
 * Reverse map: MailType → PricingKey.
 * Note: "certified_return_receipt" maps to "certified" (same price tier).
 */
export const PRICING_KEY_MAP: Record<MailType, PricingKey> = {
  first_class: "standard",
  certified: "certified",
  certified_return_receipt: "certified",
  registered: "registered",
} as const;

/**
 * Get the price in cents for a pricing key.
 */
export function getPriceCents(key: PricingKey): number {
  const price = PRICES[key];
  if (price === undefined) throw new Error(`Unknown pricing key: ${key}`);
  return price;
}

/**
 * Get the price in cents for a MailType.
 */
export function getPriceForMailType(mailType: MailType): number {
  const key = PRICING_KEY_MAP[mailType];
  return getPriceCents(key);
}

/**
 * Get the display label for a pricing key.
 */
export function getLabel(key: PricingKey): string {
  return LABELS[key] ?? key;
}

/**
 * Validate that a pricing key is supported.
 */
export function isValidPricingKey(key: string): key is PricingKey {
  return key in PRICES;
}
