import type { JsonApiDocument, RecipeAttributes } from "@studiometa/forge-api";
import {
  unwrapDocument,
  jsonApiDocumentSchema,
  RecipeAttributesSchema,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { GetRecipeOptions } from "./types.ts";

/**
 * Get a single recipe.
 */
export async function getRecipe(
  options: GetRecipeOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<RecipeAttributes & { id: number }>> {
  const response = await request<JsonApiDocument<RecipeAttributes>>(
    ROUTES.recipes.get,
    ctx,
    { id: options.id },
    { schema: jsonApiDocumentSchema(RecipeAttributesSchema) },
  );

  return {
    data: unwrapDocument(response),
  };
}
