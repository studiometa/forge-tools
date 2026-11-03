import { createWriteStream, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

import pino from "pino";

export interface AuditLogEntry {
  source: "mcp" | "cli";
  resource: string;
  action: string;
  args: Record<string, unknown>;
  status: "success" | "error";
  error?: string;
}

export interface AuditLogger {
  log(entry: AuditLogEntry): void;
}

const REDACTED = "[REDACTED]";

/**
 * Option names whose whole value is redacted, compared after `normalizeKey()`.
 *
 * - `content`: env files, nginx and PHP config, deployment scripts (`forge env update --content`).
 * - `script`: recipe and deployment scripts.
 */
const SENSITIVE_NAMES = new Set(["content", "script"]);

/**
 * Name endings that mark a secret, compared after `normalizeKey()`: `token`, `apiToken`,
 * `access_token`, `password`, `db-password`, `key`, `private_key`, `secret`, `client_secret`,
 * `credential`, `credentials`, `passphrase`… IDs such as `credential_id` do not match.
 */
const SENSITIVE_SUFFIXES = [
  "token",
  "password",
  "passphrase",
  "secret",
  "key",
  "credential",
  "credentials",
];

/**
 * Lowercase a key and remove `-` and `_`, so `api-token`, `api_token` and `apiToken` match.
 */
function normalizeKey(key: string): string {
  return key.toLowerCase().replaceAll(/[-_]/g, "");
}

/**
 * Whether the value of an option with this name can hold a secret.
 */
function isSensitiveKey(key: string): boolean {
  const normalized = normalizeKey(key);
  return SENSITIVE_NAMES.has(normalized) || SENSITIVE_SUFFIXES.some((s) => normalized.endsWith(s));
}

/**
 * Redact sensitive keys at any depth, keeping the structure (arrays and plain objects are copied).
 */
function redact(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(redact);
  }
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, isSensitiveKey(k) ? REDACTED : redact(v)]),
    );
  }
  return value;
}

/**
 * Return a copy of `args` with the value of every sensitive key replaced by '[REDACTED]',
 * at any depth. Keys stay in place, so the logged structure is the same.
 */
export function sanitizeArgs(args: Record<string, unknown>): Record<string, unknown> {
  return redact(args) as Record<string, unknown>;
}

/**
 * Resolve the audit log file path.
 *
 * Priority:
 * 1. `FORGE_AUDIT_LOG` environment variable
 * 2. `~/.config/forge-tools/audit.log` (default)
 */
export function getAuditLogPath(): string {
  if (process.env.FORGE_AUDIT_LOG) {
    return process.env.FORGE_AUDIT_LOG;
  }
  return join(homedir(), ".config", "forge-tools", "audit.log");
}

/**
 * Create an audit logger that appends structured JSON lines to the audit log.
 *
 * Failures are always silent — logging must never interrupt the actual operation.
 *
 * @param source - Identifies who is logging ('mcp' or 'cli').
 */
export function createAuditLogger(source: "mcp" | "cli"): AuditLogger {
  let logger: pino.Logger | null = null;

  try {
    const logPath = getAuditLogPath();
    mkdirSync(dirname(logPath), { recursive: true });
    const stream = createWriteStream(logPath, { flags: "a" });
    logger = pino({ level: "info" }, stream);
  } catch {
    // Silent failure — logging should never interrupt operations
  }

  return {
    log(entry: AuditLogEntry): void {
      try {
        if (!logger) return;
        logger.info({
          source,
          resource: entry.resource,
          action: entry.action,
          args: sanitizeArgs(entry.args),
          status: entry.status,
          ...(entry.error !== undefined ? { error: entry.error } : {}),
        });
      } catch {
        // Silent failure
      }
    },
  };
}
