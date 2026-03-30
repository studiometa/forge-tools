// ── v2 API resource attribute types ──────────────────
// These match the `attributes` object in JSON:API responses
// as defined in docs/forge-openapi-v2.json.

// ── User ─────────────────────────────────────────────

export interface UserAttributes {
  name: string;
  email: string;
  created_at: string | null;
  updated_at: string | null;
}

// ── Servers ──────────────────────────────────────────

export interface ServerAttributes {
  id: number;
  credential_id: number | null;
  name: string;
  type: string;
  ubuntu_version: string | null;
  ssh_port: number;
  provider: string;
  identifier: string | null;
  size: string;
  region: string;
  php_version: string | null;
  php_cli_version: string | null;
  opcache_status: string | null;
  database_type: string | null;
  db_status: string | null;
  redis_status: string | null;
  ip_address: string | null;
  private_ip_address: string | null;
  revoked: boolean;
  created_at: string;
  updated_at: string;
  connection_status: string;
  timezone: string;
  local_public_key: string | null;
  is_ready: boolean;
}

// ── Sites ────────────────────────────────────────────

export interface SiteRepository {
  provider: string;
  url: string;
  branch: string;
  status: string;
}

export interface SiteAttributes {
  name: string;
  aliases: string[];
  root_directory: string | null;
  web_directory: string;
  wildcards: boolean | null;
  status: string;
  repository: SiteRepository | null;
  quick_deploy: boolean | null;
  deployment_status: string | null;
  deployment_url: string;
  deployment_script: string | null;
  php_version: string;
  app_type: string;
  url: string;
  https: boolean;
  isolated: boolean;
  user: string;
  database: string | null;
  shared_paths: Record<string, string> | null;
  uses_envoyer: boolean;
  zero_downtime_deployments: boolean;
  maintenance_mode: Record<string, unknown> | null;
  healthcheck_url: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// ── Deployments ──────────────────────────────────────

export interface DeploymentCommit {
  hash: string | null;
  author: string | null;
  message: string | null;
  branch: string | null;
}

export interface DeploymentAttributes {
  commit: DeploymentCommit;
  status: string;
  type: string;
  started_at: string;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DeploymentStatusAttributes {
  status: string;
  started_at: string;
}

export interface DeploymentOutputAttributes {
  output: string;
}

export interface DeploymentScriptAttributes {
  content: string;
  auto_source: string;
}

// ── Databases ────────────────────────────────────────

export interface DatabaseAttributes {
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseUserAttributes {
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// ── Daemons (Background Processes) ───────────────────

export interface BackgroundProcessAttributes {
  command: string;
  user: string;
  directory: string | null;
  processes: number;
  status: string;
  created_at: string;
}

// ── Certificates ─────────────────────────────────────

export interface CertificateAttributes {
  type: string;
  verification_method: string | null;
  key_type: string | null;
  preferred_chain: string | null;
  request_status: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// ── Firewall Rules ───────────────────────────────────

export interface FirewallRuleAttributes {
  name: string;
  port: string | null;
  type: string;
  ip_address: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
}

// ── SSH Keys ─────────────────────────────────────────

export interface SshKeyAttributes {
  name: string;
  user: string;
  status: string;
  created_by: number | null;
  created_at: string;
  updated_at: string;
}

// ── Security Rules ───────────────────────────────────

export interface SecurityRuleAttributes {
  name: string;
  path: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
}

// ── Redirect Rules ───────────────────────────────────

export interface RedirectRuleAttributes {
  from: string;
  to: string;
  type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// ── Monitors ─────────────────────────────────────────

export interface MonitorAttributes {
  type: string;
  operator: string;
  threshold: number;
  minutes: number | null;
  notify: string;
  status: string;
  state: string;
  state_changed_at: string | null;
  created_at: string;
  updated_at: string;
}

// ── Nginx Templates ──────────────────────────────────

export interface NginxTemplateAttributes {
  name: string;
  content: string;
  created_at: string | null;
  updated_at: string | null;
}

// ── Recipes ──────────────────────────────────────────

export interface RecipeAttributes {
  name: string;
  user: string;
  script: string;
  created_at: string;
  updated_at: string;
}

// ── Scheduled Jobs ───────────────────────────────────

export interface ScheduledJobAttributes {
  name: string | null;
  command: string;
  user: string;
  frequency: string;
  cron: string;
  next_run_time: string;
  status: string;
  created_at: string | null;
  updated_at: string | null;
}

// ── Commands ─────────────────────────────────────────

export interface CommandAttributes {
  command: string;
  status: string;
  duration: string;
  user_id: number;
  created_at: string;
  updated_at: string;
}

// ── Backups ──────────────────────────────────────────

export interface BackupConfigAttributes {
  name: string;
  storage_provider_id: number | null;
  provider: string;
  bucket: string | null;
  directory: string;
  schedule: string;
  displayable_schedule: string;
  next_run_time: string;
  status: string;
  day_of_week: number | null;
  time: string | null;
  cron_schedule: string | null;
  retention: number;
  notify_email: string | null;
}

export interface BackupAttributes {
  status: string;
  is_partial: string;
  size: number;
  finished_at: string;
}

// ── Organizations ────────────────────────────────────

export interface OrganizationAttributes {
  name: string;
  slug: string;
  created_at: string | null;
  updated_at: string | null;
}

// ── Environment ──────────────────────────────────────

export interface EnvironmentAttributes {
  content: string;
}
