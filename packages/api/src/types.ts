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

export interface CreateSiteData {
  domain: string;
  project_type: string;
  directory?: string;
  isolated?: boolean;
  username?: string;
  php_version?: string;
  aliases?: string[];
}

// ── Certificates ─────────────────────────────────────

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

export interface CreateDatabaseData {
  name: string;
  user?: string;
  password?: string;
}

export interface CreateDatabaseUserData {
  name: string;
  password: string;
  databases?: number[];
}

// ── Daemons (Background Processes) ───────────────────

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

export interface CreateCommandData {
  command: string;
}

// ── Scheduled Jobs ───────────────────────────────────

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

export interface CreateFirewallRuleData {
  name: string;
  port: number | string;
  type?: string;
  ip_address?: string;
}

// ── SSH Keys ─────────────────────────────────────────

export interface CreateSshKeyData {
  name: string;
  key: string;
  username?: string;
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
  type?: string;
}

// ── Monitors ─────────────────────────────────────────

export interface CreateMonitorData {
  type: string;
  operator: string;
  threshold: number;
  minutes: number;
}

// ── Nginx Templates ──────────────────────────────────

export interface CreateNginxTemplateData {
  name: string;
  content: string;
}

// ── Recipes ──────────────────────────────────────────

export interface CreateRecipeData {
  name: string;
  user?: string;
  script: string;
}

// ── Config types ─────────────────────────────────────

export interface ForgeConfig {
  apiToken: string;
  /** Default organization slug for v2 API (e.g. "studio-meta"). */
  organizationSlug?: string;
}
