import type { ForgeNginxTemplate, NginxTemplatesResponse } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

export async function listNginxTemplates(
  options: { server_id: string },
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeNginxTemplate[]>> {
  const response = await ctx.client.get<NginxTemplatesResponse>(
    `/servers/${options.server_id}/nginx/templates`,
  );
  const templates = response.templates;
  return {
    data: templates,
  };
}
