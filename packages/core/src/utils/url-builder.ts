import type { ExecutorContext } from "../context.ts";

/**
 * Build the org-prefixed base path: `/orgs/{slug}`.
 *
 * Throws if organizationSlug is missing from context.
 */
export function orgPrefix(ctx: ExecutorContext): string {
  if (!ctx.organizationSlug) {
    throw new Error("organizationSlug is required — configure it via FORGE_ORG env var or config");
  }

  return `/orgs/${ctx.organizationSlug}`;
}

/**
 * Build a server-scoped URL path: `/orgs/{slug}/servers/{id}`.
 */
export function serverPath(serverId: string, ctx: ExecutorContext): string {
  return `${orgPrefix(ctx)}/servers/${serverId}`;
}

/**
 * Build a site-scoped URL path: `/orgs/{slug}/servers/{id}/sites/{siteId}`.
 */
export function sitePath(serverId: string, siteId: string, ctx: ExecutorContext): string {
  return `${serverPath(serverId, ctx)}/sites/${siteId}`;
}
