/**
 * ANSI color utilities using native Node.js.
 * Provides terminal colors without external dependencies.
 */

// ANSI escape codes
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";

// Foreground colors
const FG_RED = "\x1b[31m";
const FG_GREEN = "\x1b[32m";
const FG_YELLOW = "\x1b[33m";
const FG_CYAN = "\x1b[36m";
const FG_GRAY = "\x1b[90m";

// Colors enabled by default, disabled by NO_COLOR env var
let colorEnabled = process.env.NO_COLOR === undefined;

export function setColorEnabled(enabled: boolean): void {
  colorEnabled = enabled;
}

export function isColorEnabled(): boolean {
  return colorEnabled;
}

function colorize(text: string, code: string): string {
  if (!colorEnabled) return text;
  return `${code}${text}${RESET}`;
}

export const colors = {
  reset: (text: string) => (colorEnabled ? `${RESET}${text}` : text),
  bold: (text: string) => colorize(text, BOLD),
  dim: (text: string) => colorize(text, DIM),
  red: (text: string) => colorize(text, FG_RED),
  green: (text: string) => colorize(text, FG_GREEN),
  yellow: (text: string) => colorize(text, FG_YELLOW),
  cyan: (text: string) => colorize(text, FG_CYAN),
  gray: (text: string) => colorize(text, FG_GRAY),
};
