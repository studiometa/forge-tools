import type { CommandContext } from "../../../context.ts";

import { ExitCode, exitWithValidationError, runCommand } from "../../../error-handler.ts";
import { resolveApplyServer } from "../../sites/apply/apply.ts";
import {
  type ApplyOptions,
  applyLoadBalancerFile,
  readRemoteState,
  resolveNodes,
} from "./apply.ts";
import { readLoadBalancerFile } from "./balancer-file.ts";
import { buildPlan, describeChange } from "./plan.ts";

/**
 * `forge load-balancer apply --file load-balancer.json [--check]`: make the site of a load
 * balancer match a load balancer file. With `--check`, print the plan and exit 1 when Forge
 * differs, without any change.
 */
export async function loadBalancerApply(
  ctx: CommandContext,
  applyOptions: ApplyOptions = {},
): Promise<void> {
  const usage = "forge load-balancer apply --file <load-balancer.json> [--check]";
  const path = ctx.options.file;
  const check = Boolean(ctx.options.check);

  if (typeof path !== "string" || !path) {
    exitWithValidationError("file", usage, ctx.formatter);
  }

  await runCommand(async () => {
    const file = readLoadBalancerFile(path);
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveApplyServer(file.server, execCtx);

    if (check) {
      const target = await resolveNodes(file, execCtx);
      const plan = buildPlan(file, await readRemoteState(file, server_id, target, execCtx));
      const inSync = plan.changes.length === 0;
      if (ctx.formatter.isJson()) {
        ctx.formatter.output({ inSync, changes: plan.changes });
      } else {
        for (const change of plan.changes) console.log(describeChange(change));
        if (inSync)
          ctx.formatter.success(`Load balancer site ${file.domain} is in sync with Forge.`);
        else ctx.formatter.error(`Load balancer site ${file.domain} differs from Forge.`);
      }
      if (!inSync) process.exitCode = ExitCode.GENERAL_ERROR;
      return;
    }

    const applied: string[] = [];
    const plan = await applyLoadBalancerFile(file, server_id, execCtx, {
      ...applyOptions,
      onChange: (change) => {
        applied.push(change.action);
        if (!ctx.formatter.isJson()) console.log(describeChange(change));
      },
    });

    if (ctx.formatter.isJson()) {
      ctx.formatter.output({ changes: plan.changes });
    } else {
      ctx.formatter.success(
        applied.length === 0
          ? `Load balancer site ${file.domain} is in sync with Forge.`
          : `Load balancer site ${file.domain} applied: ${applied.length} change(s).`,
      );
    }
  }, ctx.formatter);
}
