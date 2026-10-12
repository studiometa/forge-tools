import type { ExecutorContext } from "@studiometa/forge-core";
import { createSshKey, deleteSshKey, listServers, listSshKeys } from "@studiometa/forge-core";

import type { CommandContext } from "../../context.ts";
import type { FileKey, SyncPlan } from "./sync-plan.ts";

import {
  ExitCode,
  exitWithError,
  exitWithValidationError,
  runCommand,
} from "../../error-handler.ts";
import { ValidationError } from "../../errors.ts";
import { colors } from "../../utils/colors.ts";
import { readContentFile } from "../../utils/content-source.ts";
import { matchServerId } from "../../utils/resolve.ts";
import { parseAuthorizedKeys, planSync } from "./sync-plan.ts";

const USAGE =
  "forge ssh-keys sync --file <path|-> (--server <id>... | --all-servers) [--user <name>] [--prune] [--dry-run]";

/** Sync state and outcome of one server. */
interface ServerSync {
  id: number;
  name: string;
  plan?: SyncPlan;
  added: string[];
  removed: string[];
  unchanged: string[];
  errors: string[];
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Read the --server values: repeated and/or comma separated.
 */
function serverValues(value: unknown): string[] {
  return [value]
    .flat()
    .filter((v): v is string => typeof v === "string")
    .flatMap((v) => v.split(","))
    .map((v) => v.trim())
    .filter(Boolean);
}

/**
 * Read and parse the --file option. Exits on a missing, unreadable, malformed or empty file.
 */
function readFileKeys(ctx: CommandContext): FileKey[] {
  const { file } = ctx.options;
  const content = readContentFile(file, "file", {
    label: "SSH keys file",
    usage: USAGE,
    formatter: ctx.formatter,
  });

  let keys: FileKey[];
  try {
    keys = parseAuthorizedKeys(content);
  } catch (error) {
    // parseAuthorizedKeys only throws a ValidationError with the line number.
    exitWithError(error as ValidationError, ctx.formatter);
  }

  if (keys.length === 0) {
    exitWithError(
      new ValidationError(`No SSH keys found in ${String(file)}`, "file"),
      ctx.formatter,
    );
  }

  return keys;
}

/**
 * Resolve the target servers to ids and names, without duplicates.
 * Names are matched against one list of servers: one API call for all targets.
 */
async function resolveTargets(
  values: string[],
  allServers: boolean,
  execCtx: ExecutorContext,
): Promise<Array<{ id: number; name: string }>> {
  const servers = (await listServers({}, execCtx)).data;
  if (allServers) {
    return servers.map((s) => ({ id: s.id, name: s.name }));
  }

  const targets = new Map<number, string>();
  for (const value of values) {
    const id = Number(matchServerId(value, servers));
    targets.set(id, servers.find((s) => s.id === id)?.name ?? String(id));
  }
  return [...targets].map(([id, name]) => ({ id, name }));
}

function printPlan(syncs: ServerSync[], user: string, prune: boolean): void {
  for (const sync of syncs) {
    console.log(colors.bold(`${sync.name} (${sync.id})`));
    for (const error of sync.errors) {
      console.log(colors.red(`  ✗ ${error}`));
    }
    if (!sync.plan) continue;

    const { add, remove, unchanged } = sync.plan;
    for (const key of add) console.log(colors.green(`  + ${key.name}`));
    if (prune) {
      for (const key of remove) console.log(colors.red(`  - ${key.name}`));
    }
    for (const key of unchanged) console.log(colors.dim(`  = ${key.name}`));
    if (!prune && remove.length > 0) {
      console.log(
        colors.yellow(
          `  ${remove.length} key(s) of user "${user}" not in the file are kept (use --prune to remove them)`,
        ),
      );
    }
  }
}

function printResult(syncs: ServerSync[]): void {
  for (const sync of syncs) {
    const summary = `${sync.name} (${sync.id}): ${sync.added.length} added, ${sync.removed.length} removed, ${sync.unchanged.length} unchanged`;
    if (sync.errors.length === 0) {
      console.log(colors.green(`✓ ${summary}`));
      continue;
    }
    console.log(colors.red(`✗ ${summary}, ${sync.errors.length} failed`));
    for (const error of sync.errors) {
      console.log(colors.red(`  ${error}`));
    }
  }
}

/**
 * Apply a plan to one server. Each failed operation is recorded and the next one runs.
 * When an add fails, the removals are skipped: the user must not lose access to the server.
 */
async function applyPlan(
  sync: ServerSync,
  plan: SyncPlan,
  user: string,
  prune: boolean,
  execCtx: ExecutorContext,
): Promise<void> {
  const server_id = String(sync.id);

  let addFailed = false;
  for (const key of plan.add) {
    try {
      await createSshKey({ server_id, name: key.name, key: key.key, user }, execCtx);
      sync.added.push(key.name);
    } catch (error) {
      addFailed = true;
      sync.errors.push(`add ${key.name}: ${errorMessage(error)}`);
    }
  }

  if (!prune) return;

  for (const key of plan.remove) {
    if (addFailed) {
      sync.errors.push(`remove ${key.name}: skipped because an add failed`);
      continue;
    }
    try {
      await deleteSshKey({ server_id, id: String(key.id) }, execCtx);
      sync.removed.push(key.name);
    } catch (error) {
      sync.errors.push(`remove ${key.name}: ${errorMessage(error)}`);
    }
  }
}

/**
 * Make the SSH keys of a user on one or more servers match an authorized_keys file.
 */
export async function sshKeysSync(ctx: CommandContext): Promise<void> {
  const { options, formatter } = ctx;
  const servers = serverValues(options.server);
  const allServers = options["all-servers"] === true;
  const userOption = options.user;
  const prune = options.prune === true;
  const dryRun = options["dry-run"] === true;

  if (options.file === undefined) {
    exitWithValidationError("file", USAGE, formatter);
  }

  if (userOption !== undefined && (typeof userOption !== "string" || userOption === "")) {
    exitWithError(
      new ValidationError("--user requires a name", "user", [`Usage: ${USAGE}`]),
      formatter,
    );
  }
  const user = typeof userOption === "string" ? userOption : "forge";

  if (allServers && options.server !== undefined) {
    exitWithError(
      new ValidationError("Use either --server or --all-servers, not both", "server", [
        `Usage: ${USAGE}`,
      ]),
      formatter,
    );
  }

  if (!allServers && servers.length === 0) {
    exitWithError(
      new ValidationError("A target is required: --server <id> or --all-servers", "server", [
        `Usage: ${USAGE}`,
      ]),
      formatter,
    );
  }

  const fileKeys = readFileKeys(ctx);

  const failed = await runCommand(async () => {
    const execCtx = ctx.createExecutorContext(ctx.getToken());
    const targets = await resolveTargets(servers, allServers, execCtx);

    // Servers run one after the other: the rate limiter allows 60 requests per minute.
    const syncs: ServerSync[] = [];
    for (const { id, name } of targets) {
      const sync: ServerSync = { id, name, added: [], removed: [], unchanged: [], errors: [] };
      try {
        const keys = await listSshKeys({ server_id: String(id), user }, execCtx);
        sync.plan = planSync(fileKeys, keys.data, user);
        sync.unchanged = sync.plan.unchanged.map((k) => k.name);
      } catch (error) {
        sync.errors.push(`list keys: ${errorMessage(error)}`);
      }
      syncs.push(sync);
    }

    const json = formatter.isJson();
    if (!json) {
      printPlan(syncs, user, prune);
    }

    if (dryRun) {
      for (const sync of syncs) {
        if (!sync.plan) continue;
        sync.added = sync.plan.add.map((k) => k.name);
        if (prune) sync.removed = sync.plan.remove.map((k) => k.name);
      }
      if (!json) console.log(colors.cyan("\nDry run: no changes made."));
    } else {
      for (const sync of syncs) {
        if (sync.plan) {
          await applyPlan(sync, sync.plan, user, prune, execCtx);
        }
      }
      if (!json) {
        console.log("");
        printResult(syncs);
      }
    }

    if (json) {
      console.log(
        JSON.stringify(
          {
            dry_run: dryRun,
            servers: syncs.map(({ id, name, added, removed, unchanged, errors }) => ({
              id,
              name,
              added,
              removed,
              unchanged,
              errors,
            })),
          },
          null,
          2,
        ),
      );
    }

    return syncs.reduce((count, sync) => count + sync.errors.length, 0);
  }, formatter);

  // The errors are already in the output: exit without a second (JSON) error document.
  if (failed) {
    if (!formatter.isJson()) {
      formatter.error(`${failed} SSH key operation(s) failed`);
    }
    process.exit(ExitCode.GENERAL_ERROR);
  }
}
