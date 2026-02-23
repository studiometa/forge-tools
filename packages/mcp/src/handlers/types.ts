import type { ExecutorContext } from "@studiometa/forge-core";

/**
 * Result from MCP tool handlers.
 */
export interface ToolResult {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
}

/**
 * Handler context — wraps ExecutorContext with MCP-specific options.
 */
export interface HandlerContext {
  executorContext: ExecutorContext;
  compact: boolean;
}

/**
 * Common args present in all tool calls.
 */
export interface CommonArgs {
  resource: string;
  action: string;
  id?: string;
  server_id?: string;
  site_id?: string;
  compact?: boolean;
  [key: string]: unknown;
}
