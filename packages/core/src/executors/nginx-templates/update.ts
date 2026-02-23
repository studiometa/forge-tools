import type { ForgeNginxTemplate, NginxTemplateResponse } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

export async function updateNginxTemplate(
  options: { server_id: string; id: string; name?: string; content?: string },
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeNginxTemplate>> {
  const { server_id, id, ...data } = options;
  const response = await ctx.client.put<NginxTemplateResponse>(
    `/servers/${server_id}/nginx/templates/${id}`,
    data,
  );
  const template = response.template;

  return {
    data: template,
    text: `Nginx template updated: ${template.name} (ID: ${template.id})`,
  };
}
