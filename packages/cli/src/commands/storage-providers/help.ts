import { colors } from "../../utils/colors.ts";

export function showStorageProvidersHelp(subcommand?: string): void {
  if (subcommand === "list" || subcommand === "ls") {
    console.log(`
${colors.bold("forge storage-providers list")} - List the organization's storage providers

${colors.bold("USAGE:")}
  forge storage-providers list [options]

${colors.bold("OPTIONS:")}
  --provider <type>   Only list one provider type (s3, spaces, hetzner, ovh, scaleway, custom)
  -f, --format <fmt>  Output format: json, human, table
`);
  } else if (subcommand === "get") {
    console.log(`
${colors.bold("forge storage-providers get")} - Get storage provider details

${colors.bold("USAGE:")}
  forge storage-providers get <id> [options]

Forge never returns the access key or the secret key.
`);
  } else if (subcommand === "create") {
    console.log(`
${colors.bold("forge storage-providers create")} - Create a storage provider for database backups

${colors.bold("USAGE:")}
  forge storage-providers create --name <name> --provider <type> [options]

${colors.bold("OPTIONS:")}
  --name <name>              Provider name (required)
  --provider <type>          s3, spaces, hetzner, ovh, scaleway or custom (S3 compatible) (required)
  --endpoint <url>           S3 endpoint URL (custom providers)
  --region <region>          Bucket region
  --bucket <bucket>          Default bucket
  --directory <dir>          Default directory in the bucket
  --access-key <id>          Access key ID
  --secret-key-file <path>   Read the secret key from a file, or from stdin with -
  --assume-role              Use the EC2 instance role instead of keys (s3)
  -f, --format <fmt>         Output format: json, human, table

The secret key is not accepted as an option value, so it does not show in the
shell history or the process list. One trailing newline is removed.

${colors.bold("EXAMPLE:")}
  printf '%s' "$S3_SECRET_KEY" | forge storage-providers create --name Backups \\
    --provider custom --endpoint https://s3.example.com --region eu-west-1 \\
    --bucket my-bucket --access-key "$S3_ACCESS_KEY" --secret-key-file - --format json
`);
  } else if (subcommand === "delete") {
    console.log(`
${colors.bold("forge storage-providers delete")} - Delete a storage provider

${colors.bold("USAGE:")}
  forge storage-providers delete <id> [options]

Forge refuses to delete a provider that a backup configuration uses.
`);
  } else {
    console.log(`
${colors.bold("forge storage-providers")} - Manage the storage providers of database backups

${colors.bold("USAGE:")}
  forge storage-providers <subcommand> [options]

${colors.bold("SUBCOMMANDS:")}
  list, ls            List storage providers
  get <id>            Get storage provider details
  create              Create a storage provider
  delete <id>         Delete a storage provider

${colors.bold("OPTIONS:")}
  -f, --format <fmt>  Output format: json, human, table

Run ${colors.cyan("forge storage-providers <subcommand> --help")} for details.
`);
  }
}
