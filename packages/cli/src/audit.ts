import { createAuditLogger } from "@studiometa/forge-core";
import type { AuditLogger } from "@studiometa/forge-core";

/**
 * Shared audit logger for CLI write operations.
 * Lazily initialized on first use.
 */
let _auditLogger: AuditLogger | null = null;

export function getCliAuditLogger(): AuditLogger {
  if (!_auditLogger) _auditLogger = createAuditLogger("cli");
  return _auditLogger;
}
