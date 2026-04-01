import type {
  CreateRecipeData,
  JsonApiDocument,
  JsonApiListDocument,
  RecipeAttributes,
} from "@studiometa/forge-api";

import { unwrapDocument, unwrapListDocument } from "@studiometa/forge-api";

import { BaseCollection } from "./base.ts";
import { AsyncPaginatedIterator } from "../pagination.ts";

/**
 * Options for listing recipes.
 */
export interface RecipeListOptions {
  /** Cursor for pagination (from previous response's next_cursor). */
  cursor?: string;
}

/**
 * Options for running a recipe.
 */
export interface RunRecipeOptions {
  /** Server IDs to run the recipe on. */
  servers: number[];
}

/**
 * Collection of recipes.
 *
 * Access via `forge.recipes`.
 *
 * @example
 * ```ts
 * const recipes = await forge.recipes.list();
 * ```
 */
export class RecipesCollection extends BaseCollection {
  /** @internal */

  private get basePath(): string {
    return `/orgs/${this.orgSlug}/recipes`;
  }

  /**
   * List all recipes.
   *
   * @example
   * ```ts
   * const recipes = await forge.recipes.list();
   *
   * // Fetch a specific cursor page:
   * const page2 = await forge.recipes.list({ cursor: 'next-cursor-value' });
   * ```
   */
  async list(options: RecipeListOptions = {}): Promise<Array<RecipeAttributes & { id: number }>> {
    const query = options.cursor !== undefined ? `?page[cursor]=${options.cursor}` : "";
    const response = await this.client.get<JsonApiListDocument<RecipeAttributes>>(
      `${this.basePath}${query}`,
    );
    return unwrapListDocument(response);
  }

  /**
   * Iterate over all recipes across all pages.
   *
   * @example
   * ```ts
   * for await (const recipe of forge.recipes.all()) {
   *   console.log(recipe);
   * }
   *
   * // Or collect all at once:
   * const recipes = await forge.recipes.all().toArray();
   * ```
   */
  all(): AsyncPaginatedIterator<RecipeAttributes & { id: number }> {
    return new AsyncPaginatedIterator<RecipeAttributes & { id: number }>(async (cursor) => {
      const query = cursor !== null ? `?page[cursor]=${cursor}` : "";
      const response = await this.client.get<JsonApiListDocument<RecipeAttributes>>(
        `${this.basePath}${query}`,
      );
      return {
        items: unwrapListDocument(response),
        nextCursor: response.meta.next_cursor ?? null,
      };
    });
  }

  /**
   * Get a specific recipe.
   *
   * @example
   * ```ts
   * const recipe = await forge.recipes.get(789);
   * ```
   */
  async get(recipeId: number): Promise<RecipeAttributes & { id: number }> {
    const response = await this.client.get<JsonApiDocument<RecipeAttributes>>(
      `${this.basePath}/${recipeId}`,
    );
    return unwrapDocument(response);
  }

  /**
   * Create a new recipe.
   *
   * @example
   * ```ts
   * const recipe = await forge.recipes.create({
   *   name: 'Install Node',
   *   user: 'root',
   *   script: 'curl -fsSL https://deb.nodesource.com/setup_20.x | bash -',
   * });
   * ```
   */
  async create(data: CreateRecipeData): Promise<RecipeAttributes & { id: number }> {
    const response = await this.client.post<JsonApiDocument<RecipeAttributes>>(this.basePath, data);
    return unwrapDocument(response);
  }

  /**
   * Delete a recipe.
   *
   * @example
   * ```ts
   * await forge.recipes.delete(789);
   * ```
   */
  async delete(recipeId: number): Promise<void> {
    await this.client.delete(`${this.basePath}/${recipeId}`);
  }

  /**
   * Run a recipe on one or more servers.
   *
   * @example
   * ```ts
   * await forge.recipes.run(789, { servers: [123, 456] });
   * ```
   */
  async run(recipeId: number, options: RunRecipeOptions): Promise<void> {
    await this.client.post(`${this.basePath}/${recipeId}/run`, options);
  }
}
