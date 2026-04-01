import {
  createScheduledJob,
  deleteScheduledJob,
  getScheduledJob,
  listScheduledJobs,
} from "@studiometa/forge-core";

import type { CommandContext } from "../../context.ts";

import { exitWithValidationError, runCommand } from "../../error-handler.ts";
import { resolveServerId, resolveSiteId } from "../../utils/resolve.ts";

export async function scheduledJobsList(ctx: CommandContext): Promise<void> {
  const server = String(ctx.options.server ?? "");
  const site = ctx.options.site ? String(ctx.options.site) : undefined;

  if (!server) {
    exitWithValidationError(
      "server_id",
      "forge scheduled-jobs list --server <server_id>",
      ctx.formatter,
    );
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const site_id = site ? await resolveSiteId(site, server_id, execCtx) : undefined;
    const result = await listScheduledJobs({ server_id, site_id }, execCtx);
    ctx.formatter.outputList(
      result.data,
      ["id", "command", "frequency", "status"],
      "No scheduled jobs found.",
      (j) =>
        `${String(j.id).padEnd(8)} ${j.command.padEnd(50)} ${j.frequency.padEnd(12)} ${j.status}`,
    );
  }, ctx.formatter);
}

export async function scheduledJobsGet(args: string[], ctx: CommandContext): Promise<void> {
  const [id] = args;
  const server = String(ctx.options.server ?? "");
  const site = ctx.options.site ? String(ctx.options.site) : undefined;

  if (!id) {
    exitWithValidationError(
      "job_id",
      "forge scheduled-jobs get <job_id> --server <server_id>",
      ctx.formatter,
    );
  }

  if (!server) {
    exitWithValidationError(
      "server_id",
      "forge scheduled-jobs get <job_id> --server <server_id>",
      ctx.formatter,
    );
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const site_id = site ? await resolveSiteId(site, server_id, execCtx) : undefined;
    const result = await getScheduledJob({ server_id, id, site_id }, execCtx);
    ctx.formatter.outputOne(result.data, [
      "id",
      "command",
      "user",
      "frequency",
      "cron",
      "status",
      "created_at",
    ]);
  }, ctx.formatter);
}

export async function scheduledJobsCreate(ctx: CommandContext): Promise<void> {
  const server = String(ctx.options.server ?? "");
  const site = ctx.options.site ? String(ctx.options.site) : undefined;
  const command = String(ctx.options.command ?? "");
  const user = String(ctx.options.user ?? "forge");
  const frequency = String(ctx.options.frequency ?? "custom");
  const cron = ctx.options.cron ? String(ctx.options.cron) : undefined;

  if (!server) {
    exitWithValidationError(
      "server_id",
      "forge scheduled-jobs create --server <server_id> --command <command> --user <user> --frequency <frequency>",
      ctx.formatter,
    );
  }

  if (!command) {
    exitWithValidationError(
      "command",
      "forge scheduled-jobs create --server <server_id> --command <command> --user <user> --frequency <frequency>",
      ctx.formatter,
    );
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const site_id = site ? await resolveSiteId(site, server_id, execCtx) : undefined;
    const result = await createScheduledJob(
      { server_id, site_id, command, user, frequency, cron },
      execCtx,
    );
    ctx.formatter.outputOne(result.data, [
      "id",
      "command",
      "user",
      "frequency",
      "cron",
      "status",
      "created_at",
    ]);
  }, ctx.formatter);
}

export async function scheduledJobsDelete(args: string[], ctx: CommandContext): Promise<void> {
  const [id] = args;
  const server = String(ctx.options.server ?? "");
  const site = ctx.options.site ? String(ctx.options.site) : undefined;

  if (!id) {
    exitWithValidationError(
      "job_id",
      "forge scheduled-jobs delete <job_id> --server <server_id>",
      ctx.formatter,
    );
  }

  if (!server) {
    exitWithValidationError(
      "server_id",
      "forge scheduled-jobs delete <job_id> --server <server_id>",
      ctx.formatter,
    );
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const site_id = site ? await resolveSiteId(site, server_id, execCtx) : undefined;
    await deleteScheduledJob({ server_id, id, site_id }, execCtx);
    ctx.formatter.success(`Scheduled job ${id} deleted.`);
  }, ctx.formatter);
}
