import type { ForgeNginxTemplate, NginxTemplateResponse } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

export async function getNginxTemplate(
  options: { server_id: string; id: string },
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeNginxTemplate>> {
  const response = await ctx.client.get<NginxTemplateResponse>(
    `/servers/${options.server_id}/nginx/templates/${options.id}`,
  );
  const template = response.template;

  return {
    data: template,
    text: `Nginx Template: ${template.name} (ID: ${template.id})\n\n${template.content}`,
  };
}
