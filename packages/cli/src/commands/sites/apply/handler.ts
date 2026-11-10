import type { CommandContext } from "../../../context.ts";

import { ExitCode, exitWithValidationError, runCommand } from "../../../error-handler.ts";
import {
  type ApplyOptions,
  applySiteFile,
  assertCanCreateSite,
  assertLoadBalancerSite,
  readRemoteState,
  resolveApplyServer,
} from "./apply.ts";
import { buildPlan, describeChange } from "./plan.ts";
import { readSiteFile } from "./site-file.ts";

/**
 * `forge sites apply --file site.json [--check]`: make a Forge site match a site file.
 * With `--check`, print the plan and exit 1 when Forge differs, without any change.
 */
export async function sitesApply(
  ctx: CommandContext,
  applyOptions: ApplyOptions = {},
): Promise<void> {
  const usage = "forge sites apply --file <site.json> [--check]";
  const path = ctx.options.file;
  const check = Boolean(ctx.options.check);

  if (typeof path !== "string" || !path) {
    exitWithValidationError("file", usage, ctx.formatter);
  }

  await runCommand(async () => {
    const file = readSiteFile(path);
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveApplyServer(file.server, execCtx);

    if (check) {
      const state = await readRemoteState(file, server_id, execCtx);
      assertCanCreateSite(file, state);
      assertLoadBalancerSite(file, state);
      const plan = buildPlan(file, state);
      const inSync = plan.changes.length === 0;
      if (ctx.formatter.isJson()) {
        ctx.formatter.output({ inSync, changes: plan.changes, warnings: plan.warnings });
      } else {
        for (const change of plan.changes) console.log(describeChange(change));
        for (const warning of plan.warnings) ctx.formatter.warning(warning);
        if (inSync) ctx.formatter.success(`Site ${file.domain} is in sync with Forge.`);
        else ctx.formatter.error(`Site ${file.domain} differs from Forge.`);
      }
      if (!inSync) process.exitCode = ExitCode.GENERAL_ERROR;
      return;
    }

    const applied: string[] = [];
    const plan = await applySiteFile(file, server_id, execCtx, {
      ...applyOptions,
      onChange: (change) => {
        applied.push(change.action);
        if (!ctx.formatter.isJson()) console.log(describeChange(change));
      },
    });

    if (ctx.formatter.isJson()) {
      ctx.formatter.output({ changes: plan.changes, warnings: plan.warnings });
    } else {
      for (const warning of plan.warnings) ctx.formatter.warning(warning);
      ctx.formatter.success(
        applied.length === 0
          ? `Site ${file.domain} is in sync with Forge.`
          : `Site ${file.domain} applied: ${applied.length} change(s).`,
      );
    }
  }, ctx.formatter);
}
