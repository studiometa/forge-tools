import type {
  CreateNginxTemplateData,
  ForgeNginxTemplate,
  HttpClient,
  NginxTemplateResponse,
  NginxTemplatesResponse,
} from "@studiometa/forge-api";

import { BaseCollection } from "./base.ts";
import { AsyncPaginatedIterator } from "../pagination.ts";

/**
 * Options for listing Nginx templates.
 */
export interface NginxTemplateListOptions {
  /** Page number to fetch (1-indexed). */
  page?: number;
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
    private readonly serverId: number,
  ) {
    super(client);
  }

  private get basePath(): string {
    return `/servers/${this.serverId}/nginx/templates`;
  }

  /**
   * List Nginx templates on this server.
   *
   * @example
   * ```ts
   * const templates = await forge.server(123).nginxTemplates.list();
   *
   * // Fetch a specific page:
   * const page2 = await forge.server(123).nginxTemplates.list({ page: 2 });
   * ```
   */
  async list(options: NginxTemplateListOptions = {}): Promise<ForgeNginxTemplate[]> {
    const query = options.page !== undefined ? `?page=${options.page}` : "";
    const response = await this.client.get<NginxTemplatesResponse>(`${this.basePath}${query}`);
    return response.templates;
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
  all(
    options: Omit<NginxTemplateListOptions, "page"> = {},
  ): AsyncPaginatedIterator<ForgeNginxTemplate> {
    return new AsyncPaginatedIterator<ForgeNginxTemplate>((page) =>
      this.list({ ...options, page }),
    );
  }

  /**
   * Get a specific Nginx template.
   *
   * @example
   * ```ts
   * const template = await forge.server(123).nginxTemplates.get(789);
   * ```
   */
  async get(templateId: number): Promise<ForgeNginxTemplate> {
    const response = await this.client.get<NginxTemplateResponse>(`${this.basePath}/${templateId}`);
    return response.template;
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
  async create(data: CreateNginxTemplateData): Promise<ForgeNginxTemplate> {
    const response = await this.client.post<NginxTemplateResponse>(this.basePath, data);
    return response.template;
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
  ): Promise<ForgeNginxTemplate> {
    const response = await this.client.put<NginxTemplateResponse>(
      `${this.basePath}/${templateId}`,
      data,
    );
    return response.template;
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
