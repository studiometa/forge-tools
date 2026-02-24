/**
 * Option types for recipe executors.
 */

import type { CreateRecipeData } from "@studiometa/forge-api";

/**
 * Options for listing recipes.
 */
export interface ListRecipesOptions {
  // Forge recipes endpoint takes no filter params currently
}

/**
 * Options for getting a single recipe.
 */
export interface GetRecipeOptions {
  id: string;
}

/**
 * Options for creating a recipe.
 */
export interface CreateRecipeOptions extends CreateRecipeData {}

/**
 * Options for deleting a recipe.
 */
export interface DeleteRecipeOptions {
  id: string;
}

/**
 * Options for running a recipe on servers.
 */
export interface RunRecipeOptions {
  id: string;
  servers: number[];
}
