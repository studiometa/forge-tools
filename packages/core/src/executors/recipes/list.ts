import type { JsonApiListDocument, RecipeAttributes } from "@studiometa/forge-api";
import { unwrapListDocument } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { orgPrefix } from "../../utils/url-builder.ts";

import type { ListRecipesOptions } from "./types.ts";

export async function listRecipes(
  _options: ListRecipesOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<Array<RecipeAttributes & { id: number }>>> {
  const response = await ctx.client.get<JsonApiListDocument<RecipeAttributes>>(
    `${orgPrefix(ctx)}/recipes`,
  );

  return {
    data: unwrapListDocument(response),
  };
}
