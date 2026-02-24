import type { ForgeNginxTemplate, NginxTemplateResponse } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { CreateNginxTemplateOptions } from "./types.ts";

export async function createNginxTemplate(
  options: CreateNginxTemplateOptions,
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
