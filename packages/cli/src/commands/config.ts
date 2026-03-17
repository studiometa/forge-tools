/**
 * Config command — manage forge configuration
 */

import {
  createConfigStore,
  setToken,
  deleteToken,
  getToken,
  getOrganizationSlug,
  setOrganizationSlug,
} from "../config.ts";
import { OutputFormatter } from "../output.ts";
import { colors } from "../utils/colors.ts";

export function showConfigHelp(): void {
  console.log(`
${colors.bold("forge config")} - Manage CLI configuration

${colors.bold("USAGE:")}
  forge config <subcommand> [key] [value]

${colors.bold("SUBCOMMANDS:")}
  set <key> <value>   Save a config value
  get                 Show current configuration (masked)
  delete              Delete all stored configuration

${colors.bold("CONFIG KEYS:")}
  apiToken            Forge API token (scoped, from Forge dashboard)
  organizationSlug    Default organization slug (e.g. 'studio-meta')

${colors.bold("EXAMPLES:")}
  forge config set apiToken YOUR_FORGE_TOKEN
  forge config set organizationSlug studio-meta
  forge config get
  forge config delete
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
      const [key, value] = args;
      if (!key || !value) {
        formatter.error("Usage: forge config set <key> <value>");
        formatter.info("Keys: apiToken, organizationSlug");
        process.exit(1);
        return;
      }

      switch (key) {
        case "apiToken":
          setToken(value, store);
          formatter.success("API token saved.");
          break;
        case "organizationSlug":
          setOrganizationSlug(value, store);
          formatter.success(`Organization slug set to "${value}".`);
          break;
        default:
          formatter.error(`Unknown config key: ${key}`);
          formatter.info("Valid keys: apiToken, organizationSlug");
          process.exit(1);
      }
      break;
    }

    case "get": {
      const token = getToken(store);
      const orgSlug = getOrganizationSlug(store);

      if (format === "json") {
        formatter.output({
          apiToken: token ? maskToken(token) : null,
          organizationSlug: orgSlug ?? null,
        });
      } else {
        if (token) {
          console.log(`apiToken: ${maskToken(token)}`);
        } else {
          formatter.warning("No API token configured.");
        }
        if (orgSlug) {
          console.log(`organizationSlug: ${orgSlug}`);
        } else {
          formatter.warning("No organization slug configured.");
        }

        if (!token || !orgSlug) {
          formatter.info("Run: forge config set <key> <value>");
        }
      }
      break;
    }

    case "delete": {
      deleteToken(store);
      formatter.success("Configuration deleted.");
      break;
    }

    default:
      showConfigHelp();
      break;
  }
}

function maskToken(token: string): string {
  return token.length > 8
    ? `${token.slice(0, 4)}${"*".repeat(token.length - 8)}${token.slice(-4)}`
    : "****";
}
