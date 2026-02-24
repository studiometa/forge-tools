// CLI-specific types for forge-cli

export type OutputFormat = "json" | "human" | "table";

export interface CliOptions {
  format?: OutputFormat;
  quiet?: boolean;
  noColor?: boolean;
}
