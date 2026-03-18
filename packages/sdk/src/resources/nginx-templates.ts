import type {
  CreateNginxTemplateData,
  HttpClient,
  JsonApiDocument,
  JsonApiListDocument,
  NginxTemplateAttributes,
} from "@studiometa/forge-api";

import { unwrapDocument, unwrapListDocument } from "@studiometa/forge-api";

import { BaseCollection } from "./base.ts";
import { AsyncPaginatedIterator } from "../pagination.ts";

/**
 * Options for listing Nginx templates.
 */
export interface NginxTemplateListOptions {
  /** Cursor for pagination (from previous response's next_cursor). */
  cursor?: string;
}

/**
 * Collection of Nginx templates on a server.
 *
 * Access via `forge.server(id).nginxTemplates`.
 *
 * @example
 * ```ts
 * const templates = await forge.server(123).nginxTemplates.list();
 * ```
 */
export class NginxTemplatesCollection extends BaseCollection {
  /** @internal */
  constructor(
    client: HttpClient,
    orgSlug: string,
    private readonly serverId: number,
  ) {
    super(client, orgSlug);
  }

  private get basePath(): string {
    return `/orgs/${this.orgSlug}/servers/${this.serverId}/nginx/templates`;
  }

  /**
   * List Nginx templates on this server.
   *
   * @example
   * ```ts
   * const templates = await forge.server(123).nginxTemplates.list();
   *
   * // Fetch a specific cursor page:
   * const page2 = await forge.server(123).nginxTemplates.list({ cursor: 'next-cursor-value' });
   * ```
   */
  async list(
    options: NginxTemplateListOptions = {},
  ): Promise<Array<NginxTemplateAttributes & { id: number }>> {
    const query = options.cursor !== undefined ? `?page[cursor]=${options.cursor}` : "";
    const response = await this.client.get<JsonApiListDocument<NginxTemplateAttributes>>(
      `${this.basePath}${query}`,
    );
    return unwrapListDocument(response);
  }

  /**
   * Iterate over all Nginx templates across all pages.
   *
   * @example
   * ```ts
   * for await (const template of forge.server(123).nginxTemplates.all()) {
   *   console.log(template);
   * }
   *
   * // Or collect all at once:
   * const templates = await forge.server(123).nginxTemplates.all().toArray();
   * ```
   */
  all(): AsyncPaginatedIterator<NginxTemplateAttributes & { id: number }> {
    return new AsyncPaginatedIterator<NginxTemplateAttributes & { id: number }>(async (cursor) => {
      const query = cursor !== null ? `?page[cursor]=${cursor}` : "";
      const response = await this.client.get<JsonApiListDocument<NginxTemplateAttributes>>(
        `${this.basePath}${query}`,
      );
      return {
        items: unwrapListDocument(response),
        nextCursor: response.meta.next_cursor ?? null,
      };
    });
  }

  /**
   * Get a specific Nginx template.
   *
   * @example
   * ```ts
   * const template = await forge.server(123).nginxTemplates.get(789);
   * ```
   */
  async get(templateId: number): Promise<NginxTemplateAttributes & { id: number }> {
    const response = await this.client.get<JsonApiDocument<NginxTemplateAttributes>>(
      `${this.basePath}/${templateId}`,
    );
    return unwrapDocument(response);
  }

  /**
   * Create a new Nginx template.
   *
   * @example
   * ```ts
   * const template = await forge.server(123).nginxTemplates.create({
   *   name: 'Laravel Template',
   *   content: 'server { ... }',
   * });
   * ```
   */
  async create(data: CreateNginxTemplateData): Promise<NginxTemplateAttributes & { id: number }> {
    const response = await this.client.post<JsonApiDocument<NginxTemplateAttributes>>(
      this.basePath,
      data,
    );
    return unwrapDocument(response);
  }

  /**
   * Update an existing Nginx template.
   *
   * @example
   * ```ts
   * const template = await forge.server(123).nginxTemplates.update(789, {
   *   name: 'Updated Template',
   *   content: 'server { ... }',
   * });
   * ```
   */
  async update(
    templateId: number,
    data: Partial<CreateNginxTemplateData>,
  ): Promise<NginxTemplateAttributes & { id: number }> {
    const response = await this.client.put<JsonApiDocument<NginxTemplateAttributes>>(
      `${this.basePath}/${templateId}`,
      data,
    );
    return unwrapDocument(response);
  }

  /**
   * Delete a Nginx template.
   *
   * @example
   * ```ts
   * await forge.server(123).nginxTemplates.delete(789);
   * ```
   */
  async delete(templateId: number): Promise<void> {
    await this.client.delete(`${this.basePath}/${templateId}`);
  }
}
