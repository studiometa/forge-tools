// CLI-specific types for forge

export type OutputFormat = "json" | "human" | "table";

export function isOutputFormat(value: unknown): value is OutputFormat {
  return value === "json" || value === "human" || value === "table";
}

export interface CliOptions {
  format?: OutputFormat;
  quiet?: boolean;
  noColor?: boolean;
}
