// ── Valibot schemas for v2 API resource attributes ───
// These match the `attributes` object in JSON:API responses
// as defined in docs/forge-openapi-v2.json.
//
// Each schema exports both a runtime validator and a derived TypeScript type.

import * as v from "valibot";

// ── User ─────────────────────────────────────────────

export const UserAttributesSchema = v.object({
  name: v.string(),
  email: v.string(),
  created_at: v.nullable(v.string()),
  updated_at: v.nullable(v.string()),
});

export type UserAttributes = v.InferOutput<typeof UserAttributesSchema>;

// ── Servers ──────────────────────────────────────────

export const ServerAttributesSchema = v.object({
  id: v.number(),
  credential_id: v.nullable(v.number()),
  name: v.string(),
  type: v.string(),
  ubuntu_version: v.nullable(v.string()),
  ssh_port: v.number(),
  provider: v.string(),
  identifier: v.nullable(v.string()),
  size: v.string(),
  region: v.string(),
  php_version: v.nullable(v.string()),
  php_cli_version: v.nullable(v.string()),
  opcache_status: v.nullable(v.string()),
  database_type: v.nullable(v.string()),
  db_status: v.nullable(v.string()),
  redis_status: v.nullable(v.string()),
  ip_address: v.nullable(v.string()),
  private_ip_address: v.nullable(v.string()),
  revoked: v.boolean(),
  created_at: v.string(),
  updated_at: v.string(),
  connection_status: v.string(),
  timezone: v.string(),
  local_public_key: v.nullable(v.string()),
  is_ready: v.boolean(),
});

export type ServerAttributes = v.InferOutput<typeof ServerAttributesSchema>;

// ── Sites ────────────────────────────────────────────

export const SiteRepositorySchema = v.object({
  provider: v.string(),
  url: v.string(),
  branch: v.string(),
  status: v.string(),
});

export type SiteRepository = v.InferOutput<typeof SiteRepositorySchema>;

export const SiteAttributesSchema = v.object({
  name: v.string(),
  aliases: v.array(v.string()),
  root_directory: v.nullable(v.string()),
  web_directory: v.string(),
  wildcards: v.nullable(v.boolean()),
  status: v.string(),
  repository: v.nullable(SiteRepositorySchema),
  quick_deploy: v.nullable(v.boolean()),
  deployment_status: v.nullable(v.string()),
  deployment_url: v.string(),
  deployment_script: v.nullable(v.string()),
  php_version: v.string(),
  app_type: v.string(),
  url: v.string(),
  https: v.boolean(),
  isolated: v.boolean(),
  user: v.string(),
  database: v.nullable(v.string()),
  shared_paths: v.nullable(v.record(v.string(), v.string())),
  uses_envoyer: v.boolean(),
  zero_downtime_deployments: v.boolean(),
  maintenance_mode: v.nullable(v.record(v.string(), v.unknown())),
  healthcheck_url: v.nullable(v.string()),
  created_at: v.nullable(v.string()),
  updated_at: v.nullable(v.string()),
});

export type SiteAttributes = v.InferOutput<typeof SiteAttributesSchema>;

// ── Deployments ──────────────────────────────────────

export const DeploymentCommitSchema = v.object({
  hash: v.nullable(v.string()),
  author: v.nullable(v.string()),
  message: v.nullable(v.string()),
  branch: v.nullable(v.string()),
});

export type DeploymentCommit = v.InferOutput<typeof DeploymentCommitSchema>;

export const DeploymentAttributesSchema = v.object({
  commit: DeploymentCommitSchema,
  status: v.string(),
  type: v.string(),
  started_at: v.string(),
  ended_at: v.nullable(v.string()),
  created_at: v.string(),
  updated_at: v.string(),
});

export type DeploymentAttributes = v.InferOutput<typeof DeploymentAttributesSchema>;

export const DeploymentStatusAttributesSchema = v.object({
  status: v.string(),
  started_at: v.string(),
});

export type DeploymentStatusAttributes = v.InferOutput<typeof DeploymentStatusAttributesSchema>;

export const DeploymentOutputAttributesSchema = v.object({
  output: v.string(),
});

export type DeploymentOutputAttributes = v.InferOutput<typeof DeploymentOutputAttributesSchema>;

export const DeploymentScriptAttributesSchema = v.object({
  content: v.string(),
  auto_source: v.string(),
});

export type DeploymentScriptAttributes = v.InferOutput<typeof DeploymentScriptAttributesSchema>;

// ── Databases ────────────────────────────────────────

export const DatabaseAttributesSchema = v.object({
  name: v.string(),
  status: v.string(),
  created_at: v.string(),
  updated_at: v.string(),
});

export type DatabaseAttributes = v.InferOutput<typeof DatabaseAttributesSchema>;

export const DatabaseUserAttributesSchema = v.object({
  name: v.string(),
  status: v.string(),
  created_at: v.string(),
  updated_at: v.string(),
});

export type DatabaseUserAttributes = v.InferOutput<typeof DatabaseUserAttributesSchema>;

// ── Daemons (Background Processes) ───────────────────

export const BackgroundProcessAttributesSchema = v.object({
  command: v.string(),
  user: v.string(),
  directory: v.nullable(v.string()),
  processes: v.number(),
  status: v.string(),
  created_at: v.string(),
});

export type BackgroundProcessAttributes = v.InferOutput<typeof BackgroundProcessAttributesSchema>;

// ── Certificates ─────────────────────────────────────

export const CertificateAttributesSchema = v.object({
  type: v.string(),
  verification_method: v.nullable(v.string()),
  key_type: v.nullable(v.string()),
  preferred_chain: v.nullable(v.string()),
  request_status: v.string(),
  status: v.string(),
  created_at: v.string(),
  updated_at: v.string(),
});

export type CertificateAttributes = v.InferOutput<typeof CertificateAttributesSchema>;

// ── Firewall Rules ───────────────────────────────────

export const FirewallRuleAttributesSchema = v.object({
  name: v.string(),
  port: v.nullable(v.string()),
  type: v.string(),
  ip_address: v.nullable(v.string()),
  status: v.nullable(v.string()),
  created_at: v.string(),
  updated_at: v.string(),
});

export type FirewallRuleAttributes = v.InferOutput<typeof FirewallRuleAttributesSchema>;

// ── SSH Keys ─────────────────────────────────────────

export const SshKeyAttributesSchema = v.object({
  name: v.string(),
  user: v.string(),
  status: v.string(),
  created_by: v.nullable(v.number()),
  created_at: v.string(),
  updated_at: v.string(),
});

export type SshKeyAttributes = v.InferOutput<typeof SshKeyAttributesSchema>;

// ── Security Rules ───────────────────────────────────

export const SecurityRuleAttributesSchema = v.object({
  name: v.string(),
  path: v.nullable(v.string()),
  status: v.nullable(v.string()),
  created_at: v.string(),
  updated_at: v.string(),
});

export type SecurityRuleAttributes = v.InferOutput<typeof SecurityRuleAttributesSchema>;

// ── Redirect Rules ───────────────────────────────────

export const RedirectRuleAttributesSchema = v.object({
  from: v.string(),
  to: v.string(),
  type: v.string(),
  status: v.string(),
  created_at: v.string(),
  updated_at: v.string(),
});

export type RedirectRuleAttributes = v.InferOutput<typeof RedirectRuleAttributesSchema>;

// ── Monitors ─────────────────────────────────────────

export const MonitorAttributesSchema = v.object({
  type: v.string(),
  operator: v.string(),
  threshold: v.number(),
  minutes: v.nullable(v.number()),
  notify: v.string(),
  status: v.string(),
  state: v.string(),
  state_changed_at: v.nullable(v.string()),
  created_at: v.string(),
  updated_at: v.string(),
});

export type MonitorAttributes = v.InferOutput<typeof MonitorAttributesSchema>;

// ── Nginx Templates ──────────────────────────────────

export const NginxTemplateAttributesSchema = v.object({
  name: v.string(),
  content: v.string(),
  created_at: v.nullable(v.string()),
  updated_at: v.nullable(v.string()),
});

export type NginxTemplateAttributes = v.InferOutput<typeof NginxTemplateAttributesSchema>;

// ── Recipes ──────────────────────────────────────────

export const RecipeAttributesSchema = v.object({
  name: v.string(),
  user: v.string(),
  script: v.string(),
  created_at: v.string(),
  updated_at: v.string(),
});

export type RecipeAttributes = v.InferOutput<typeof RecipeAttributesSchema>;

// ── Scheduled Jobs ───────────────────────────────────

export const ScheduledJobAttributesSchema = v.object({
  name: v.nullable(v.string()),
  command: v.string(),
  user: v.string(),
  frequency: v.string(),
  cron: v.string(),
  next_run_time: v.string(),
  status: v.string(),
  created_at: v.nullable(v.string()),
  updated_at: v.nullable(v.string()),
});

export type ScheduledJobAttributes = v.InferOutput<typeof ScheduledJobAttributesSchema>;

// ── Commands ─────────────────────────────────────────

export const CommandAttributesSchema = v.object({
  command: v.string(),
  status: v.string(),
  duration: v.string(),
  user_id: v.number(),
  created_at: v.string(),
  updated_at: v.string(),
});

export type CommandAttributes = v.InferOutput<typeof CommandAttributesSchema>;

// ── Backups ──────────────────────────────────────────

export const BackupConfigAttributesSchema = v.object({
  name: v.string(),
  storage_provider_id: v.nullable(v.number()),
  provider: v.string(),
  bucket: v.nullable(v.string()),
  directory: v.string(),
  schedule: v.string(),
  displayable_schedule: v.string(),
  next_run_time: v.string(),
  status: v.string(),
  day_of_week: v.nullable(v.number()),
  time: v.nullable(v.string()),
  cron_schedule: v.nullable(v.string()),
  retention: v.number(),
  notify_email: v.nullable(v.string()),
});

export type BackupConfigAttributes = v.InferOutput<typeof BackupConfigAttributesSchema>;

export const BackupAttributesSchema = v.object({
  status: v.string(),
  is_partial: v.string(),
  size: v.number(),
  finished_at: v.string(),
});

export type BackupAttributes = v.InferOutput<typeof BackupAttributesSchema>;

// ── Organizations ────────────────────────────────────

export const OrganizationAttributesSchema = v.object({
  name: v.string(),
  slug: v.string(),
  created_at: v.nullable(v.string()),
  updated_at: v.nullable(v.string()),
});

export type OrganizationAttributes = v.InferOutput<typeof OrganizationAttributesSchema>;

// ── Environment ──────────────────────────────────────

export const EnvironmentAttributesSchema = v.object({
  content: v.string(),
});

export type EnvironmentAttributes = v.InferOutput<typeof EnvironmentAttributesSchema>;
