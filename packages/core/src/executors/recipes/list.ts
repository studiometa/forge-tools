import type { JsonApiListDocument, RecipeAttributes } from "@studiometa/forge-api";
import {
  unwrapListDocument,
  jsonApiListDocumentSchema,
  RecipeAttributesSchema,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { ListRecipesOptions } from "./types.ts";

/**
 * List all recipes.
 */
export async function listRecipes(
  _options: ListRecipesOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<Array<RecipeAttributes & { id: number }>>> {
  const response = await request<JsonApiListDocument<RecipeAttributes>>(
    ROUTES.recipes.list,
    ctx,
    {},
    { schema: jsonApiListDocumentSchema(RecipeAttributesSchema) },
  );

  return {
    data: unwrapListDocument(response),
  };
}
