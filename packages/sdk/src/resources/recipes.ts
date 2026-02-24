import type {
  CreateRecipeData,
  ForgeRecipe,
  HttpClient,
  RecipeResponse,
  RecipesResponse,
} from "@studiometa/forge-api";

import { BaseCollection } from "./base.ts";
import { AsyncPaginatedIterator } from "../pagination.ts";

/**
 * Options for listing recipes.
 */
export interface RecipeListOptions {
  /** Page number to fetch (1-indexed). */
  page?: number;
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
  constructor(client: HttpClient) {
    super(client);
  }

  private get basePath(): string {
    return `/recipes`;
  }

  /**
   * List all recipes.
   *
   * @example
   * ```ts
   * const recipes = await forge.recipes.list();
   *
   * // Fetch a specific page:
   * const page2 = await forge.recipes.list({ page: 2 });
   * ```
   */
  async list(options: RecipeListOptions = {}): Promise<ForgeRecipe[]> {
    const query = options.page !== undefined ? `?page=${options.page}` : "";
    const response = await this.client.get<RecipesResponse>(`${this.basePath}${query}`);
    return response.recipes;
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
  all(options: Omit<RecipeListOptions, "page"> = {}): AsyncPaginatedIterator<ForgeRecipe> {
    return new AsyncPaginatedIterator<ForgeRecipe>((page) => this.list({ ...options, page }));
  }

  /**
   * Get a specific recipe.
   *
   * @example
   * ```ts
   * const recipe = await forge.recipes.get(789);
   * ```
   */
  async get(recipeId: number): Promise<ForgeRecipe> {
    const response = await this.client.get<RecipeResponse>(`${this.basePath}/${recipeId}`);
    return response.recipe;
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
  async create(data: CreateRecipeData): Promise<ForgeRecipe> {
    const response = await this.client.post<RecipeResponse>(this.basePath, data);
    return response.recipe;
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
