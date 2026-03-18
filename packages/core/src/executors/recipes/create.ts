import type { JsonApiDocument, RecipeAttributes } from "@studiometa/forge-api";
import { unwrapDocument } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { orgPrefix } from "../../utils/url-builder.ts";

import type { CreateRecipeOptions } from "./types.ts";

export async function createRecipe(
  options: CreateRecipeOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<RecipeAttributes & { id: number }>> {
  const response = await ctx.client.post<JsonApiDocument<RecipeAttributes>>(
    `${orgPrefix(ctx)}/recipes`,
    options,
  );

  return {
    data: unwrapDocument(response),
  };
}
