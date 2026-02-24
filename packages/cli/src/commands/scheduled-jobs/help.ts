import { colors } from "../../utils/colors.ts";

export function showScheduledJobsHelp(subcommand?: string): void {
  if (subcommand === "list" || subcommand === "ls") {
    console.log(`
${colors.bold("forge-cli scheduled-jobs list")} - List scheduled jobs on a server

${colors.bold("USAGE:")}
  forge-cli scheduled-jobs list --server <server_id> [options]

${colors.bold("OPTIONS:")}
  --server <id>       Server ID (required)
  -f, --format <fmt>  Output format: json, human, table
`);
  } else if (subcommand === "get") {
    console.log(`
${colors.bold("forge-cli scheduled-jobs get")} - Get scheduled job details

${colors.bold("USAGE:")}
  forge-cli scheduled-jobs get <job_id> --server <server_id> [options]
`);
  } else if (subcommand === "create") {
    console.log(`
${colors.bold("forge-cli scheduled-jobs create")} - Create a new scheduled job

${colors.bold("USAGE:")}
  forge-cli scheduled-jobs create --server <server_id> --command <command> [options]

${colors.bold("OPTIONS:")}
  --server <id>         Server ID (required)
  --command <cmd>       Command to run (required)
  -f, --format <fmt>    Output format: json, human, table
`);
  } else if (subcommand === "delete") {
    console.log(`
${colors.bold("forge-cli scheduled-jobs delete")} - Delete a scheduled job

${colors.bold("USAGE:")}
  forge-cli scheduled-jobs delete <job_id> --server <server_id> [options]
`);
  } else {
    console.log(`
${colors.bold("forge-cli scheduled-jobs")} - Manage scheduled jobs (cron)

${colors.bold("USAGE:")}
  forge-cli scheduled-jobs <subcommand> [options]

${colors.bold("SUBCOMMANDS:")}
  list, ls            List scheduled jobs
  get <id>            Get scheduled job details
  create              Create a new scheduled job
  delete <id>         Delete a scheduled job

${colors.bold("OPTIONS:")}
  --server <id>       Server ID (required)
  -f, --format <fmt>  Output format: json, human, table

Run ${colors.cyan("forge-cli scheduled-jobs <subcommand> --help")} for details.
`);
  }
}
