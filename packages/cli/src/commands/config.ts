/**
 * Config command — manage forge-cli configuration
 */

import { createConfigStore, setToken, deleteToken, getToken } from "../config.ts";
import { OutputFormatter } from "../output.ts";
import { colors } from "../utils/colors.ts";

export function showConfigHelp(): void {
  console.log(`
${colors.bold("forge-cli config")} - Manage CLI configuration

${colors.bold("USAGE:")}
  forge-cli config <subcommand> [options]

${colors.bold("SUBCOMMANDS:")}
  set <token>         Save API token to config file
  get                 Show current API token (masked)
  delete              Delete stored API token

${colors.bold("EXAMPLES:")}
  forge-cli config set YOUR_FORGE_TOKEN
  forge-cli config get
  forge-cli config delete
`);
}

export function handleConfigCommand(
  subcommand: string,
  args: string[],
  options: Record<string, string | boolean | string[]>,
): void {
  const format = String(options.format ?? options.f ?? "human");
  const formatter = new OutputFormatter(
    format as "json" | "human" | "table",
    options["no-color"] === true,
  );

  const store = createConfigStore();

  switch (subcommand) {
    case "set": {
      const [token] = args;
      if (!token) {
        formatter.error("Token is required. Usage: forge-cli config set <token>");
        process.exit(1);
        return;
      }
      setToken(token, store);
      formatter.success("API token saved.");
      break;
    }

    case "get": {
      const token = getToken(store);
      if (!token) {
        formatter.warning("No API token configured.");
        formatter.info("Run: forge-cli config set <token>");
      } else {
        // Mask the token for security
        const masked =
          token.length > 8
            ? `${token.slice(0, 4)}${"*".repeat(token.length - 8)}${token.slice(-4)}`
            : "****";
        if (format === "json") {
          formatter.output({ apiToken: masked });
        } else {
          console.log(`apiToken: ${masked}`);
        }
      }
      break;
    }

    case "delete": {
      deleteToken(store);
      formatter.success("API token deleted.");
      break;
    }

    default:
      showConfigHelp();
      break;
  }
}
