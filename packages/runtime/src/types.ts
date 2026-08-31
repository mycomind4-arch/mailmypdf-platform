/** Branded string type for platform IDs — replaces @mailmypdf/core dependency in published package */
export type PlatformId = string & { readonly __brand: "PlatformId" };
