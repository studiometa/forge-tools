import type {
  CreateRecipeData,
  JsonApiDocument,
  RecipeAttributes,
  UpdateRecipeData,
  RecipeLogAttributes,
  RunRecipeData,
  HttpClient,
} from "@studiometa/forge-api";

import { unwrapDocument } from "@studiometa/forge-api";

import type { AllOptions, ListOptions } from "../list-options.ts";

import { BaseCollection } from "./base.ts";
import type { AsyncPaginatedIterator } from "../pagination.ts";

/**
 * Options for listing recipes.
 */
export type RecipeListOptions = ListOptions;

/**
 * Options for running a recipe: the servers to run it on, and whether to email its output.
 */
export type RunRecipeOptions = RunRecipeData;

/** Options for listing the runs of a recipe. */
export type RecipeRunListOptions = ListOptions;

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
    return this.listPage<RecipeAttributes>(this.basePath, options);
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
  all(
    options: AllOptions<RecipeListOptions> = {},
  ): AsyncPaginatedIterator<RecipeAttributes & { id: number }> {
    return this.iterate<RecipeAttributes>(this.basePath, options);
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
    await this.client.post(`${this.basePath}/${recipeId}/runs`, options);
  }

  /**
   * Update a recipe.
   *
   * @example
   * ```ts
   * await forge.recipes.update(3, { script: 'apt-get update' });
   * ```
   */
  async update(
    recipeId: number,
    data: UpdateRecipeData,
  ): Promise<RecipeAttributes & { id: number }> {
    return this.putResource<RecipeAttributes>(`${this.basePath}/${recipeId}`, data);
  }

  /**
   * The runs of a recipe, with their output.
   *
   * @example
   * ```ts
   * const runs = await forge.recipes.runs(3).list();
   * ```
   */
  runs(recipeId: number): RecipeRunsCollection {
    return new RecipeRunsCollection(this.client, this.orgSlug, `${this.basePath}/${recipeId}/runs`);
  }
}

/**
 * The runs of a recipe.
 *
 * Access via `forge.recipes.runs(recipeId)`.
 *
 * @example
 * ```ts
 * const run = await forge.recipes.runs(3).get(12);
 * ```
 */
export class RecipeRunsCollection extends BaseCollection {
  /** @internal */
  constructor(
    client: HttpClient,
    orgSlug: string,
    private readonly basePath: string,
  ) {
    super(client, orgSlug);
  }

  /**
   * List the runs of the recipe.
   *
   * @example
   * ```ts
   * const runs = await forge.recipes.runs(3).list();
   * ```
   */
  async list(
    options: RecipeRunListOptions = {},
  ): Promise<Array<RecipeLogAttributes & { id: number }>> {
    return this.listPage<RecipeLogAttributes>(this.basePath, options);
  }

  /**
   * Iterate over all the runs of the recipe.
   *
   * @example
   * ```ts
   * const runs = await forge.recipes.runs(3).all().toArray();
   * ```
   */
  all(
    options: AllOptions<RecipeRunListOptions> = {},
  ): AsyncPaginatedIterator<RecipeLogAttributes & { id: number }> {
    return this.iterate<RecipeLogAttributes>(this.basePath, options);
  }

  /**
   * Get a run of the recipe, with its output.
   *
   * @example
   * ```ts
   * const run = await forge.recipes.runs(3).get(12);
   * ```
   */
  async get(runId: number): Promise<RecipeLogAttributes & { id: number }> {
    return this.getResource<RecipeLogAttributes>(`${this.basePath}/${runId}`);
  }
}
