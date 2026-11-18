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
  credential_id: v.optional(v.number()),
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
  laravel: v.optional(
    v.object({ region_id: v.optional(v.string()), size_id: v.optional(v.string()) }),
  ),
  custom: v.optional(
    v.object({
      ip_address: v.optional(v.string()),
      private_ip_address: v.optional(v.nullable(v.string())),
      ssh_port: v.optional(v.number()),
      behind_nat: v.optional(v.boolean()),
      nat_ssh_port: v.optional(v.nullable(v.number())),
    }),
  ),
});

export type CreateServerData = v.InferOutput<typeof CreateServerDataSchema>;

export const UpdateServerDataSchema = v.object({
  name: v.optional(v.string()),
  ip_address: v.optional(v.string()),
  private_ip_address: v.optional(v.string()),
  timezone: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
});

export type UpdateServerData = v.InferOutput<typeof UpdateServerDataSchema>;

// ── Sites ────────────────────────────────────────────

export const CreateSiteDataSchema = v.object({
  type: v.string(),
  name: v.string(),
  domain_mode: v.optional(v.string()),
  www_redirect_type: v.optional(v.string()),
  allow_wildcard_subdomains: v.optional(v.boolean()),
  root_directory: v.optional(v.nullable(v.string())),
  web_directory: v.optional(v.nullable(v.string())),
  is_isolated: v.optional(v.boolean()),
  isolated_user: v.optional(v.string()),
  php_version: v.optional(v.string()),
  zero_downtime_deployments: v.optional(v.boolean()),
  nginx_template_id: v.optional(v.number()),
  source_control_provider: v.optional(v.nullable(v.string())),
  source_control_provider_id: v.optional(v.nullable(v.number())),
  repository: v.optional(v.nullable(v.string())),
  branch: v.optional(v.nullable(v.string())),
  database_id: v.optional(v.number()),
  database_user_id: v.optional(v.number()),
  push_to_deploy: v.optional(v.boolean()),
  tags: v.optional(v.nullable(v.array(v.string()))),
  shared_paths: v.optional(v.array(v.string())),
  frontend_build_command: v.optional(v.string()),
  frontend_package_manager: v.optional(v.string()),
  generate_deploy_key: v.optional(v.boolean()),
  install_composer_dependencies: v.optional(v.boolean()),
  nuxt_next_mode: v.optional(v.string()),
  nuxt_next_port: v.optional(v.number()),
  private_deploy_key: v.optional(v.string()),
  public_deploy_key: v.optional(v.string()),
  statamic_setup: v.optional(v.string()),
  statamic_starter_kit: v.optional(v.string()),
  statamic_super_user_email: v.optional(v.string()),
  statamic_super_user_password: v.optional(v.nullable(v.string())),
});

export type CreateSiteData = v.InferOutput<typeof CreateSiteDataSchema>;

export const UpdateSiteDataSchema = v.object({
  root_path: v.optional(v.nullable(v.string())),
  directory: v.optional(v.nullable(v.string())),
  type: v.optional(v.string()),
  php_version: v.optional(v.string()),
  push_to_deploy: v.optional(v.boolean()),
  repository_branch: v.optional(v.nullable(v.string())),
  deployment_retention: v.optional(v.number()),
});

export type UpdateSiteData = v.InferOutput<typeof UpdateSiteDataSchema>;

// ── Domains ──────────────────────────────────────────

/** The `www` redirect of a domain: `to-www` sends `example.com` to `www.example.com`. */
export const WWW_REDIRECT_TYPES = ["from-www", "to-www", "none"] as const;

export const CreateDomainDataSchema = v.object({
  name: v.string(),
  allow_wildcard_subdomains: v.boolean(),
  www_redirect_type: v.picklist(WWW_REDIRECT_TYPES),
});

export type CreateDomainData = v.InferOutput<typeof CreateDomainDataSchema>;

export const UpdateDomainDataSchema = v.object({
  www_redirect_type: v.picklist(WWW_REDIRECT_TYPES),
  allow_wildcard_subdomains: v.optional(v.nullable(v.boolean())),
});

export type UpdateDomainData = v.InferOutput<typeof UpdateDomainDataSchema>;

// ── Load balancing ───────────────────────────────────

export const LOAD_BALANCER_METHODS = ["round_robin", "least_conn", "ip_hash"] as const;

/** The servers of a site of a load balancer. The list replaces the current nodes. */
export const UpdateLoadBalancingNodesDataSchema = v.object({
  balancer_method: v.picklist(LOAD_BALANCER_METHODS),
  balancing: v.pipe(
    v.array(
      v.object({
        server_id: v.number(),
        port: v.optional(v.number()),
        weight: v.number(),
        backup: v.optional(v.boolean()),
        down: v.optional(v.boolean()),
      }),
    ),
    v.minLength(1),
  ),
});

export type UpdateLoadBalancingNodesData = v.InferOutput<typeof UpdateLoadBalancingNodesDataSchema>;

// ── Certificates ─────────────────────────────────────

export const CreateCertificateDataSchema = v.object({
  type: v.picklist(["letsencrypt", "csr", "existing", "clone"]),
  /** Activate the certificate once installed (ignored for Let's Encrypt and CSR). */
  enable: v.optional(v.boolean()),
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
  backup_configuration_ids: v.optional(v.array(v.number())),
});

export type CreateDatabaseData = v.InferOutput<typeof CreateDatabaseDataSchema>;

export const CreateDatabaseUserDataSchema = v.object({
  name: v.string(),
  password: v.string(),
  read_only: v.optional(v.boolean()),
  database_ids: v.optional(v.array(v.number())),
});

export type CreateDatabaseUserData = v.InferOutput<typeof CreateDatabaseUserDataSchema>;

export const UpdateDatabaseUserDataSchema = v.object({
  password: v.optional(v.nullable(v.string())),
  database_ids: v.optional(v.array(v.number())),
});

export type UpdateDatabaseUserData = v.InferOutput<typeof UpdateDatabaseUserDataSchema>;

// ── Daemons (Background Processes) ───────────────────

export const CreateDaemonDataSchema = v.object({
  name: v.string(),
  site_id: v.optional(v.number()),
  command: v.string(),
  user: v.string(),
  directory: v.optional(v.nullable(v.string())),
  processes: v.number(),
  startsecs: v.optional(v.number()),
  stopwaitsecs: v.optional(v.number()),
  stopsignal: v.optional(v.nullable(v.string())),
});

export type CreateDaemonData = v.InferOutput<typeof CreateDaemonDataSchema>;

export const UpdateDaemonDataSchema = v.object({
  name: v.string(),
  config: v.optional(v.string()),
});

export type UpdateDaemonData = v.InferOutput<typeof UpdateDaemonDataSchema>;

// ── Backups ──────────────────────────────────────────

export const CreateBackupConfigDataSchema = v.object({
  storage_provider_id: v.number(),
  frequency: v.string(),
  retention: v.number(),
  database_ids: v.array(v.number()),
  include_new_databases: v.optional(v.boolean()),
  name: v.optional(v.nullable(v.string())),
  bucket: v.optional(v.nullable(v.string())),
  directory: v.optional(v.nullable(v.string())),
  day: v.optional(v.string()),
  time: v.optional(v.string()),
  cron: v.optional(v.string()),
  notification_email: v.optional(v.nullable(v.string())),
});

export type CreateBackupConfigData = v.InferOutput<typeof CreateBackupConfigDataSchema>;

export const UpdateBackupConfigDataSchema = v.object({
  storage_provider_id: v.number(),
  frequency: v.string(),
  retention: v.number(),
  database_ids: v.array(v.number()),
  include_new_databases: v.optional(v.boolean()),
  name: v.optional(v.nullable(v.string())),
  bucket: v.optional(v.nullable(v.string())),
  directory: v.optional(v.nullable(v.string())),
  day: v.optional(v.string()),
  time: v.optional(v.string()),
  cron: v.optional(v.string()),
  notification_email: v.optional(v.nullable(v.string())),
});

export type UpdateBackupConfigData = v.InferOutput<typeof UpdateBackupConfigDataSchema>;

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
  grace_period: v.optional(v.picklist([1, 2, 5, 10, 30, 60])),
});

export type CreateScheduledJobData = v.InferOutput<typeof CreateScheduledJobDataSchema>;

// ── Firewall Rules ───────────────────────────────────

export const CreateFirewallRuleDataSchema = v.object({
  name: v.string(),
  type: v.picklist(["allow", "deny"]),
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

export const UpdateSecurityRuleDataSchema = v.object({
  name: v.string(),
  path: v.optional(v.nullable(v.string())),
  credentials: v.array(
    v.object({
      username: v.string(),
      password: v.string(),
    }),
  ),
});

export type UpdateSecurityRuleData = v.InferOutput<typeof UpdateSecurityRuleDataSchema>;

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

// ── Storage providers ────────────────────────────────

export const STORAGE_PROVIDER_TYPES = [
  "s3",
  "spaces",
  "hetzner",
  "ovh",
  "scaleway",
  "custom",
] as const;

export const CreateStorageProviderDataSchema = v.object({
  name: v.pipe(v.string(), v.maxLength(255)),
  provider: v.picklist(STORAGE_PROVIDER_TYPES),
  region: v.optional(v.string()),
  bucket: v.optional(v.nullable(v.string())),
  directory: v.optional(v.nullable(v.string())),
  endpoint: v.optional(v.string()),
  access_key: v.optional(v.nullable(v.string())),
  secret_key: v.optional(v.nullable(v.string())),
  assume_role: v.optional(v.boolean()),
});

export type CreateStorageProviderData = v.InferOutput<typeof CreateStorageProviderDataSchema>;

// ── Recipes ──────────────────────────────────────────

export const CreateRecipeDataSchema = v.object({
  name: v.string(),
  user: v.string(),
  script: v.string(),
  team_id: v.optional(v.number()),
});

export type CreateRecipeData = v.InferOutput<typeof CreateRecipeDataSchema>;

export const UpdateRecipeDataSchema = v.object({
  name: v.optional(v.string()),
  user: v.optional(v.string()),
  script: v.optional(v.string()),
});

export type UpdateRecipeData = v.InferOutput<typeof UpdateRecipeDataSchema>;

// ── Servers: archives, network, PHP ──────────────────

export const ArchiveServerDataSchema = v.object({
  server_id: v.number(),
});

export type ArchiveServerData = v.InferOutput<typeof ArchiveServerDataSchema>;

export const UpdateServerNetworkDataSchema = v.object({
  servers: v.array(v.number()),
});

export type UpdateServerNetworkData = v.InferOutput<typeof UpdateServerNetworkDataSchema>;

export const CreatePhpVersionDataSchema = v.object({
  version: v.picklist([
    "php5",
    "php56-old",
    "php56",
    "php70",
    "php71",
    "php72",
    "php73",
    "php74",
    "php80",
    "php81",
    "php82",
    "php83",
    "php84",
    "php85",
  ]),
  cli_default: v.optional(v.boolean()),
  site_default: v.optional(v.boolean()),
});

export type CreatePhpVersionData = v.InferOutput<typeof CreatePhpVersionDataSchema>;

export const UpdatePhpDefaultVersionDataSchema = v.object({
  php_version: v.picklist([
    "5.6",
    "7.0",
    "7.1",
    "7.2",
    "7.3",
    "7.4",
    "8.0",
    "8.1",
    "8.2",
    "8.3",
    "8.4",
    "8.5",
  ]),
});

export type UpdatePhpDefaultVersionData = v.InferOutput<typeof UpdatePhpDefaultVersionDataSchema>;

export const UpdatePhpSettingsDataSchema = v.object({
  max_upload_size: v.optional(v.nullable(v.number())),
  max_execution_time: v.optional(v.nullable(v.number())),
  memory_limit: v.optional(v.nullable(v.number())),
  opcache: v.optional(v.nullable(v.boolean())),
});

export type UpdatePhpSettingsData = v.InferOutput<typeof UpdatePhpSettingsDataSchema>;

export const UpdatePhpPoolDataSchema = v.object({
  config: v.string(),
  user: v.optional(v.nullable(v.string())),
});

export type UpdatePhpPoolData = v.InferOutput<typeof UpdatePhpPoolDataSchema>;

export const UpdateDatabasePasswordDataSchema = v.object({
  password: v.string(),
});

export type UpdateDatabasePasswordData = v.InferOutput<typeof UpdateDatabasePasswordDataSchema>;

export const RestoreBackupDataSchema = v.object({
  database_id: v.number(),
});

export type RestoreBackupData = v.InferOutput<typeof RestoreBackupDataSchema>;

// ── Sites: git, domains, integrations, settings ──────

export const UpdateGitDataSchema = v.object({
  source_control_provider: v.picklist(["github", "gitlab", "bitbucket", "gitlab-custom", "custom"]),
  source_control_provider_id: v.optional(v.number()),
  repository: v.string(),
  branch: v.string(),
  per_account_public_key: v.optional(v.string()),
  per_account_private_key: v.optional(v.string()),
});

export type UpdateGitData = v.InferOutput<typeof UpdateGitDataSchema>;

export const DomainActionDataSchema = v.object({
  action: v.picklist(["enable", "disable", "mark-as-primary"]),
  update_wordpress_urls: v.optional(v.boolean()),
});

export type DomainActionData = v.InferOutput<typeof DomainActionDataSchema>;

export const EnableMaintenanceModeDataSchema = v.object({
  secret: v.optional(v.nullable(v.string())),
  status: v.picklist([304, 307, 410, 503]),
  redirect: v.optional(v.nullable(v.string())),
});

export type EnableMaintenanceModeData = v.InferOutput<typeof EnableMaintenanceModeDataSchema>;

export const EnableOctaneDataSchema = v.object({
  port: v.string(),
  server: v.picklist(["swoole", "roadrunner", "frankenphp"]),
});

export type EnableOctaneData = v.InferOutput<typeof EnableOctaneDataSchema>;

export const EnableReverbDataSchema = v.object({
  host: v.string(),
  port: v.string(),
  connections: v.number(),
});

export type EnableReverbData = v.InferOutput<typeof EnableReverbDataSchema>;

export const UpdateHealthcheckEndpointDataSchema = v.object({
  healthcheck_endpoint: v.optional(v.nullable(v.string())),
});

export type UpdateHealthcheckEndpointData = v.InferOutput<
  typeof UpdateHealthcheckEndpointDataSchema
>;

export const CreateHeartbeatDataSchema = v.object({
  name: v.string(),
  grace_period: v.picklist([1, 2, 5, 10, 30, 60]),
  frequency: v.picklist([1, 5, 10, 30, 60, 1440, 10080, 312480, -1]),
  custom_frequency: v.optional(v.string()),
});

export type CreateHeartbeatData = v.InferOutput<typeof CreateHeartbeatDataSchema>;

export const UpdateHeartbeatDataSchema = v.object({
  name: v.string(),
  grace_period: v.picklist([1, 2, 5, 10, 30, 60]),
  frequency: v.picklist([1, 5, 10, 30, 60, 1440, 10080, 312480, -1]),
  custom_frequency: v.optional(v.string()),
});

export type UpdateHeartbeatData = v.InferOutput<typeof UpdateHeartbeatDataSchema>;

export const CreateComposerCredentialDataSchema = v.object({
  repository: v.string(),
  username: v.string(),
  password: v.string(),
});

export type CreateComposerCredentialData = v.InferOutput<typeof CreateComposerCredentialDataSchema>;

export const UpdateComposerCredentialDataSchema = v.object({
  repository: v.string(),
  username: v.string(),
  password: v.string(),
});

export type UpdateComposerCredentialData = v.InferOutput<typeof UpdateComposerCredentialDataSchema>;

export const CreateNpmCredentialDataSchema = v.object({
  registry: v.string(),
  token: v.string(),
  scopes: v.optional(v.nullable(v.array(v.string()))),
});

export type CreateNpmCredentialData = v.InferOutput<typeof CreateNpmCredentialDataSchema>;

export const UpdateNpmCredentialDataSchema = v.object({
  registry: v.string(),
  token: v.string(),
  scopes: v.optional(v.nullable(v.array(v.string()))),
});

export type UpdateNpmCredentialData = v.InferOutput<typeof UpdateNpmCredentialDataSchema>;

export const CreateDeploymentWebhookDataSchema = v.object({
  url: v.string(),
});

export type CreateDeploymentWebhookData = v.InferOutput<typeof CreateDeploymentWebhookDataSchema>;

export const ReorderRedirectRulesDataSchema = v.object({
  redirects: v.array(v.number()),
});

export type ReorderRedirectRulesData = v.InferOutput<typeof ReorderRedirectRulesDataSchema>;

// ── Recipes, teams, roles, credentials ───────────────

export const RunRecipeDataSchema = v.object({
  servers: v.array(v.number()),
  email: v.optional(v.boolean()),
});

export type RunRecipeData = v.InferOutput<typeof RunRecipeDataSchema>;

export const ShareRecipeDataSchema = v.object({
  recipe_id: v.number(),
});

export type ShareRecipeData = v.InferOutput<typeof ShareRecipeDataSchema>;

export const ShareServerDataSchema = v.object({
  server_id: v.number(),
});

export type ShareServerData = v.InferOutput<typeof ShareServerDataSchema>;

export const ShareCredentialDataSchema = v.object({
  credential_id: v.number(),
});

export type ShareCredentialData = v.InferOutput<typeof ShareCredentialDataSchema>;

export const CreateTeamDataSchema = v.object({
  name: v.string(),
  users: v.optional(
    v.array(
      v.object({
        id: v.number(),
        role: v.optional(
          v.object({
            id: v.number(),
          }),
        ),
      }),
    ),
  ),
  invites: v.optional(
    v.array(
      v.object({
        email: v.string(),
        role: v.optional(
          v.object({
            id: v.number(),
          }),
        ),
      }),
    ),
  ),
});

export type CreateTeamData = v.InferOutput<typeof CreateTeamDataSchema>;

export const UpdateTeamDataSchema = v.object({
  name: v.string(),
  users: v.optional(
    v.array(
      v.object({
        id: v.number(),
        role: v.optional(
          v.object({
            id: v.number(),
          }),
        ),
      }),
    ),
  ),
});

export type UpdateTeamData = v.InferOutput<typeof UpdateTeamDataSchema>;

export const UpdateTeamMemberDataSchema = v.object({
  role_id: v.number(),
});

export type UpdateTeamMemberData = v.InferOutput<typeof UpdateTeamMemberDataSchema>;

export const CreateTeamInviteDataSchema = v.object({
  role_id: v.number(),
  email: v.string(),
});

export type CreateTeamInviteData = v.InferOutput<typeof CreateTeamInviteDataSchema>;

export const CreateRoleDataSchema = v.object({
  name: v.string(),
  permissions: v.optional(
    v.array(
      v.picklist([
        "organization:view",
        "organization:manage",
        "organization:delete",
        "server:view",
        "server:create",
        "server:delete",
        "server:archive",
        "server:transfer",
        "server:manage-meta",
        "server:manage-packages",
        "server:manage-php",
        "server:manage-logs",
        "server:manage-network",
        "server:manage-nginx-templates",
        "server:manage-services",
        "server:manage-password",
        "server:create-keys",
        "server:delete-keys",
        "server:create-monitors",
        "server:delete-monitors",
        "server:create-databases",
        "server:delete-databases",
        "server:create-backups",
        "server:delete-backups",
        "server:create-daemons",
        "server:delete-daemons",
        "server:create-schedulers",
        "server:delete-schedulers",
        "server:web-terminal",
        "site:create",
        "site:delete",
        "site:meta",
        "site:manage-commands",
        "site:manage-deploys",
        "site:manage-nginx",
        "site:manage-project",
        "site:manage-environment",
        "site:manage-notifications",
        "site:manage-queues",
        "site:manage-redirects",
        "site:manage-security",
        "site:manage-ssl",
        "site:manage-integrations",
        "site:manage-heartbeats",
        "credential:view",
        "credential:manage",
        "team:view",
        "team:create",
        "team:delete",
        "recipe:view",
        "recipe:manage",
        "billing:manage",
        "storage:manage",
        "integrations:manage",
        "user:view",
        "resources:view",
        "resources:create-databases",
        "resources:delete-databases",
        "resources:manage-databases",
        "resources:create-buckets",
        "resources:delete-buckets",
        "resources:manage-buckets",
      ]),
    ),
  ),
});

export type CreateRoleData = v.InferOutput<typeof CreateRoleDataSchema>;

export const UpdateRoleDataSchema = v.object({
  name: v.string(),
  permissions: v.optional(
    v.array(
      v.picklist([
        "organization:view",
        "organization:manage",
        "organization:delete",
        "server:view",
        "server:create",
        "server:delete",
        "server:archive",
        "server:transfer",
        "server:manage-meta",
        "server:manage-packages",
        "server:manage-php",
        "server:manage-logs",
        "server:manage-network",
        "server:manage-nginx-templates",
        "server:manage-services",
        "server:manage-password",
        "server:create-keys",
        "server:delete-keys",
        "server:create-monitors",
        "server:delete-monitors",
        "server:create-databases",
        "server:delete-databases",
        "server:create-backups",
        "server:delete-backups",
        "server:create-daemons",
        "server:delete-daemons",
        "server:create-schedulers",
        "server:delete-schedulers",
        "server:web-terminal",
        "site:create",
        "site:delete",
        "site:meta",
        "site:manage-commands",
        "site:manage-deploys",
        "site:manage-nginx",
        "site:manage-project",
        "site:manage-environment",
        "site:manage-notifications",
        "site:manage-queues",
        "site:manage-redirects",
        "site:manage-security",
        "site:manage-ssl",
        "site:manage-integrations",
        "site:manage-heartbeats",
        "credential:view",
        "credential:manage",
        "team:view",
        "team:create",
        "team:delete",
        "recipe:view",
        "recipe:manage",
        "billing:manage",
        "storage:manage",
        "integrations:manage",
        "user:view",
        "resources:view",
        "resources:create-databases",
        "resources:delete-databases",
        "resources:manage-databases",
        "resources:create-buckets",
        "resources:delete-buckets",
        "resources:manage-buckets",
      ]),
    ),
  ),
});

export type UpdateRoleData = v.InferOutput<typeof UpdateRoleDataSchema>;

export const CreateVpcDataSchema = v.object({
  name: v.string(),
});

export type CreateVpcData = v.InferOutput<typeof CreateVpcDataSchema>;

export const UpdateStorageProviderDataSchema = v.object({
  name: v.string(),
  provider: v.picklist(["s3", "spaces", "hetzner", "ovh", "scaleway", "custom"]),
  region: v.optional(v.string()),
  bucket: v.optional(v.nullable(v.string())),
  endpoint: v.optional(v.string()),
  access_key: v.optional(v.nullable(v.string())),
  secret_key: v.optional(v.nullable(v.string())),
  use_ec2_assumed_role: v.optional(v.boolean()),
  directory: v.optional(v.nullable(v.string())),
});

export type UpdateStorageProviderData = v.InferOutput<typeof UpdateStorageProviderDataSchema>;
