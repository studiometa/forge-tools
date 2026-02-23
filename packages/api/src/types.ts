// ── Options ──────────────────────────────────────────

/**
 * Options for the Forge API client.
 */
export interface ForgeOptions {
  /** Custom fetch implementation (for testing). */
  fetch?: typeof globalThis.fetch;
  /** Custom base URL (default: https://forge.laravel.com/api/v1). */
  baseUrl?: string;
  /** Rate limiter options. */
  rateLimit?: RateLimitOptions;
}

/**
 * Rate limiter configuration.
 */
export interface RateLimitOptions {
  /** Maximum number of retries on 429 (default: 3). */
  maxRetries?: number;
  /** Base delay in ms for exponential backoff (default: 1000). */
  baseDelay?: number;
}

// ── User ─────────────────────────────────────────────

export interface ForgeUser {
  id: number;
  name: string;
  email: string;
  card_last_four: string;
  connected_to_github: boolean;
  connected_to_gitlab: boolean;
  connected_to_bitbucket: boolean;
  connected_to_bitbucket_two: boolean;
  connected_to_digitalocean: boolean;
  connected_to_linode: boolean;
  connected_to_vultr: boolean;
  connected_to_aws: boolean;
  connected_to_hetzner: boolean;
  ready_for_billing: boolean;
  stripe_is_active: boolean;
  two_factor_enabled: boolean;
}

// ── Servers ──────────────────────────────────────────

export interface ForgeServer {
  id: number;
  credential_id: number;
  name: string;
  type: string;
  provider: string;
  provider_id: string;
  size: string;
  region: string;
  ubuntu_version: string;
  db_status: string | null;
  redis_status: string | null;
  php_version: string;
  php_cli_version: string;
  database_type: string;
  ip_address: string;
  ssh_port: number;
  private_ip_address: string;
  local_public_key: string;
  is_ready: boolean;
  revoked: boolean;
  created_at: string;
  network: ForgeServerNetwork[];
  tags: ForgeTag[];
}

export interface ForgeServerNetwork {
  id: number;
  server_id: number;
  networkable_id: number;
  status: string;
}

export interface ForgeTag {
  id: number;
  name: string;
}

export interface CreateServerData {
  provider: string;
  credential_id: number;
  name: string;
  type: string;
  size: string;
  region: string;
  php_version?: string;
  database?: string;
  database_type?: string;
  ip_address?: string;
  private_ip_address?: string;
  recipe_id?: number;
  network?: number[];
}

// ── Sites ────────────────────────────────────────────

export interface ForgeSite {
  id: number;
  server_id: number;
  name: string;
  aliases: string[];
  directory: string;
  wildcards: boolean;
  status: string;
  repository: string | null;
  repository_provider: string | null;
  repository_branch: string | null;
  repository_status: string | null;
  quick_deploy: boolean;
  deployment_status: string | null;
  project_type: string;
  php_version: string;
  app: string | null;
  app_status: string | null;
  slack_channel: string | null;
  telegram_chat_id: string | null;
  telegram_chat_title: string | null;
  teams_webhook_url: string | null;
  discord_webhook_url: string | null;
  created_at: string;
  telegram_secret: string;
  username: string;
  deployment_url: string;
  is_secured: boolean;
  tags: ForgeTag[];
}

export interface CreateSiteData {
  domain: string;
  project_type: string;
  directory?: string;
  isolated?: boolean;
  username?: string;
  php_version?: string;
  aliases?: string[];
}

// ── Deployments ──────────────────────────────────────

export interface ForgeDeployment {
  id: number;
  server_id: number;
  site_id: number;
  type: number;
  commit_hash: string | null;
  commit_author: string | null;
  commit_message: string | null;
  started_at: string;
  ended_at: string | null;
  status: string;
  displayable_type: string;
}

// ── Certificates ─────────────────────────────────────

export interface ForgeCertificate {
  id: number;
  server_id: number;
  site_id: number;
  domain: string;
  request_status: string;
  status: string;
  type: string;
  created_at: string;
  existing: boolean;
  active: boolean;
}

export interface CreateCertificateData {
  type: "new" | "existing" | "clone";
  domain: string;
  country?: string;
  state?: string;
  city?: string;
  organization?: string;
  department?: string;
  certificate?: string;
  key?: string;
}

// ── Databases ────────────────────────────────────────

export interface ForgeDatabase {
  id: number;
  server_id: number;
  name: string;
  status: string;
  created_at: string;
}

export interface ForgeDatabaseUser {
  id: number;
  server_id: number;
  name: string;
  status: string;
  created_at: string;
  databases: number[];
}

export interface CreateDatabaseData {
  name: string;
  user?: string;
  password?: string;
}

// ── Daemons (Background Processes) ───────────────────

export interface ForgeDaemon {
  id: number;
  server_id: number;
  command: string;
  user: string;
  directory: string | null;
  processes: number;
  startsecs: number;
  stopsignal: string;
  stopwaitsecs: number;
  status: string;
  created_at: string;
}

export interface CreateDaemonData {
  command: string;
  user?: string;
  directory?: string;
  processes?: number;
  startsecs?: number;
  stopsignal?: string;
  stopwaitsecs?: number;
}

// ── Backups ──────────────────────────────────────────

export interface ForgeBackupConfig {
  id: number;
  server_id: number;
  day_of_week: number | null;
  time: string | null;
  provider: string;
  provider_name: string;
  databases: { id: number; name: string }[];
  frequency: string;
  directory: string | null;
  email: string | null;
  retention: number;
  status: string;
  last_backup_time: string | null;
}

export interface ForgeBackup {
  id: number;
  backup_id: number;
  status: string;
  restore_status: string | null;
  archive_size: number;
  duration: number;
  date: string;
}

export interface CreateBackupConfigData {
  provider: string;
  credentials: Record<string, string>;
  frequency: string;
  directory?: string;
  email?: string;
  retention?: number;
  databases: number[];
}

// ── Commands ─────────────────────────────────────────

export interface ForgeCommand {
  id: number;
  server_id: number;
  site_id: number;
  user_id: number;
  event_id: number;
  command: string;
  status: string;
  created_at: string;
  profile_photo_url: string;
  user_name: string;
}

export interface CreateCommandData {
  command: string;
}

// ── Scheduled Jobs ───────────────────────────────────

export interface ForgeScheduledJob {
  id: number;
  server_id: number;
  command: string;
  user: string;
  frequency: string;
  cron: string;
  status: string;
  created_at: string;
}

export interface CreateScheduledJobData {
  command: string;
  user?: string;
  frequency?: string;
  minute?: string;
  hour?: string;
  day?: string;
  month?: string;
  weekday?: string;
}

// ── Firewall Rules ───────────────────────────────────

export interface ForgeFirewallRule {
  id: number;
  server_id: number;
  name: string;
  port: number | string;
  type: string;
  ip_address: string;
  status: string;
  created_at: string;
}

export interface CreateFirewallRuleData {
  name: string;
  port: number | string;
  type?: string;
  ip_address?: string;
}

// ── SSH Keys ─────────────────────────────────────────

export interface ForgeSshKey {
  id: number;
  server_id: number;
  name: string;
  status: string;
  created_at: string;
}

export interface CreateSshKeyData {
  name: string;
  key: string;
  username?: string;
}

// ── Security Rules ───────────────────────────────────

export interface ForgeSecurityRule {
  id: number;
  server_id: number;
  site_id: number;
  name: string;
  path: string | null;
  credentials: { id: number; username: string }[];
  created_at: string;
}

export interface CreateSecurityRuleData {
  name: string;
  path?: string;
  credentials: { username: string; password: string }[];
}

// ── Redirect Rules ───────────────────────────────────

export interface ForgeRedirectRule {
  id: number;
  server_id: number;
  site_id: number;
  from: string;
  to: string;
  type: string;
  created_at: string;
}

export interface CreateRedirectRuleData {
  from: string;
  to: string;
  type?: string;
}

// ── Monitors ─────────────────────────────────────────

export interface ForgeMonitor {
  id: number;
  server_id: number;
  type: string;
  operator: string;
  threshold: number;
  minutes: number;
  state: string;
  state_changed_at: string;
}

export interface CreateMonitorData {
  type: string;
  operator: string;
  threshold: number;
  minutes: number;
}

// ── Nginx Templates ──────────────────────────────────

export interface ForgeNginxTemplate {
  id: number;
  server_id: number;
  name: string;
  content: string;
  created_at: string;
}

export interface CreateNginxTemplateData {
  name: string;
  content: string;
}

// ── Recipes ──────────────────────────────────────────

export interface ForgeRecipe {
  id: number;
  name: string;
  user: string;
  script: string;
  created_at: string;
}

export interface CreateRecipeData {
  name: string;
  user?: string;
  script: string;
}

// ── Config types ─────────────────────────────────────

export interface ForgeConfig {
  apiToken: string;
}

// ── API response wrappers ────────────────────────────

export interface ServerResponse {
  server: ForgeServer;
}

export interface ServersResponse {
  servers: ForgeServer[];
}

export interface SiteResponse {
  site: ForgeSite;
}

export interface SitesResponse {
  sites: ForgeSite[];
}

export interface DeploymentResponse {
  deployment: ForgeDeployment;
}

export interface DeploymentsResponse {
  deployments: ForgeDeployment[];
}

export interface CertificateResponse {
  certificate: ForgeCertificate;
}

export interface CertificatesResponse {
  certificates: ForgeCertificate[];
}

export interface DatabaseResponse {
  database: ForgeDatabase;
}

export interface DatabasesResponse {
  databases: ForgeDatabase[];
}

export interface DaemonResponse {
  daemon: ForgeDaemon;
}

export interface DaemonsResponse {
  daemons: ForgeDaemon[];
}

export interface UserResponse {
  user: ForgeUser;
}

export interface BackupConfigResponse {
  backup: ForgeBackupConfig;
}

export interface BackupConfigsResponse {
  backups: ForgeBackupConfig[];
}

export interface CommandResponse {
  command: ForgeCommand;
}

export interface CommandsResponse {
  commands: ForgeCommand[];
}

export interface ScheduledJobResponse {
  job: ForgeScheduledJob;
}

export interface ScheduledJobsResponse {
  jobs: ForgeScheduledJob[];
}

export interface FirewallRuleResponse {
  rule: ForgeFirewallRule;
}

export interface FirewallRulesResponse {
  rules: ForgeFirewallRule[];
}

export interface SshKeyResponse {
  key: ForgeSshKey;
}

export interface SshKeysResponse {
  keys: ForgeSshKey[];
}

export interface SecurityRuleResponse {
  security_rule: ForgeSecurityRule;
}

export interface SecurityRulesResponse {
  security_rules: ForgeSecurityRule[];
}

export interface RedirectRuleResponse {
  redirect_rule: ForgeRedirectRule;
}

export interface RedirectRulesResponse {
  redirect_rules: ForgeRedirectRule[];
}

export interface MonitorResponse {
  monitor: ForgeMonitor;
}

export interface MonitorsResponse {
  monitors: ForgeMonitor[];
}

export interface NginxTemplateResponse {
  template: ForgeNginxTemplate;
}

export interface NginxTemplatesResponse {
  templates: ForgeNginxTemplate[];
}

export interface RecipeResponse {
  recipe: ForgeRecipe;
}

export interface RecipesResponse {
  recipes: ForgeRecipe[];
}
