import type {
  CreateNginxTemplateData,
  ForgeNginxTemplate,
  NginxTemplateResponse,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

export async function createNginxTemplate(
  options: { server_id: string } & CreateNginxTemplateData,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeNginxTemplate>> {
  const { server_id, ...data } = options;
  const response = await ctx.client.post<NginxTemplateResponse>(
    `/servers/${server_id}/nginx/templates`,
    data,
  );
  const template = response.template;

  return {
    data: template,
  };
}
