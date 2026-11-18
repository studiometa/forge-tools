import { getEvent, getEventOutput, listEvents } from "@studiometa/forge-core";

import type { CommandContext } from "../../context.ts";

import { exitWithValidationError, runCommand } from "../../error-handler.ts";
import { printContent } from "../../utils/print-content.ts";
import { resolveServerId } from "../../utils/resolve.ts";

/**
 * List the latest events of the organization, or of a server with `--server`.
 */
export async function eventsList(ctx: CommandContext): Promise<void> {
  const server = ctx.options.server === undefined ? "" : String(ctx.options.server);
  const initiatedBy = ctx.options["initiated-by"];
  const ranAs = ctx.options["ran-as"];

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const result = await listEvents(
      {
        ...(server ? { server_id: await resolveServerId(server, execCtx) } : {}),
        ...(initiatedBy !== undefined ? { initiated_by: String(initiatedBy) } : {}),
        ...(ranAs !== undefined ? { ran_as: String(ranAs) } : {}),
      },
      execCtx,
    );
    ctx.formatter.outputList(
      result.data,
      ["id", "description", "ran_as", "created_at"],
      "No events found.",
      (e) => `${String(e.id).padEnd(10)} ${e.created_at.padEnd(28)} ${e.description}`,
    );
  }, ctx.formatter);
}

function requireEvent(args: string[], ctx: CommandContext, usage: string) {
  const [id] = args;
  const server = String(ctx.options.server ?? "");
  if (!id) exitWithValidationError("event_id", usage, ctx.formatter);
  if (!server) exitWithValidationError("server_id", usage, ctx.formatter);
  return { id, server };
}

/**
 * Get an event of a server.
 */
export async function eventsGet(args: string[], ctx: CommandContext): Promise<void> {
  const { id, server } = requireEvent(
    args,
    ctx,
    "forge events get <event_id> --server <server_id>",
  );

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const result = await getEvent({ server_id, id }, execCtx);
    ctx.formatter.outputOne(result.data, ["id", "description", "ran_as", "created_at"]);
  }, ctx.formatter);
}

/**
 * Print the output of an event of a server.
 */
export async function eventsOutput(args: string[], ctx: CommandContext): Promise<void> {
  const { id, server } = requireEvent(
    args,
    ctx,
    "forge events output <event_id> --server <server_id>",
  );

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const result = await getEventOutput({ server_id, id }, execCtx);
    if (ctx.formatter.isJson()) {
      console.log(JSON.stringify({ output: result.data }));
    } else {
      printContent(result.data);
    }
  }, ctx.formatter);
}
