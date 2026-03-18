// ── v2 API resource attribute types ──────────────────
// These match the `attributes` object in JSON:API responses.

// ── User ─────────────────────────────────────────────

export interface UserAttributes {
  name: string;
  email: string;
  two_factor_enabled: boolean;
  two_factor_confirmed: boolean;
  github_connected: boolean;
  gitlab_connected: boolean;
  bitbucket_connected: boolean;
  do_connected: boolean;
  timezone: string;
  created_at: string;
  updated_at: string;
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

export interface SiteAttributes {
  name: string;
  aliases: string[];
  root_directory: string;
  web_directory: string;
  wildcards: boolean;
  status: string;
  repository: string | null;
  quick_deploy: boolean;
  deployment_status: string | null;
  deployment_url: string;
  deployment_script: string | null;
  php_version: string | null;
  app_type: string | null;
  url: string;
  https: boolean;
  isolated: boolean;
  user: string | null;
  database: string | null;
  shared_paths: string[];
  uses_envoyer: boolean;
  zero_downtime_deployments: boolean;
  maintenance_mode: boolean;
  healthcheck_url: string | null;
  created_at: string;
  updated_at: string;
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
  can_access_all_databases: boolean;
  created_at: string;
  updated_at: string;
}

// ── Daemons (Background Processes) ───────────────────

export interface BackgroundProcessAttributes {
  command: string;
  user: string;
  directory: string | null;
  processes: number;
  startsecs: number;
  stopsignal: string;
  stopwaitsecs: number;
  status: string;
  created_at: string;
  updated_at: string;
}

// ── Certificates ─────────────────────────────────────

export interface CertificateAttributes {
  domain: string;
  type: string;
  request_status: string;
  status: string;
  existing: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// ── Firewall Rules ───────────────────────────────────

export interface FirewallRuleAttributes {
  name: string;
  port: number | string;
  type: string;
  ip_address: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// ── SSH Keys ─────────────────────────────────────────

export interface SshKeyAttributes {
  name: string;
  fingerprint: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

// ── Security Rules ───────────────────────────────────

export interface SecurityRuleAttributes {
  name: string;
  path: string | null;
  created_at: string;
  updated_at: string;
}

// ── Redirect Rules ───────────────────────────────────

export interface RedirectRuleAttributes {
  from: string;
  to: string;
  type: string;
  created_at: string;
  updated_at: string;
}

// ── Monitors ─────────────────────────────────────────

export interface MonitorAttributes {
  type: string;
  operator: string;
  threshold: number;
  minutes: number;
  state: string;
  state_changed_at: string;
}

// ── Nginx Templates ──────────────────────────────────

export interface NginxTemplateAttributes {
  name: string;
  content: string;
  created_at: string;
  updated_at: string;
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
  command: string;
  user: string;
  frequency: string;
  cron: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// ── Commands ─────────────────────────────────────────

export interface CommandAttributes {
  command: string;
  status: string;
  user_name: string;
  created_at: string;
  updated_at: string;
}

// ── Backups ──────────────────────────────────────────

export interface BackupConfigAttributes {
  day_of_week: number | null;
  time: string | null;
  provider: string;
  provider_name: string;
  frequency: string;
  directory: string | null;
  email: string | null;
  retention: number;
  status: string;
  last_backup_time: string | null;
}

export interface BackupAttributes {
  status: string;
  restore_status: string | null;
  archive_size: number;
  duration: number;
  date: string;
}

// ── Organizations ────────────────────────────────────

export interface OrganizationAttributes {
  name: string;
  slug: string;
  owned: boolean;
  on_trial: boolean;
  subscribed: boolean;
  created_at: string;
  updated_at: string;
}
