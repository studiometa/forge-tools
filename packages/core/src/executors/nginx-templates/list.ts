import type { ForgeNginxTemplate, NginxTemplatesResponse } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { ListNginxTemplatesOptions } from "./types.ts";

export async function listNginxTemplates(
  options: ListNginxTemplatesOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeNginxTemplate[]>> {
  const response = await ctx.client.get<NginxTemplatesResponse>(
    `/servers/${options.server_id}/nginx/templates`,
  );
  const templates = response.templates;
  const lines = templates.map((t) => `• ${t.name} (ID: ${t.id})`);

  return {
    data: templates,
    text:
      templates.length > 0
        ? `${templates.length} nginx template(s):\n${lines.join("\n")}`
        : "No nginx templates found.",
  };
}
