// ── Options ──────────────────────────────────────────

/**
 * Options for the Forge API client.
 */
export interface ForgeOptions {
  /** Custom fetch implementation (for testing). */
  fetch?: typeof globalThis.fetch;
  /** Custom base URL (default: https://forge.laravel.com/api). */
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

// ── Servers ──────────────────────────────────────────

export interface CreateServerData {
  name: string;
  provider: string;
  type: string;
  ubuntu_version: string;
  credential_id?: string;
  team_id?: number | null;
  php_version?: string;
  database_type?: string;
  recipe_id?: number | null;
  tags?: string[] | null;
  /** Provider-specific config (DigitalOcean). */
  ocean2?: Record<string, unknown>;
  /** Provider-specific config (AWS). */
  aws?: Record<string, unknown>;
  /** Provider-specific config (Hetzner). */
  hetzner?: Record<string, unknown>;
  /** Provider-specific config (Vultr). */
  vultr?: Record<string, unknown>;
  /** Provider-specific config (Akamai/Linode). */
  akamai?: Record<string, unknown>;
  /** Provider-specific config (Laravel Cloud). */
  laravel?: Record<string, unknown>;
  /** Provider-specific config (Custom VPS). */
  custom?: Record<string, unknown>;
}

// ── Sites ────────────────────────────────────────────

export interface CreateSiteData {
  type: string;
  name?: string;
  domain_mode?: string;
  www_redirect_type?: string;
  allow_wildcard_subdomains?: string;
  root_directory?: string | null;
  web_directory?: string | null;
  is_isolated?: boolean;
  isolated_user?: string;
  php_version?: string;
  zero_downtime_deployments?: boolean;
  nginx_template_id?: number;
  source_control_provider?: string | null;
  repository?: string | null;
  branch?: string | null;
  database_id?: number | null;
  database_user_id?: string;
  push_to_deploy?: boolean;
  tags?: string[] | null;
  shared_paths?: string[];
}

// ── Certificates ─────────────────────────────────────

export interface CreateCertificateData {
  type: "letsencrypt" | "csr" | "existing" | "clone";
  letsencrypt?: {
    verification_method?: "http-01" | "dns-01";
    key_type?: "rsa" | "ecdsa";
    preferred_chain?: "ISRG Root X1" | null;
  };
  existing?: {
    key: string;
    certificate: string;
  };
  csr?: {
    domain: string;
    sans?: string | null;
    country: string;
    state: string;
    city: string;
    organization: string;
    department: string;
  };
  clone?: {
    certificate_id: number;
  };
}

// ── Databases ────────────────────────────────────────

export interface CreateDatabaseData {
  name: string;
  user?: string | null;
  password?: string | null;
}

export interface CreateDatabaseUserData {
  name: string;
  password: string;
  read_only?: boolean;
  database_ids?: number[];
}

// ── Daemons (Background Processes) ───────────────────

export interface CreateDaemonData {
  name: string;
  command: string;
  user: string;
  directory?: string | null;
  processes: number;
  startsecs?: number;
  stopwaitsecs?: number;
  stopsignal?: string | null;
}

// ── Backups ──────────────────────────────────────────

export interface CreateBackupConfigData {
  storage_provider_id: number;
  frequency: string;
  retention: number;
  database_ids: number[];
  name?: string | null;
  bucket?: string | null;
  directory?: string | null;
  day?: string;
  time?: string;
  cron?: string;
  notification_email?: string | null;
}

// ── Commands ─────────────────────────────────────────

export interface CreateCommandData {
  command: string;
}

// ── Scheduled Jobs ───────────────────────────────────

export interface CreateScheduledJobData {
  command: string;
  user: string;
  frequency: string;
  name?: string | null;
  cron?: string | null;
  heartbeat?: boolean | null;
  grace_period?: string;
}

// ── Firewall Rules ───────────────────────────────────

export interface CreateFirewallRuleData {
  name: string;
  type: string;
  port?: string | null;
  ip_address?: string;
}

// ── SSH Keys ─────────────────────────────────────────

export interface CreateSshKeyData {
  name: string;
  key: string;
  user?: string | null;
}

// ── Security Rules ───────────────────────────────────

export interface CreateSecurityRuleData {
  name: string;
  path?: string;
  credentials: { username: string; password: string }[];
}

// ── Redirect Rules ───────────────────────────────────

export interface CreateRedirectRuleData {
  from: string;
  to: string;
  type: string;
}

// ── Monitors ─────────────────────────────────────────

export interface CreateMonitorData {
  type: string;
  operator: string;
  threshold: number;
  notify: string;
  minutes?: number;
}

// ── Nginx Templates ──────────────────────────────────

export interface CreateNginxTemplateData {
  name: string;
  content: string;
}

// ── Recipes ──────────────────────────────────────────

export interface CreateRecipeData {
  name: string;
  user: string;
  script: string;
  team_id?: string;
}

// ── Config types ─────────────────────────────────────

export interface ForgeConfig {
  apiToken: string;
  /** Default organization slug for v2 API (e.g. "studio-meta"). */
  organizationSlug?: string;
}
