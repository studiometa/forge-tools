// ── Valibot schemas for request data types ───────────
// These define the shape of data sent to the Forge API
// when creating or updating resources.

import * as v from "valibot";

// ── Servers ──────────────────────────────────────────

export const CreateServerDataSchema = v.object({
  name: v.string(),
  provider: v.string(),
  type: v.string(),
  ubuntu_version: v.string(),
  credential_id: v.optional(v.string()),
  team_id: v.optional(v.nullable(v.number())),
  php_version: v.optional(v.string()),
  database_type: v.optional(v.string()),
  recipe_id: v.optional(v.nullable(v.number())),
  tags: v.optional(v.nullable(v.array(v.string()))),
  ocean2: v.optional(v.record(v.string(), v.unknown())),
  aws: v.optional(v.record(v.string(), v.unknown())),
  hetzner: v.optional(v.record(v.string(), v.unknown())),
  vultr: v.optional(v.record(v.string(), v.unknown())),
  akamai: v.optional(v.record(v.string(), v.unknown())),
  laravel: v.optional(v.record(v.string(), v.unknown())),
  custom: v.optional(v.record(v.string(), v.unknown())),
});

export type CreateServerData = v.InferOutput<typeof CreateServerDataSchema>;

// ── Sites ────────────────────────────────────────────

export const CreateSiteDataSchema = v.object({
  type: v.string(),
  name: v.optional(v.string()),
  domain_mode: v.optional(v.string()),
  www_redirect_type: v.optional(v.string()),
  allow_wildcard_subdomains: v.optional(v.string()),
  root_directory: v.optional(v.nullable(v.string())),
  web_directory: v.optional(v.nullable(v.string())),
  is_isolated: v.optional(v.boolean()),
  isolated_user: v.optional(v.string()),
  php_version: v.optional(v.string()),
  zero_downtime_deployments: v.optional(v.boolean()),
  nginx_template_id: v.optional(v.number()),
  source_control_provider: v.optional(v.nullable(v.string())),
  repository: v.optional(v.nullable(v.string())),
  branch: v.optional(v.nullable(v.string())),
  database_id: v.optional(v.nullable(v.number())),
  database_user_id: v.optional(v.string()),
  push_to_deploy: v.optional(v.boolean()),
  tags: v.optional(v.nullable(v.array(v.string()))),
  shared_paths: v.optional(v.array(v.string())),
});

export type CreateSiteData = v.InferOutput<typeof CreateSiteDataSchema>;

export const UpdateSiteDataSchema = v.object({
  root_path: v.optional(v.nullable(v.string())),
  directory: v.optional(v.nullable(v.string())),
  type: v.optional(v.string()),
  php_version: v.optional(v.string()),
  push_to_deploy: v.optional(v.boolean()),
  repository_branch: v.optional(v.nullable(v.string())),
});

export type UpdateSiteData = v.InferOutput<typeof UpdateSiteDataSchema>;

// ── Certificates ─────────────────────────────────────

export const CreateCertificateDataSchema = v.object({
  type: v.picklist(["letsencrypt", "csr", "existing", "clone"]),
  letsencrypt: v.optional(
    v.object({
      verification_method: v.optional(v.picklist(["http-01", "dns-01"])),
      key_type: v.optional(v.picklist(["rsa", "ecdsa"])),
      preferred_chain: v.optional(v.nullable(v.picklist(["ISRG Root X1"]))),
    }),
  ),
  existing: v.optional(
    v.object({
      key: v.string(),
      certificate: v.string(),
    }),
  ),
  csr: v.optional(
    v.object({
      domain: v.string(),
      sans: v.optional(v.nullable(v.string())),
      country: v.string(),
      state: v.string(),
      city: v.string(),
      organization: v.string(),
      department: v.string(),
    }),
  ),
  clone: v.optional(
    v.object({
      certificate_id: v.number(),
    }),
  ),
});

export type CreateCertificateData = v.InferOutput<typeof CreateCertificateDataSchema>;

// ── Databases ────────────────────────────────────────

export const CreateDatabaseDataSchema = v.object({
  name: v.string(),
  user: v.optional(v.nullable(v.string())),
  password: v.optional(v.nullable(v.string())),
});

export type CreateDatabaseData = v.InferOutput<typeof CreateDatabaseDataSchema>;

export const CreateDatabaseUserDataSchema = v.object({
  name: v.string(),
  password: v.string(),
  read_only: v.optional(v.boolean()),
  database_ids: v.optional(v.array(v.number())),
});

export type CreateDatabaseUserData = v.InferOutput<typeof CreateDatabaseUserDataSchema>;

// ── Daemons (Background Processes) ───────────────────

export const CreateDaemonDataSchema = v.object({
  name: v.string(),
  command: v.string(),
  user: v.string(),
  directory: v.optional(v.nullable(v.string())),
  processes: v.number(),
  startsecs: v.optional(v.number()),
  stopwaitsecs: v.optional(v.number()),
  stopsignal: v.optional(v.nullable(v.string())),
});

export type CreateDaemonData = v.InferOutput<typeof CreateDaemonDataSchema>;

// ── Backups ──────────────────────────────────────────

export const CreateBackupConfigDataSchema = v.object({
  storage_provider_id: v.number(),
  frequency: v.string(),
  retention: v.number(),
  database_ids: v.array(v.number()),
  name: v.optional(v.nullable(v.string())),
  bucket: v.optional(v.nullable(v.string())),
  directory: v.optional(v.nullable(v.string())),
  day: v.optional(v.string()),
  time: v.optional(v.string()),
  cron: v.optional(v.string()),
  notification_email: v.optional(v.nullable(v.string())),
});

export type CreateBackupConfigData = v.InferOutput<typeof CreateBackupConfigDataSchema>;

// ── Commands ─────────────────────────────────────────

export const CreateCommandDataSchema = v.object({
  command: v.string(),
});

export type CreateCommandData = v.InferOutput<typeof CreateCommandDataSchema>;

// ── Scheduled Jobs ───────────────────────────────────

export const CreateScheduledJobDataSchema = v.object({
  command: v.string(),
  user: v.string(),
  frequency: v.string(),
  name: v.optional(v.nullable(v.string())),
  cron: v.optional(v.nullable(v.string())),
  heartbeat: v.optional(v.nullable(v.boolean())),
  grace_period: v.optional(v.string()),
});

export type CreateScheduledJobData = v.InferOutput<typeof CreateScheduledJobDataSchema>;

// ── Firewall Rules ───────────────────────────────────

export const CreateFirewallRuleDataSchema = v.object({
  name: v.string(),
  type: v.string(),
  port: v.optional(v.nullable(v.string())),
  ip_address: v.optional(v.string()),
});

export type CreateFirewallRuleData = v.InferOutput<typeof CreateFirewallRuleDataSchema>;

// ── SSH Keys ─────────────────────────────────────────

export const CreateSshKeyDataSchema = v.object({
  name: v.string(),
  key: v.string(),
  user: v.optional(v.nullable(v.string())),
});

export type CreateSshKeyData = v.InferOutput<typeof CreateSshKeyDataSchema>;

// ── Security Rules ───────────────────────────────────

export const CreateSecurityRuleDataSchema = v.object({
  name: v.string(),
  path: v.optional(v.string()),
  credentials: v.array(
    v.object({
      username: v.string(),
      password: v.string(),
    }),
  ),
});

export type CreateSecurityRuleData = v.InferOutput<typeof CreateSecurityRuleDataSchema>;

// ── Redirect Rules ───────────────────────────────────

export const CreateRedirectRuleDataSchema = v.object({
  from: v.string(),
  to: v.string(),
  type: v.string(),
});

export type CreateRedirectRuleData = v.InferOutput<typeof CreateRedirectRuleDataSchema>;

// ── Monitors ─────────────────────────────────────────

export const CreateMonitorDataSchema = v.object({
  type: v.string(),
  operator: v.string(),
  threshold: v.number(),
  notify: v.string(),
  minutes: v.optional(v.number()),
});

export type CreateMonitorData = v.InferOutput<typeof CreateMonitorDataSchema>;

// ── Nginx Templates ──────────────────────────────────

export const CreateNginxTemplateDataSchema = v.object({
  name: v.string(),
  content: v.string(),
});

export type CreateNginxTemplateData = v.InferOutput<typeof CreateNginxTemplateDataSchema>;

// ── Recipes ──────────────────────────────────────────

export const CreateRecipeDataSchema = v.object({
  name: v.string(),
  user: v.string(),
  script: v.string(),
  team_id: v.optional(v.string()),
});

export type CreateRecipeData = v.InferOutput<typeof CreateRecipeDataSchema>;
