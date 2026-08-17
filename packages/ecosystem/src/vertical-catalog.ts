import type { VerticalId, VerticalRegistration } from './index.js';

export interface EcosystemCatalogEntry extends VerticalRegistration {
  readonly slug: string;
  readonly launchUrl: string;
  readonly icon?: string;
  readonly theme?: string;
  readonly sortOrder?: number;
  readonly featured?: boolean;
}

export interface EcosystemCatalog {
  readonly version: 1;
  readonly entries: readonly EcosystemCatalogEntry[];
}

export function validateCatalog(catalog: EcosystemCatalog): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const slugs = new Set<string>();
  for (const entry of catalog.entries) {
    if (ids.has(entry.verticalId)) errors.push(`duplicate vertical id: ${entry.verticalId}`);
    if (slugs.has(entry.slug)) errors.push(`duplicate vertical slug: ${entry.slug}`);
    ids.add(entry.verticalId);
    slugs.add(entry.slug);
    if (!entry.launchUrl.startsWith('https://')) errors.push(`invalid launch URL: ${entry.slug}`);
    if (entry.accountRequired !== true) errors.push(`vertical must require ecosystem account: ${entry.slug}`);
  }
  return errors;
}

export function findVertical(catalog: EcosystemCatalog, verticalId: VerticalId | string): EcosystemCatalogEntry | undefined {
  return catalog.entries.find(entry => entry.verticalId === verticalId || entry.slug === verticalId);
}
