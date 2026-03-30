import type { JsonApiDocument, RecipeAttributes } from "@studiometa/forge-api";
import {
  unwrapDocument,
  jsonApiDocumentSchema,
  RecipeAttributesSchema,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { CreateRecipeOptions } from "./types.ts";

/**
 * Create a recipe.
 */
export async function createRecipe(
  options: CreateRecipeOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<RecipeAttributes & { id: number }>> {
  const response = await request<JsonApiDocument<RecipeAttributes>>(
    ROUTES.recipes.create,
    ctx,
    {},
    { body: options, schema: jsonApiDocumentSchema(RecipeAttributesSchema) },
  );

  return {
    data: unwrapDocument(response),
  };
}
