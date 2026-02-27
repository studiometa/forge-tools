import {
  getServer,
  getSite,
  listCertificates,
  listDaemons,
  listDatabaseUsers,
  listDatabases,
  listDeployments,
  listFirewallRules,
  listRedirectRules,
  listScheduledJobs,
  listSecurityRules,
  listSites,
} from "@studiometa/forge-core";

import type { CommonArgs, HandlerContext, ToolResult } from "./types.ts";
import { errorResult, jsonResult } from "./utils.ts";

/**
 * Handle server context action — fetches server details plus all sub-resources
 * (sites, databases, database users, daemons, firewall rules, scheduled jobs)
 * in parallel in a single call.
 */
export async function handleServerContext(
  args: CommonArgs,
  ctx: HandlerContext,
): Promise<ToolResult> {
  const serverId = args.id;
  if (!serverId) return errorResult("Missing required field: id");

  const execCtx = ctx.executorContext;

  const [server, sites, databases, dbUsers, daemons, firewallRules, scheduledJobs] =
    await Promise.all([
      getServer({ server_id: serverId }, execCtx),
      listSites({ server_id: serverId }, execCtx),
      listDatabases({ server_id: serverId }, execCtx),
      listDatabaseUsers({ server_id: serverId }, execCtx),
      listDaemons({ server_id: serverId }, execCtx),
      listFirewallRules({ server_id: serverId }, execCtx),
      listScheduledJobs({ server_id: serverId }, execCtx),
    ]);

  return jsonResult({
    server: server.data,
    sites: sites.data,
    databases: databases.data,
    database_users: dbUsers.data,
    daemons: daemons.data,
    firewall_rules: firewallRules.data,
    scheduled_jobs: scheduledJobs.data,
  });
}

/**
 * Handle site context action — fetches site details plus all sub-resources
 * (recent deployments, certificates, redirect rules, security rules)
 * in parallel in a single call. Deployments are limited to the last 5.
 */
export async function handleSiteContext(
  args: CommonArgs,
  ctx: HandlerContext,
): Promise<ToolResult> {
  const serverId = args.server_id;
  const siteId = args.id;
  if (!serverId) return errorResult("Missing required field: server_id");
  if (!siteId) return errorResult("Missing required field: id");

  const execCtx = ctx.executorContext;

  const [site, deployments, certificates, redirectRules, securityRules] = await Promise.all([
    getSite({ server_id: serverId, site_id: siteId }, execCtx),
    listDeployments({ server_id: serverId, site_id: siteId }, execCtx),
    listCertificates({ server_id: serverId, site_id: siteId }, execCtx),
    listRedirectRules({ server_id: serverId, site_id: siteId }, execCtx),
    listSecurityRules({ server_id: serverId, site_id: siteId }, execCtx),
  ]);

  const recentDeployments = Array.isArray(deployments.data)
    ? deployments.data.slice(0, 5)
    : deployments.data;

  return jsonResult({
    site: site.data,
    deployments: recentDeployments,
    certificates: certificates.data,
    redirect_rules: redirectRules.data,
    security_rules: securityRules.data,
  });
}
