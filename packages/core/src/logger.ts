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

/**
 * Sensitive fields to strip from logged args.
 * These are replaced with '[REDACTED]' to prevent token leakage.
 */
const SENSITIVE_KEYS = ["apiToken", "token", "password", "secret", "key", "credentials"];

/**
 * Return a shallow copy of `args` with sensitive keys replaced by '[REDACTED]'.
 */
export function sanitizeArgs(args: Record<string, unknown>): Record<string, unknown> {
  const sanitized = { ...args };
  for (const k of SENSITIVE_KEYS) {
    if (k in sanitized) {
      sanitized[k] = "[REDACTED]";
    }
  }
  return sanitized;
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
