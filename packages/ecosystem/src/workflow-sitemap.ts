import { MASTER_PUBLIC_ROUTES } from "../gateway/master-public-routes.js";
import { WORKFLOW_AUTHORITY_PAGES } from "../workflows/src/workflow-page-registry.js";

export type SitemapEntry = {
  loc: string;
  changefreq: "daily" | "weekly" | "monthly";
  priority: number;
  indexable: boolean;
};

export type SitemapOptions = {
  canonicalOrigin?: string;
  launchReady?: boolean;
};

export function buildEcosystemSitemap(options: SitemapOptions = {}): readonly SitemapEntry[] {
  const origin = (options.canonicalOrigin ?? "https://mailmypdf.ai").replace(/\/$/, "");
  const indexable = options.launchReady === true;
  const core = MASTER_PUBLIC_ROUTES
    .filter((route) => route.kind === "core" || route.kind === "product" || route.kind === "resource")
    .map((route): SitemapEntry => ({
      loc: `${origin}${route.path}`,
      changefreq: route.kind === "resource" ? "weekly" : "monthly",
      priority: route.path === "/" ? 1 : route.kind === "product" ? 0.9 : 0.7,
      indexable,
    }));

  const workflows = WORKFLOW_AUTHORITY_PAGES.map((page): SitemapEntry => ({
    loc: `${origin}${page.canonicalPath}`,
    changefreq: "monthly",
    priority: 0.8,
    indexable,
  }));

  const deduped = new Map<string, SitemapEntry>();
  for (const entry of [...core, ...workflows]) deduped.set(entry.loc, entry);
  return [...deduped.values()].sort((a, b) => a.loc.localeCompare(b.loc));
}

export function renderSitemapXml(entries: readonly SitemapEntry[]): string {
  const urls = entries
    .filter((entry) => entry.indexable)
    .map((entry) => `  <url><loc>${escapeXml(entry.loc)}</loc><changefreq>${entry.changefreq}</changefreq><priority>${entry.priority.toFixed(1)}</priority></url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function escapeXml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}
