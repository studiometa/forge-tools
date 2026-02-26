import type { ToolResult } from "./types.ts";

import { UserInputError } from "../errors.ts";

/**
 * Create a successful result with both human-readable text and structured content.
 *
 * - When `data` is a string, `structuredContent` wraps it as `{ result: data }`.
 * - When `data` is an object/array, `structuredContent` is `{ result: data }` and
 *   the text representation is the JSON-serialized form.
 */
export function jsonResult(data: string | Record<string, unknown> | unknown): ToolResult {
  const text = typeof data === "string" ? data : JSON.stringify(data, null, 2);
  return {
    content: [{ type: "text", text }],
    structuredContent: { success: true, result: data },
  };
}

/**
 * Validate an ID-like value (must be alphanumeric/dashes only).
 * Prevents path traversal via `../` in URL segments.
 *
 * @returns true if the value is safe, false otherwise.
 */
export function sanitizeId(value: string): boolean {
  return /^[\w-]+$/.test(value);
}

/**
 * Create an error result with structured error content.
 */
export function errorResult(message: string): ToolResult {
  return {
    content: [{ type: "text", text: `Error: ${message}` }],
    structuredContent: { success: false, error: message },
    isError: true,
  };
}

/**
 * Create an input error result from a UserInputError or a plain message with an optional suggestion.
 *
 * When a UserInputError is passed, its formatted message (including hints) is used.
 * When a plain string is passed, the optional suggestion is appended.
 */
export function inputErrorResult(error: UserInputError | string, suggestion?: string): ToolResult {
  let text: string;
  let errorMessage: string;
  if (error instanceof UserInputError) {
    text = error.toFormattedMessage();
    errorMessage = error.message;
  } else {
    errorMessage = error;
    text = suggestion ? `Error: ${error}\n\nSuggestion: ${suggestion}` : `Error: ${error}`;
  }
  return {
    content: [{ type: "text", text }],
    structuredContent: { success: false, error: errorMessage },
    isError: true,
  };
}
