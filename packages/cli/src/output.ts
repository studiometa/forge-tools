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
   * Returns true when the current format is JSON.
   */
  isJson(): boolean {
    return this.format === "json";
  }

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

  /**
   * Output a list with a human-readable one-liner per item and a table for table format.
   * Falls back to JSON for json format.
   *
   * @param data - Array of items to display
   * @param columns - Ordered list of field names to include in human/table output
   * @param emptyMessage - Message shown when data is empty (human format only)
   * @param lineFormat - Optional custom line formatter for human format
   */
  outputList<T extends object>(
    data: T[],
    columns: (keyof T & string)[],
    emptyMessage: string,
    lineFormat?: (item: T) => string,
  ): void {
    if (this.format === "json") {
      console.log(JSON.stringify(data, null, 2));
      return;
    }

    if (this.format === "table") {
      this.outputTable(data.map((item) => Object.fromEntries(columns.map((c) => [c, item[c]]))));
      return;
    }

    // human
    if (data.length === 0) {
      console.log(colors.cyan(emptyMessage));
      return;
    }

    if (lineFormat) {
      for (const item of data) {
        console.log(lineFormat(item));
      }
      return;
    }

    // Default: padded columns
    const widths = columns.map((col) =>
      Math.max(
        col.length,
        ...data.map((item) => String((item as Record<string, unknown>)[col] ?? "").length),
      ),
    );
    for (const item of data) {
      const row = item as Record<string, unknown>;
      const line = columns.map((col, i) => String(row[col] ?? "").padEnd(widths[i])).join("  ");
      console.log(line.trimEnd());
    }
  }

  /**
   * Output a single resource in human-readable format.
   * For json format, uses JSON.stringify. For table format, uses a two-column key/value table.
   *
   * @param data - Object to display
   * @param fields - Ordered list of fields to display (defaults to all keys)
   */
  outputOne<T extends object>(data: T, fields?: (keyof T & string)[]): void {
    if (this.format === "json") {
      console.log(JSON.stringify(data, null, 2));
      return;
    }

    const record = data as Record<string, unknown>;
    const keys = fields ?? (Object.keys(record) as (keyof T & string)[]);

    if (this.format === "table") {
      const rows = keys.map((k) => ({ field: k, value: String(record[k] ?? "") }));
      this.outputTable(rows);
      return;
    }

    // human: key: value pairs
    const keyWidth = Math.max(...keys.map((k) => k.length));
    for (const key of keys) {
      const value = record[key];
      const valueStr =
        value !== null && typeof value === "object" ? JSON.stringify(value) : String(value ?? "");
      console.log(`${colors.cyan(key.padEnd(keyWidth))}  ${valueStr}`);
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
