import type {
  CreateCertificateData,
  HttpClient,
  JsonApiDocument,
  JsonApiListDocument,
  CertificateAttributes,
} from "@studiometa/forge-api";

import { unwrapDocument, unwrapListDocument } from "@studiometa/forge-api";

import { BaseCollection } from "./base.ts";
import { AsyncPaginatedIterator } from "../pagination.ts";

/**
 * Options for listing certificates.
 */
export interface CertificateListOptions {
  /** Cursor for pagination (from previous response's next_cursor). */
  cursor?: string;
}

/**
 * Collection of SSL certificates for a site.
 *
 * Access via `forge.server(id).site(id).certificates`.
 *
 * @example
 * ```ts
 * const certs = await forge.server(123).site(456).certificates.list();
 * ```
 */
export class CertificatesCollection extends BaseCollection {
  /** @internal */
  constructor(
    client: HttpClient,
    orgSlug: string,
    private readonly serverId: number,
    private readonly siteId: number,
  ) {
    super(client, orgSlug);
  }

  private get basePath(): string {
    return `/orgs/${this.orgSlug}/servers/${this.serverId}/sites/${this.siteId}/certificates`;
  }

  /**
   * List certificates for this site.
   *
   * @example
   * ```ts
   * const certs = await forge.server(123).site(456).certificates.list();
   *
   * // Fetch a specific cursor page:
   * const page2 = await forge.server(123).site(456).certificates.list({ cursor: 'next-cursor-value' });
   * ```
   */
  async list(
    options: CertificateListOptions = {},
  ): Promise<Array<CertificateAttributes & { id: number }>> {
    const query = options.cursor !== undefined ? `?page[cursor]=${options.cursor}` : "";
    const response = await this.client.get<JsonApiListDocument<CertificateAttributes>>(
      `${this.basePath}${query}`,
    );
    return unwrapListDocument(response);
  }

  /**
   * Iterate over all certificates across all pages.
   *
   * @example
   * ```ts
   * for await (const cert of forge.server(123).site(456).certificates.all()) {
   *   console.log(cert);
   * }
   *
   * // Or collect all at once:
   * const certs = await forge.server(123).site(456).certificates.all().toArray();
   * ```
   */
  all(): AsyncPaginatedIterator<CertificateAttributes & { id: number }> {
    return new AsyncPaginatedIterator<CertificateAttributes & { id: number }>(async (cursor) => {
      const query = cursor !== null ? `?page[cursor]=${cursor}` : "";
      const response = await this.client.get<JsonApiListDocument<CertificateAttributes>>(
        `${this.basePath}${query}`,
      );
      return {
        items: unwrapListDocument(response),
        nextCursor: response.meta.next_cursor ?? null,
      };
    });
  }

  /**
   * Get a specific certificate.
   *
   * @example
   * ```ts
   * const cert = await forge.server(123).site(456).certificates.get(789);
   * ```
   */
  async get(certificateId: number): Promise<CertificateAttributes & { id: number }> {
    const response = await this.client.get<JsonApiDocument<CertificateAttributes>>(
      `${this.basePath}/${certificateId}`,
    );
    return unwrapDocument(response);
  }

  /**
   * Create a new SSL certificate.
   *
   * @example
   * ```ts
   * const cert = await forge.server(123).site(456).certificates.create({
   *   type: 'new',
   *   domain: 'example.com',
   * });
   * ```
   */
  async create(data: CreateCertificateData): Promise<CertificateAttributes & { id: number }> {
    const response = await this.client.post<JsonApiDocument<CertificateAttributes>>(
      this.basePath,
      data,
    );
    return unwrapDocument(response);
  }

  /**
   * Install a Let's Encrypt certificate.
   *
   * @example
   * ```ts
   * await forge.server(123).site(456).certificates.letsEncrypt(['example.com', 'www.example.com']);
   * ```
   */
  async letsEncrypt(domains: string[]): Promise<CertificateAttributes & { id: number }> {
    const response = await this.client.post<JsonApiDocument<CertificateAttributes>>(
      `${this.basePath}/letsencrypt`,
      { domains },
    );
    return unwrapDocument(response);
  }

  /**
   * Delete a certificate.
   *
   * @example
   * ```ts
   * await forge.server(123).site(456).certificates.delete(789);
   * ```
   */
  async delete(certificateId: number): Promise<void> {
    await this.client.delete(`${this.basePath}/${certificateId}`);
  }

  /**
   * Activate a certificate.
   *
   * @example
   * ```ts
   * await forge.server(123).site(456).certificates.activate(789);
   * ```
   */
  async activate(certificateId: number): Promise<void> {
    await this.client.post(`${this.basePath}/${certificateId}/activate`);
  }
}
