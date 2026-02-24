import type { OutputFormat } from "./types.ts";

import { colors } from "./utils/colors.ts";

/**
 * Output formatter for CLI commands.
 * Supports human-readable, JSON, and table formats.
 */
export class OutputFormatter {
  constructor(
    private format: OutputFormat = "human",
    private noColor: boolean = false,
  ) {}

  /**
   * Output data in the configured format.
   * Use format='json' for AI agents and structured data.
   */
  output(data: unknown): void {
    switch (this.format) {
      case "json":
        console.log(JSON.stringify(data, null, 2));
        break;
      case "table":
        this.outputTable(data);
        break;
      case "human":
      default:
        console.log(data);
        break;
    }
  }

  success(message: string): void {
    if (this.format === "json") {
      console.log(JSON.stringify({ status: "success", message }));
    } else {
      console.log(colors.green(`✓ ${message}`));
    }
  }

  error(message: string, details?: unknown): void {
    if (this.format === "json") {
      console.error(JSON.stringify({ status: "error", message, details }));
    } else {
      console.error(colors.red(`✗ ${message}`));
      if (details !== undefined) {
        console.error(details);
      }
    }
  }

  warning(message: string): void {
    if (this.format === "json") {
      console.log(JSON.stringify({ status: "warning", message }));
    } else {
      console.log(colors.yellow(`⚠ ${message}`));
    }
  }

  info(message: string): void {
    if (this.format === "json") {
      console.log(JSON.stringify({ status: "info", message }));
    } else {
      console.log(colors.cyan(message));
    }
  }

  private outputTable(data: unknown): void {
    if (Array.isArray(data) && data.length > 0) {
      const headers = Object.keys(data[0] as Record<string, unknown>);
      const colWidths = headers.map((h) => {
        const maxDataWidth = Math.max(
          ...data.map((row) => String((row as Record<string, unknown>)[h] ?? "").length),
        );
        return Math.max(h.length, maxDataWidth);
      });

      // Header
      const headerRow = headers.map((h, i) => h.padEnd(colWidths[i])).join(" | ");
      console.log(headerRow);
      console.log(colWidths.map((w) => "-".repeat(w)).join("-+-"));

      // Rows
      for (const row of data) {
        const rowStr = headers
          .map((h, i) => String((row as Record<string, unknown>)[h] ?? "").padEnd(colWidths[i]))
          .join(" | ");
        console.log(rowStr);
      }
    }
  }
}
