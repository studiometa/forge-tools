import type {
  ComposerCredentialAttributes,
  CreateComposerCredentialData,
  CreateNpmCredentialData,
  NpmCredentialAttributes,
  UpdateComposerCredentialData,
  UpdateNpmCredentialData,
} from "@studiometa/forge-api";

import { SiteScoped } from "./site-scoped.ts";

/**
 * The credentials of the private Composer repositories of a site.
 *
 * Access via `forge.server(id).site(id).composerCredentials`.
 *
 * @example
 * ```ts
 * await forge.server(123).site(456).composerCredentials.create({
 *   repository: 'repo.example.com',
 *   username: 'user',
 *   password: 'secret',
 * });
 * ```
 */
export class ComposerCredentialsCollection extends SiteScoped {
  /** @internal */
  private get basePath(): string {
    return `${this.sitePath}/composer/credentials`;
  }

  /**
   * List the Composer credentials of the site.
   *
   * @example
   * ```ts
   * const credentials = await forge.server(123).site(456).composerCredentials.list();
   * ```
   */
  async list(): Promise<Array<ComposerCredentialAttributes & { id: number }>> {
    return this.listAll<ComposerCredentialAttributes>(this.basePath);
  }

  /**
   * Get the Composer credentials of a repository.
   *
   * @example
   * ```ts
   * const credential = await forge.server(123).site(456).composerCredentials.get('repo.example.com');
   * ```
   */
  async get(repository: string): Promise<ComposerCredentialAttributes & { id: number }> {
    return this.getResource<ComposerCredentialAttributes>(
      `${this.basePath}/${encodeURIComponent(repository)}`,
    );
  }

  /**
   * Add the credentials of a Composer repository.
   *
   * @example
   * ```ts
   * await forge.server(123).site(456).composerCredentials.create({
   *   repository: 'repo.example.com',
   *   username: 'user',
   *   password: 'secret',
   * });
   * ```
   */
  async create(data: CreateComposerCredentialData): Promise<void> {
    await this.client.post(this.basePath, data);
  }

  /**
   * Update the credentials of a Composer repository.
   *
   * @example
   * ```ts
   * await forge.server(123).site(456).composerCredentials.update('repo.example.com', {
   *   repository: 'repo.example.com',
   *   username: 'user',
   *   password: 'new-secret',
   * });
   * ```
   */
  async update(repository: string, data: UpdateComposerCredentialData): Promise<void> {
    await this.client.put(`${this.basePath}/${encodeURIComponent(repository)}`, data);
  }

  /**
   * Remove the credentials of a Composer repository.
   *
   * @example
   * ```ts
   * await forge.server(123).site(456).composerCredentials.delete('repo.example.com');
   * ```
   */
  async delete(repository: string): Promise<void> {
    await this.client.delete(`${this.basePath}/${encodeURIComponent(repository)}`);
  }
}

/**
 * The credentials of the private npm registries of a site.
 *
 * Access via `forge.server(id).site(id).npmCredentials`.
 *
 * @example
 * ```ts
 * await forge.server(123).site(456).npmCredentials.create({
 *   registry: 'npm.pkg.github.com',
 *   token: 'secret',
 *   scopes: ['@acme'],
 * });
 * ```
 */
export class NpmCredentialsCollection extends SiteScoped {
  /** @internal */
  private get basePath(): string {
    return `${this.sitePath}/npm/credentials`;
  }

  /**
   * List the npm credentials of the site.
   *
   * @example
   * ```ts
   * const credentials = await forge.server(123).site(456).npmCredentials.list();
   * ```
   */
  async list(): Promise<Array<NpmCredentialAttributes & { id: number }>> {
    return this.listAll<NpmCredentialAttributes>(this.basePath);
  }

  /**
   * Get the npm credentials of a registry.
   *
   * @example
   * ```ts
   * const credential = await forge.server(123).site(456).npmCredentials.get('npm.pkg.github.com');
   * ```
   */
  async get(registry: string): Promise<NpmCredentialAttributes & { id: number }> {
    return this.getResource<NpmCredentialAttributes>(
      `${this.basePath}/${encodeURIComponent(registry)}`,
    );
  }

  /**
   * Add the credentials of an npm registry.
   *
   * @example
   * ```ts
   * await forge.server(123).site(456).npmCredentials.create({
   *   registry: 'npm.pkg.github.com',
   *   token: 'secret',
   * });
   * ```
   */
  async create(data: CreateNpmCredentialData): Promise<void> {
    await this.client.post(this.basePath, data);
  }

  /**
   * Update the credentials of an npm registry.
   *
   * @example
   * ```ts
   * await forge.server(123).site(456).npmCredentials.update('npm.pkg.github.com', {
   *   registry: 'npm.pkg.github.com',
   *   token: 'new-secret',
   * });
   * ```
   */
  async update(registry: string, data: UpdateNpmCredentialData): Promise<void> {
    await this.client.put(`${this.basePath}/${encodeURIComponent(registry)}`, data);
  }

  /**
   * Remove the credentials of an npm registry.
   *
   * @example
   * ```ts
   * await forge.server(123).site(456).npmCredentials.delete('npm.pkg.github.com');
   * ```
   */
  async delete(registry: string): Promise<void> {
    await this.client.delete(`${this.basePath}/${encodeURIComponent(registry)}`);
  }
}
