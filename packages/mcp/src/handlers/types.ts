import type { ExecutorContext } from "@studiometa/forge-core";

/**
 * Result from MCP tool handlers.
 *
 * - `content` — human-readable text (always present)
 * - `structuredContent` — machine-readable data matching the tool's `outputSchema`
 * - `isError` — true when the result represents an error
 */
export interface ToolResult {
  content: Array<{ type: "text"; text: string }>;
  structuredContent?: Record<string, unknown>;
  isError?: boolean;
}

/**
 * Handler context — wraps ExecutorContext with MCP-specific options.
 */
export interface HandlerContext {
  executorContext: ExecutorContext;
  compact: boolean;
  /** Whether to include contextual hints in get responses (default: false) */
  includeHints?: boolean;
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
