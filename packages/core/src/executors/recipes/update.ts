import type { RecipeAttributes } from "@studiometa/forge-api";
import {
  unwrapDocument,
  jsonApiDocumentSchema,
  RecipeAttributesSchema,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { UpdateRecipeOptions } from "./types.ts";

/**
 * Update a recipe.
 */
export async function updateRecipe(
  options: UpdateRecipeOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<RecipeAttributes & { id: number }>> {
  const { id, ...body } = options;

  const response = await request(
    ROUTES.recipes.update,
    ctx,
    { id },
    { body, schema: jsonApiDocumentSchema(RecipeAttributesSchema) },
  );

  return {
    data: unwrapDocument(response),
  };
}
