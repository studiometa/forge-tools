/**
 * Response formatters for MCP tool output.
 *
 * This module contains per-resource formatter functions that convert
 * executor data payloads into human-readable text for MCP responses.
 *
 * Keeping formatting in the MCP layer ensures executors remain pure data
 * functions that can be reused by any adapter (CLI, SDK, etc.).
 */

import type {
  ForgeBackupConfig,
  ForgeCertificate,
  ForgeCommand,
  ForgeDaemon,
  ForgeDatabase,
  ForgeDatabaseUser,
  ForgeDeployment,
  ForgeFirewallRule,
  ForgeMonitor,
  ForgeNginxTemplate,
  ForgeRecipe,
  ForgeRedirectRule,
  ForgeScheduledJob,
  ForgeSecurityRule,
  ForgeServer,
  ForgeSite,
  ForgeSshKey,
  ForgeUser,
} from "@studiometa/forge-api";

// ── Servers ──────────────────────────────────────────

/**
 * Format a list of servers.
 */
export function formatServerList(servers: ForgeServer[]): string {
  if (servers.length === 0) {
    return "No servers found.";
  }
  const lines = servers.map(
    (s) =>
      `• ${s.name} (ID: ${s.id}) — ${s.provider} ${s.region} — ${s.ip_address} — ${s.is_ready ? "ready" : "provisioning"}`,
  );
  return `${servers.length} server(s):\n${lines.join("\n")}`;
}

/**
 * Format a single server.
 */
export function formatServer(server: ForgeServer): string {
  return [
    `Server: ${server.name} (ID: ${server.id})`,
    `Provider: ${server.provider} (${server.region})`,
    `IP: ${server.ip_address}`,
    `PHP: ${server.php_version}`,
    `Ubuntu: ${server.ubuntu_version}`,
    `Status: ${server.is_ready ? "ready" : "provisioning"}`,
    `Created: ${server.created_at}`,
  ].join("\n");
}

// ── Sites ────────────────────────────────────────────

/**
 * Format a list of sites.
 */
export function formatSiteList(sites: ForgeSite[], serverId?: string): string {
  if (sites.length === 0) {
    return serverId ? `No sites on server ${serverId}.` : "No sites found.";
  }
  const lines = sites.map((s) => `• ${s.name} (ID: ${s.id}) — ${s.project_type} — ${s.status}`);
  const header = serverId
    ? `${sites.length} site(s) on server ${serverId}:`
    : `${sites.length} site(s):`;
  return `${header}\n${lines.join("\n")}`;
}

/**
 * Format a single site.
 */
export function formatSite(site: ForgeSite): string {
  return [
    `Site: ${site.name} (ID: ${site.id})`,
    `Type: ${site.project_type}`,
    `Directory: ${site.directory}`,
    `Repository: ${site.repository ?? "none"}`,
    `Branch: ${site.repository_branch ?? "none"}`,
    `Status: ${site.status}`,
    `Deploy status: ${site.deployment_status ?? "none"}`,
    `Quick deploy: ${site.quick_deploy ? "enabled" : "disabled"}`,
    `PHP: ${site.php_version}`,
    `Created: ${site.created_at}`,
  ].join("\n");
}

// ── Databases ────────────────────────────────────────

/**
 * Format a list of databases.
 */
export function formatDatabaseList(databases: ForgeDatabase[]): string {
  if (databases.length === 0) {
    return "No databases found.";
  }
  const lines = databases.map((d) => `• ${d.name} (ID: ${d.id}) — ${d.status}`);
  return `${databases.length} database(s):\n${lines.join("\n")}`;
}

/**
 * Format a single database.
 */
export function formatDatabase(db: ForgeDatabase): string {
  return `Database: ${db.name} (ID: ${db.id})\nStatus: ${db.status}\nCreated: ${db.created_at}`;
}

// ── Database Users ────────────────────────────────────

/**
 * Format a list of database users.
 */
export function formatDatabaseUserList(users: ForgeDatabaseUser[]): string {
  if (users.length === 0) {
    return "No database users found.";
  }
  const lines = users.map((u) => `• ${u.name} (ID: ${u.id}) — ${u.status}`);
  return `${users.length} database user(s):\n${lines.join("\n")}`;
}

/**
 * Format a single database user.
 */
export function formatDatabaseUser(user: ForgeDatabaseUser): string {
  return [
    `Database User: ${user.name} (ID: ${user.id})`,
    `Status: ${user.status}`,
    `Databases: ${user.databases.length > 0 ? user.databases.join(", ") : "none"}`,
    `Created: ${user.created_at}`,
  ].join("\n");
}

// ── Deployments ──────────────────────────────────────

/**
 * Format a list of deployments.
 */
export function formatDeploymentList(deployments: ForgeDeployment[]): string {
  if (deployments.length === 0) {
    return "No deployments found.";
  }
  const lines = deployments.map(
    (d) =>
      `• #${d.id} — ${d.status} — ${d.commit_hash?.slice(0, 7) ?? "no commit"} — ${d.started_at}`,
  );
  return `${deployments.length} deployment(s):\n${lines.join("\n")}`;
}

/**
 * Format a deployment action result.
 *
 * When a `DeployResult` is provided the output includes status, elapsed time,
 * and the deployment log.  When called with just IDs (legacy) it falls back to
 * the simple confirmation message so existing tests keep passing.
 */
export function formatDeployAction(
  siteId: string,
  serverId: string,
  result?: { status: "success" | "failed"; log: string; elapsed_ms: number },
): string {
  if (!result) {
    return `Deployment triggered for site ${siteId} on server ${serverId}.`;
  }

  const elapsedSec = (result.elapsed_ms / 1000).toFixed(1);
  const statusLabel = result.status === "success" ? "✓ succeeded" : "✗ failed";
  const lines = [
    `Deployment ${statusLabel} for site ${siteId} on server ${serverId} (${elapsedSec}s).`,
  ];

  if (result.log) {
    lines.push("", "Deployment log:", result.log);
  }

  return lines.join("\n");
}

/**
 * Format deployment script content.
 */
export function formatDeploymentScript(script: string): string {
  return `Deployment script:\n${script}`;
}

/**
 * Format deployment output.
 */
export function formatDeploymentOutput(deploymentId: string, output: string): string {
  return `Deployment ${deploymentId} output:\n${output}`;
}

/**
 * Format a deployment script update confirmation.
 */
export function formatDeploymentScriptUpdated(siteId: string, serverId: string): string {
  return `Deployment script updated for site ${siteId} on server ${serverId}.`;
}

// ── Certificates ─────────────────────────────────────

/**
 * Format a list of certificates.
 */
export function formatCertificateList(certificates: ForgeCertificate[]): string {
  if (certificates.length === 0) {
    return "No certificates found.";
  }
  const lines = certificates.map(
    (c) =>
      `• ${c.domain} (ID: ${c.id}) — ${c.type} — ${c.active ? "active" : "inactive"} — ${c.status}`,
  );
  return `${certificates.length} certificate(s):\n${lines.join("\n")}`;
}

/**
 * Format a single certificate.
 */
export function formatCertificate(cert: ForgeCertificate): string {
  return `Certificate: ${cert.domain} (ID: ${cert.id})\nType: ${cert.type}\nStatus: ${cert.status}\nActive: ${cert.active}`;
}

// ── Daemons ──────────────────────────────────────────

/**
 * Format a list of daemons.
 */
export function formatDaemonList(daemons: ForgeDaemon[]): string {
  if (daemons.length === 0) {
    return "No daemons found.";
  }
  const lines = daemons.map((d) => `• ${d.command} (ID: ${d.id}) — user: ${d.user} — ${d.status}`);
  return `${daemons.length} daemon(s):\n${lines.join("\n")}`;
}

/**
 * Format a single daemon.
 */
export function formatDaemon(daemon: ForgeDaemon): string {
  return `Daemon: ${daemon.command} (ID: ${daemon.id})\nUser: ${daemon.user}\nProcesses: ${daemon.processes}\nStatus: ${daemon.status}`;
}

// ── Firewall Rules ───────────────────────────────────

/**
 * Format a list of firewall rules.
 */
export function formatFirewallRuleList(rules: ForgeFirewallRule[]): string {
  if (rules.length === 0) {
    return "No firewall rules found.";
  }
  const lines = rules.map(
    (r) => `• ${r.name} (ID: ${r.id}) — port: ${r.port} — ${r.ip_address} — ${r.status}`,
  );
  return `${rules.length} firewall rule(s):\n${lines.join("\n")}`;
}

/**
 * Format a single firewall rule.
 */
export function formatFirewallRule(rule: ForgeFirewallRule): string {
  return `Firewall Rule: ${rule.name} (ID: ${rule.id})\nPort: ${rule.port}\nType: ${rule.type}\nIP: ${rule.ip_address}\nStatus: ${rule.status}`;
}

// ── Monitors ─────────────────────────────────────────

/**
 * Format a list of monitors.
 */
export function formatMonitorList(monitors: ForgeMonitor[]): string {
  if (monitors.length === 0) {
    return "No monitors found.";
  }
  const lines = monitors.map(
    (m) => `• ${m.type} ${m.operator} ${m.threshold} (ID: ${m.id}) — ${m.state}`,
  );
  return `${monitors.length} monitor(s):\n${lines.join("\n")}`;
}

/**
 * Format a single monitor.
 */
export function formatMonitor(monitor: ForgeMonitor): string {
  return `Monitor: ${monitor.type} ${monitor.operator} ${monitor.threshold} (ID: ${monitor.id})\nState: ${monitor.state}\nMinutes: ${monitor.minutes}`;
}

// ── SSH Keys ─────────────────────────────────────────

/**
 * Format a list of SSH keys.
 */
export function formatSshKeyList(keys: ForgeSshKey[]): string {
  if (keys.length === 0) {
    return "No SSH keys found.";
  }
  const lines = keys.map((k) => `• ${k.name} (ID: ${k.id}) — ${k.status}`);
  return `${keys.length} SSH key(s):\n${lines.join("\n")}`;
}

/**
 * Format a single SSH key.
 */
export function formatSshKey(key: ForgeSshKey): string {
  return `SSH Key: ${key.name} (ID: ${key.id})\nStatus: ${key.status}\nCreated: ${key.created_at}`;
}

// ── Scheduled Jobs ───────────────────────────────────

/**
 * Format a list of scheduled jobs.
 */
export function formatScheduledJobList(jobs: ForgeScheduledJob[]): string {
  if (jobs.length === 0) {
    return "No scheduled jobs found.";
  }
  const lines = jobs.map(
    (j) => `• ${j.command} (ID: ${j.id}) — ${j.frequency} — ${j.status} — user: ${j.user}`,
  );
  return `${jobs.length} scheduled job(s):\n${lines.join("\n")}`;
}

/**
 * Format a single scheduled job.
 */
export function formatScheduledJob(job: ForgeScheduledJob): string {
  return [
    `Job: ${job.command} (ID: ${job.id})`,
    `User: ${job.user}`,
    `Frequency: ${job.frequency}`,
    `Cron: ${job.cron}`,
    `Status: ${job.status}`,
    `Created: ${job.created_at}`,
  ].join("\n");
}

// ── Security Rules ───────────────────────────────────

/**
 * Format a list of security rules.
 */
export function formatSecurityRuleList(rules: ForgeSecurityRule[]): string {
  if (rules.length === 0) {
    return "No security rules found.";
  }
  const lines = rules.map((r) => `• ${r.name} (ID: ${r.id}) — path: ${r.path ?? "/"}`);
  return `${rules.length} security rule(s):\n${lines.join("\n")}`;
}

/**
 * Format a single security rule.
 */
export function formatSecurityRule(rule: ForgeSecurityRule): string {
  return `Security Rule: ${rule.name} (ID: ${rule.id})\nPath: ${rule.path ?? "/"}`;
}

// ── Redirect Rules ───────────────────────────────────

/**
 * Format a list of redirect rules.
 */
export function formatRedirectRuleList(rules: ForgeRedirectRule[]): string {
  if (rules.length === 0) {
    return "No redirect rules found.";
  }
  const lines = rules.map((r) => `• ${r.from} → ${r.to} (ID: ${r.id}) — ${r.type}`);
  return `${rules.length} redirect rule(s):\n${lines.join("\n")}`;
}

/**
 * Format a single redirect rule.
 */
export function formatRedirectRule(rule: ForgeRedirectRule): string {
  return `Redirect Rule: ${rule.from} → ${rule.to} (ID: ${rule.id})\nType: ${rule.type}`;
}

// ── Nginx ────────────────────────────────────────────

/**
 * Format nginx configuration content.
 */
export function formatNginxConfig(content: string): string {
  return `Nginx configuration:\n${content}`;
}

// ── Nginx Templates ──────────────────────────────────

/**
 * Format a list of nginx templates.
 */
export function formatNginxTemplateList(templates: ForgeNginxTemplate[]): string {
  if (templates.length === 0) {
    return "No nginx templates found.";
  }
  const lines = templates.map((t) => `• ${t.name} (ID: ${t.id})`);
  return `${templates.length} nginx template(s):\n${lines.join("\n")}`;
}

/**
 * Format a single nginx template.
 */
export function formatNginxTemplate(template: ForgeNginxTemplate): string {
  return `Nginx Template: ${template.name} (ID: ${template.id})\n\n${template.content}`;
}

// ── Backup Configs ───────────────────────────────────

/**
 * Format a list of backup configurations.
 */
export function formatBackupConfigList(backups: ForgeBackupConfig[]): string {
  if (backups.length === 0) {
    return "No backup configurations found.";
  }
  const lines = backups.map(
    (b) =>
      `• ${b.provider_name} (ID: ${b.id}) — ${b.frequency} — ${b.status} — last: ${b.last_backup_time ?? "never"}`,
  );
  return `${backups.length} backup config(s):\n${lines.join("\n")}`;
}

/**
 * Format a single backup configuration.
 */
export function formatBackupConfig(backup: ForgeBackupConfig): string {
  return [
    `Backup Config: ${backup.provider_name} (ID: ${backup.id})`,
    `Frequency: ${backup.frequency}`,
    `Status: ${backup.status}`,
    `Retention: ${backup.retention} backups`,
    `Databases: ${backup.databases.map((d) => d.name).join(", ") || "none"}`,
    `Last backup: ${backup.last_backup_time ?? "never"}`,
  ].join("\n");
}

// ── Recipes ──────────────────────────────────────────

/**
 * Format a list of recipes.
 */
export function formatRecipeList(recipes: ForgeRecipe[]): string {
  if (recipes.length === 0) {
    return "No recipes found.";
  }
  const lines = recipes.map((r) => `• ${r.name} (ID: ${r.id}) — user: ${r.user}`);
  return `${recipes.length} recipe(s):\n${lines.join("\n")}`;
}

/**
 * Format a single recipe.
 */
export function formatRecipe(recipe: ForgeRecipe): string {
  return `Recipe: ${recipe.name} (ID: ${recipe.id})\nUser: ${recipe.user}\nScript:\n${recipe.script}`;
}

// ── Commands ─────────────────────────────────────────

/**
 * Format a list of commands.
 */
export function formatCommandList(commands: ForgeCommand[]): string {
  if (commands.length === 0) {
    return "No commands found.";
  }
  const lines = commands.map(
    (c) => `• #${c.id} — ${c.status} — ${c.user_name} — ${c.command.slice(0, 60)}`,
  );
  return `${commands.length} command(s):\n${lines.join("\n")}`;
}

/**
 * Format a single command.
 */
export function formatCommand(command: ForgeCommand): string {
  return [
    `Command #${command.id}`,
    `Command: ${command.command}`,
    `Status: ${command.status}`,
    `User: ${command.user_name}`,
    `Created: ${command.created_at}`,
  ].join("\n");
}

// ── Env ──────────────────────────────────────────────

/**
 * Format environment variables content.
 */
export function formatEnv(content: string): string {
  return `Environment variables:\n${content}`;
}

// ── User ─────────────────────────────────────────────

/**
 * Format the authenticated user.
 */
export function formatUser(user: ForgeUser): string {
  return [
    `User: ${user.name} (ID: ${user.id})`,
    `Email: ${user.email}`,
    `GitHub: ${user.connected_to_github ? "connected" : "not connected"}`,
    `GitLab: ${user.connected_to_gitlab ? "connected" : "not connected"}`,
    `2FA: ${user.two_factor_enabled ? "enabled" : "disabled"}`,
  ].join("\n");
}

// ── Generic helpers ──────────────────────────────────

/**
 * Format a deleted resource confirmation.
 */
export function formatDeleted(resource: string, id: string): string {
  return `${resource} ${id} deleted.`;
}

/**
 * Format a created resource confirmation (for simple cases).
 */
export function formatCreated(resource: string, name: string, id: number | string): string {
  return `${resource} created: ${name} (ID: ${id})`;
}
