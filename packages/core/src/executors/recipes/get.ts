import type { JsonApiDocument, RecipeAttributes } from "@studiometa/forge-api";
import { unwrapDocument } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { orgPrefix } from "../../utils/url-builder.ts";

import type { GetRecipeOptions } from "./types.ts";

export async function getRecipe(
  options: GetRecipeOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<RecipeAttributes & { id: number }>> {
  const response = await ctx.client.get<JsonApiDocument<RecipeAttributes>>(
    `${orgPrefix(ctx)}/recipes/${options.id}`,
  );

  return {
    data: unwrapDocument(response),
  };
}
