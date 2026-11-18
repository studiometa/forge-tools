import type { UpdateGitData } from "@studiometa/forge-api";
import { updateSiteGit } from "@studiometa/forge-core";

import type { CommandContext } from "../../context.ts";

import { exitWithValidationError, runCommand } from "../../error-handler.ts";
import { resolveServerId, resolveSiteId } from "../../utils/resolve.ts";

const PROVIDERS = new Set<string>(["github", "gitlab", "bitbucket", "gitlab-custom", "custom"]);

const USAGE =
  "forge git update --server <server_id> --site <site_id> --repository <repo> --branch <branch> [--provider github]";

/**
 * Change the repository, branch or source control provider that a site deploys from.
 */
export async function gitUpdate(ctx: CommandContext): Promise<void> {
  const server = String(ctx.options.server ?? "");
  const site = String(ctx.options.site ?? "");
  const repository = String(ctx.options.repository ?? "");
  const branch = String(ctx.options.branch ?? "");
  const provider = String(ctx.options.provider ?? "github");

  if (!server) exitWithValidationError("server_id", USAGE, ctx.formatter);
  if (!site) exitWithValidationError("site_id", USAGE, ctx.formatter);
  if (!repository) exitWithValidationError("repository", USAGE, ctx.formatter);
  if (!branch) exitWithValidationError("branch", USAGE, ctx.formatter);
  if (!PROVIDERS.has(provider)) {
    exitWithValidationError("provider", USAGE, ctx.formatter);
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const site_id = await resolveSiteId(site, server_id, execCtx);
    const result = await updateSiteGit(
      {
        server_id,
        site_id,
        source_control_provider: provider as UpdateGitData["source_control_provider"],
        repository,
        branch,
      },
      execCtx,
    );

    if (ctx.formatter.isJson()) {
      ctx.formatter.output(result.data);
      return;
    }
    ctx.formatter.success(`Site ${result.data.name} now deploys ${repository} (${branch}).`);
  }, ctx.formatter);
}
