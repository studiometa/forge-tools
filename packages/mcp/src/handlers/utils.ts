import type { ToolResult } from "./types.ts";

/**
 * Create a successful JSON result.
 */
export function jsonResult(text: string): ToolResult {
  return {
    content: [{ type: "text", text }],
  };
}

/**
 * Create an error result.
 */
export function errorResult(message: string): ToolResult {
  return {
    content: [{ type: "text", text: `Error: ${message}` }],
    isError: true,
  };
}

/**
 * Create an input error result with suggestions.
 */
export function inputErrorResult(message: string, suggestion?: string): ToolResult {
  const text = suggestion ? `Error: ${message}\n\nSuggestion: ${suggestion}` : `Error: ${message}`;
  return {
    content: [{ type: "text", text }],
    isError: true,
  };
}
