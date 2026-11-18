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
  revoked: v.nullable(v.boolean()),
  created_at: v.string(),
  updated_at: v.string(),
  connection_status: v.nullable(v.string()),
  timezone: v.string(),
  local_public_key: v.nullable(v.string()),
  is_ready: v.nullable(v.boolean()),
  slug: v.optional(v.string()),
});

export type ServerAttributes = v.InferOutput<typeof ServerAttributesSchema>;

// ── Sites ────────────────────────────────────────────

export const SiteRepositorySchema = v.object({
  provider: v.nullable(v.string()),
  url: v.nullable(v.string()),
  branch: v.nullable(v.string()),
  status: v.nullable(v.string()),
});

export type SiteRepository = v.InferOutput<typeof SiteRepositorySchema>;

export const SiteAttributesSchema = v.object({
  name: v.string(),
  aliases: v.nullable(v.array(v.string())),
  root_directory: v.nullable(v.string()),
  web_directory: v.string(),
  wildcards: v.nullable(v.boolean()),
  status: v.string(),
  repository: v.nullable(SiteRepositorySchema),
  quick_deploy: v.nullable(v.boolean()),
  deployment_status: v.nullable(v.string()),
  deployment_url: v.nullable(v.string()),
  deployment_script: v.nullable(v.string()),
  php_version: v.nullable(v.string()),
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
  deployment_retention: v.optional(v.nullable(v.number())),
  created_at: v.nullable(v.string()),
  updated_at: v.nullable(v.string()),
});

export type SiteAttributes = v.InferOutput<typeof SiteAttributesSchema>;

// ── Domains ──────────────────────────────────────────

export const DomainAttributesSchema = v.object({
  name: v.string(),
  type: v.string(),
  status: v.string(),
  www_redirect_type: v.string(),
  allow_wildcard_subdomains: v.boolean(),
  created_at: v.nullable(v.string()),
  updated_at: v.nullable(v.string()),
});

export type DomainAttributes = v.InferOutput<typeof DomainAttributesSchema>;

// ── Load balancing ───────────────────────────────────

/** A server that a site of a load balancer sends traffic to. */
export const LoadBalancingNodeAttributesSchema = v.object({
  server_id: v.number(),
  port: v.number(),
  weight: v.number(),
  backup: v.boolean(),
  down: v.boolean(),
});

export type LoadBalancingNodeAttributes = v.InferOutput<typeof LoadBalancingNodeAttributesSchema>;

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
  started_at: v.nullable(v.string()),
  ended_at: v.nullable(v.string()),
  created_at: v.string(),
  updated_at: v.string(),
});

export type DeploymentAttributes = v.InferOutput<typeof DeploymentAttributesSchema>;

export const DeploymentStatusAttributesSchema = v.object({
  status: v.nullable(v.string()),
  started_at: v.string(),
});

export type DeploymentStatusAttributes = v.InferOutput<typeof DeploymentStatusAttributesSchema>;

export const DeploymentOutputAttributesSchema = v.object({
  output: v.string(),
});

export type DeploymentOutputAttributes = v.InferOutput<typeof DeploymentOutputAttributesSchema>;

export const DeploymentScriptAttributesSchema = v.object({
  content: v.nullable(v.string()),
  auto_source: v.boolean(),
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

export const BackgroundProcessLogAttributesSchema = v.object({
  content: v.string(),
});

export type BackgroundProcessLogAttributes = v.InferOutput<
  typeof BackgroundProcessLogAttributesSchema
>;

// ── Certificates ─────────────────────────────────────

export const CertificateAttributesSchema = v.object({
  type: v.string(),
  verification_method: v.nullable(v.string()),
  key_type: v.nullable(v.string()),
  preferred_chain: v.nullable(v.string()),
  request_status: v.string(),
  status: v.string(),
  active: v.optional(v.boolean()),
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
  exit_code: v.optional(v.nullable(v.number())),
  error_output: v.optional(v.nullable(v.string())),
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
  database_ids: v.optional(v.array(v.number())),
  include_new_databases: v.optional(v.boolean()),
});

export type BackupConfigAttributes = v.InferOutput<typeof BackupConfigAttributesSchema>;

export const BackupAttributesSchema = v.object({
  status: v.string(),
  is_partial: v.string(),
  size: v.number(),
  // The spec types it as a timestamp (integer) since 2026-11; older answers gave a string.
  finished_at: v.nullable(v.union([v.number(), v.string()])),
});

export type BackupAttributes = v.InferOutput<typeof BackupAttributesSchema>;

// ── Storage providers ────────────────────────────────

export const StorageProviderAttributesSchema = v.object({
  name: v.string(),
  provider: v.string(),
  provider_name: v.string(),
  region: v.nullable(v.string()),
  bucket: v.nullable(v.string()),
  directory: v.nullable(v.string()),
  endpoint: v.nullable(v.string()),
  assume_role: v.nullable(v.boolean()),
  in_use: v.boolean(),
  created_at: v.nullable(v.string()),
  updated_at: v.nullable(v.string()),
});

export type StorageProviderAttributes = v.InferOutput<typeof StorageProviderAttributesSchema>;

// ── Organizations ────────────────────────────────────

export const OrganizationAttributesSchema = v.object({
  name: v.string(),
  slug: v.string(),
  created_at: v.nullable(v.string()),
  updated_at: v.nullable(v.string()),
});

export type OrganizationAttributes = v.InferOutput<typeof OrganizationAttributesSchema>;

// ── Teams ────────────────────────────────────────────

export const TeamAttributesSchema = v.object({
  name: v.string(),
  created_at: v.nullable(v.string()),
  updated_at: v.nullable(v.string()),
});

export type TeamAttributes = v.InferOutput<typeof TeamAttributesSchema>;

// ── Environment ──────────────────────────────────────

export const EnvironmentAttributesSchema = v.object({
  content: v.string(),
});

export type EnvironmentAttributes = v.InferOutput<typeof EnvironmentAttributesSchema>;

// ── PHP ──────────────────────────────────────────────

export const PhpVersionAttributesSchema = v.object({
  version: v.string(),
  binary_name: v.string(),
  status: v.string(),
  created_at: v.string(),
  updated_at: v.string(),
});

export type PhpVersionAttributes = v.InferOutput<typeof PhpVersionAttributesSchema>;

export const PhpConfigAttributesSchema = v.object({
  configuration: v.string(),
});

export type PhpConfigAttributes = v.InferOutput<typeof PhpConfigAttributesSchema>;

// The spec types both limits as nullable integers: accept strings too, as the API gave them before.
export const PhpMaxUploadSizeAttributesSchema = v.object({
  max_upload_size: v.nullable(v.union([v.number(), v.string()])),
});

export type PhpMaxUploadSizeAttributes = v.InferOutput<typeof PhpMaxUploadSizeAttributesSchema>;

export const PhpMaxExecutionTimeAttributesSchema = v.object({
  max_execution_time: v.nullable(v.union([v.number(), v.string()])),
});

export type PhpMaxExecutionTimeAttributes = v.InferOutput<
  typeof PhpMaxExecutionTimeAttributesSchema
>;

export const PhpOpcacheAttributesSchema = v.object({
  opcache_enabled: v.boolean(),
});

export type PhpOpcacheAttributes = v.InferOutput<typeof PhpOpcacheAttributesSchema>;

// ── Logs and outputs ─────────────────────────────────

/** The content of a log: a server log, or the Nginx or application log of a site. */
export const LogAttributesSchema = v.object({
  content: v.string(),
});

export type LogAttributes = v.InferOutput<typeof LogAttributesSchema>;

/** The output of a command, a scheduled job or an event. */
export const OutputAttributesSchema = v.object({
  output: v.string(),
});

export type OutputAttributes = v.InferOutput<typeof OutputAttributesSchema>;

// ── Events ───────────────────────────────────────────

export const EventAttributesSchema = v.object({
  description: v.string(),
  ran_as: v.nullable(v.string()),
  created_at: v.string(),
  updated_at: v.string(),
});

export type EventAttributes = v.InferOutput<typeof EventAttributesSchema>;

// ── Deployment hooks, webhooks and keys ──────────────

export const DeployHookAttributesSchema = v.object({
  url: v.string(),
});

export type DeployHookAttributes = v.InferOutput<typeof DeployHookAttributesSchema>;

export const DeploymentWebhookAttributesSchema = v.object({
  url: v.string(),
  created_at: v.string(),
  updated_at: v.string(),
});

export type DeploymentWebhookAttributes = v.InferOutput<typeof DeploymentWebhookAttributesSchema>;

export const DeployKeyAttributesSchema = v.object({
  key: v.nullable(v.string()),
});

export type DeployKeyAttributes = v.InferOutput<typeof DeployKeyAttributesSchema>;

// ── Domains ─────────────────────────────────────────

export const DomainRecordConfigurationAttributesSchema = v.object({
  type: v.string(),
  name: v.string(),
  value: v.string(),
  ttl: v.nullable(v.number()),
});

export type DomainRecordConfigurationAttributes = v.InferOutput<
  typeof DomainRecordConfigurationAttributesSchema
>;

export const NginxConfigAttributesSchema = v.object({
  content: v.nullable(v.string()),
});

export type NginxConfigAttributes = v.InferOutput<typeof NginxConfigAttributesSchema>;

// ── Site settings ────────────────────────────────────

export const HealthcheckEndpointAttributesSchema = v.object({
  healthcheck_endpoint: v.nullable(v.string()),
});

export type HealthcheckEndpointAttributes = v.InferOutput<
  typeof HealthcheckEndpointAttributesSchema
>;

export const HeartbeatAttributesSchema = v.object({
  name: v.string(),
  status: v.nullable(v.string()),
  grace_period: v.number(),
  frequency: v.number(),
  custom_frequency: v.nullable(v.string()),
  ping_url: v.nullable(v.string()),
});

export type HeartbeatAttributes = v.InferOutput<typeof HeartbeatAttributesSchema>;

export const ComposerCredentialAttributesSchema = v.object({
  repository: v.string(),
  username: v.string(),
  password: v.string(),
});

export type ComposerCredentialAttributes = v.InferOutput<typeof ComposerCredentialAttributesSchema>;

export const NpmCredentialAttributesSchema = v.object({
  registry: v.string(),
  token: v.string(),
  scopes: v.array(v.string()),
});

export type NpmCredentialAttributes = v.InferOutput<typeof NpmCredentialAttributesSchema>;

// ── Integrations ─────────────────────────────────────

// The spec types `enabled` as a string for some integrations and as a boolean for others: accept both.
export const HorizonIntegrationAttributesSchema = v.object({
  enabled: v.union([v.boolean(), v.string()]),
  horizon_installed: v.boolean(),
});

export type HorizonIntegrationAttributes = v.InferOutput<typeof HorizonIntegrationAttributesSchema>;

export const InertiaIntegrationAttributesSchema = v.object({
  enabled: v.union([v.boolean(), v.string()]),
  inertia_installed: v.boolean(),
});

export type InertiaIntegrationAttributes = v.InferOutput<typeof InertiaIntegrationAttributesSchema>;

export const LaravelMaintenanceIntegrationAttributesSchema = v.object({
  enabled: v.union([v.boolean(), v.string()]),
  status: v.nullable(v.string()),
  laravel_installed: v.boolean(),
});

export type LaravelMaintenanceIntegrationAttributes = v.InferOutput<
  typeof LaravelMaintenanceIntegrationAttributesSchema
>;

export const LaravelSchedulerIntegrationAttributesSchema = v.object({
  enabled: v.union([v.boolean(), v.string()]),
  laravel_installed: v.boolean(),
});

export type LaravelSchedulerIntegrationAttributes = v.InferOutput<
  typeof LaravelSchedulerIntegrationAttributesSchema
>;

export const OctaneIntegrationAttributesSchema = v.object({
  enabled: v.union([v.boolean(), v.string()]),
  octane_installed: v.boolean(),
  port: v.nullable(v.number()),
});

export type OctaneIntegrationAttributes = v.InferOutput<typeof OctaneIntegrationAttributesSchema>;

export const PulseIntegrationAttributesSchema = v.object({
  enabled: v.union([v.boolean(), v.string()]),
  pulse_installed: v.boolean(),
});

export type PulseIntegrationAttributes = v.InferOutput<typeof PulseIntegrationAttributesSchema>;

export const ReverbIntegrationAttributesSchema = v.object({
  enabled: v.union([v.boolean(), v.string()]),
  reverb_installed: v.boolean(),
  host: v.nullable(v.string()),
  port: v.nullable(v.number()),
  connections: v.nullable(v.number()),
});

export type ReverbIntegrationAttributes = v.InferOutput<typeof ReverbIntegrationAttributesSchema>;

// ── Server keys ──────────────────────────────────────

export const ServerKeyAttributesSchema = v.object({
  public_key: v.string(),
  fingerprint: v.string(),
});

export type ServerKeyAttributes = v.InferOutput<typeof ServerKeyAttributesSchema>;

// ── Recipes ──────────────────────────────────────────

export const RecipeLogAttributesSchema = v.object({
  server_id: v.number(),
  executed_by: v.nullable(v.number()),
  recipe_id: v.number(),
  status: v.string(),
  output: v.nullable(v.string()),
  started_at: v.nullable(v.string()),
  finished_at: v.nullable(v.string()),
});

export type RecipeLogAttributes = v.InferOutput<typeof RecipeLogAttributesSchema>;

export const ForgeRecipeAttributesSchema = v.object({
  name: v.string(),
  user: v.string(),
  info: v.string(),
  script: v.string(),
  created_at: v.nullable(v.string()),
  updated_at: v.nullable(v.string()),
});

export type ForgeRecipeAttributes = v.InferOutput<typeof ForgeRecipeAttributesSchema>;

// ── Teams and roles ──────────────────────────────────

export const MembershipAttributesSchema = v.object({
  name: v.string(),
  email: v.string(),
  created_at: v.nullable(v.string()),
  updated_at: v.nullable(v.string()),
});

export type MembershipAttributes = v.InferOutput<typeof MembershipAttributesSchema>;

export const TeamInvitationAttributesSchema = v.object({
  email: v.string(),
  created_at: v.nullable(v.string()),
  updated_at: v.nullable(v.string()),
});

export type TeamInvitationAttributes = v.InferOutput<typeof TeamInvitationAttributesSchema>;

export const RoleAttributesSchema = v.object({
  name: v.string(),
  created_at: v.nullable(v.string()),
  updated_at: v.nullable(v.string()),
});

export type RoleAttributes = v.InferOutput<typeof RoleAttributesSchema>;

export const PermissionAttributesSchema = v.object({
  name: v.string(),
});

export type PermissionAttributes = v.InferOutput<typeof PermissionAttributesSchema>;

// ── Providers and credentials ────────────────────────

export const ProviderAttributesSchema = v.object({
  name: v.string(),
  slug: v.string(),
  simple_name: v.nullable(v.string()),
  currency: v.string(),
  currency_symbol: v.string(),
  default_size_code: v.nullable(v.string()),
  default_region_code: v.nullable(v.string()),
});

export type ProviderAttributes = v.InferOutput<typeof ProviderAttributesSchema>;

export const ProviderRegionAttributesSchema = v.object({
  name: v.string(),
  code: v.string(),
  alternate_code: v.nullable(v.string()),
});

export type ProviderRegionAttributes = v.InferOutput<typeof ProviderRegionAttributesSchema>;

export const ProviderSizeAttributesSchema = v.object({
  name: v.string(),
  code: v.string(),
  series: v.string(),
  category: v.string(),
  cpus: v.number(),
  disk_type: v.string(),
  architecture: v.string(),
  ram: v.number(),
  disk: v.number(),
});

export type ProviderSizeAttributes = v.InferOutput<typeof ProviderSizeAttributesSchema>;

export const ProviderRegionSizeAttributesSchema = v.object({
  name: v.string(),
});

export type ProviderRegionSizeAttributes = v.InferOutput<typeof ProviderRegionSizeAttributesSchema>;

export const ServerCredentialAttributesSchema = v.object({
  name: v.string(),
  provider: v.string(),
  in_use: v.boolean(),
  created_at: v.nullable(v.string()),
  updated_at: v.nullable(v.string()),
});

export type ServerCredentialAttributes = v.InferOutput<typeof ServerCredentialAttributesSchema>;

export const VpcAttributesSchema = v.object({
  name: v.string(),
  cidrBlock: v.string(),
  subnets: v.array(
    v.object({
      id: v.string(),
      name: v.string(),
      cidrBlock: v.string(),
    }),
  ),
  region: v.string(),
});

export type VpcAttributes = v.InferOutput<typeof VpcAttributesSchema>;
