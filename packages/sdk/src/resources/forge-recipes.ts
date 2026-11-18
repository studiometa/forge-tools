import type { ForgeRecipeAttributes, RunRecipeData } from "@studiometa/forge-api";

import type { AllOptions, ListOptions } from "../list-options.ts";
import type { AsyncPaginatedIterator } from "../pagination.ts";

import { BaseCollection } from "./base.ts";

/** Options for listing the recipes of Forge. */
export type ForgeRecipeListOptions = ListOptions;

/**
 * The recipes that Forge provides to every organization.
 *
 * Access via `forge.forgeRecipes`.
 *
 * @example
 * ```ts
 * const recipes = await forge.forgeRecipes.list();
 * ```
 */
export class ForgeRecipesCollection extends BaseCollection {
  /** @internal */
  private get basePath(): string {
    return "/forge-recipes";
  }

  /**
   * List the recipes of Forge.
   *
   * @example
   * ```ts
   * const recipes = await forge.forgeRecipes.list();
   * ```
   */
  async list(
    options: ForgeRecipeListOptions = {},
  ): Promise<Array<ForgeRecipeAttributes & { id: number }>> {
    return this.listPage<ForgeRecipeAttributes>(this.basePath, options);
  }

  /**
   * Iterate over all the recipes of Forge.
   *
   * @example
   * ```ts
   * const recipes = await forge.forgeRecipes.all().toArray();
   * ```
   */
  all(
    options: AllOptions<ForgeRecipeListOptions> = {},
  ): AsyncPaginatedIterator<ForgeRecipeAttributes & { id: number }> {
    return this.iterate<ForgeRecipeAttributes>(this.basePath, options);
  }

  /**
   * Get a recipe of Forge.
   *
   * @example
   * ```ts
   * const recipe = await forge.forgeRecipes.get(5);
   * ```
   */
  async get(recipeId: number): Promise<ForgeRecipeAttributes & { id: number }> {
    return this.getResource<ForgeRecipeAttributes>(`${this.basePath}/${recipeId}`);
  }

  /**
   * Run a recipe of Forge on servers of the organization.
   *
   * @example
   * ```ts
   * await forge.forgeRecipes.run(5, { servers: [123] });
   * ```
   */
  async run(recipeId: number, data: RunRecipeData): Promise<void> {
    await this.client.post(`${this.basePath}/${recipeId}/runs`, data);
  }
}
