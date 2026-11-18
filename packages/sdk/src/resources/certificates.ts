import type {
  CreateCertificateData,
  HttpClient,
  JsonApiDocument,
  JsonApiResource,
  CertificateAttributes,
} from "@studiometa/forge-api";

import { unwrapDocument, unwrapResource } from "@studiometa/forge-api";

import { BaseCollection } from "./base.ts";

/**
 * SSL certificates of a site. Each domain of the site has its certificates, and one of them
 * is active: `/orgs/{org}/servers/{server}/sites/{site}/domains/{domain}/certificates`.
 *
 * Access via `forge.server(id).site(id).certificates`.
 *
 * @example
 * ```ts
 * const cert = await forge.server(123).site(456).certificates.active(789);
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

  private get sitePath(): string {
    return `/orgs/${this.orgSlug}/servers/${this.serverId}/sites/${this.siteId}`;
  }

  private domainPath(domainId: number): string {
    return `${this.sitePath}/domains/${domainId}/certificates`;
  }

  /**
   * List the certificates of a domain, or of every domain of the site without a domain ID.
   *
   * @example
   * ```ts
   * const certs = await forge.server(123).site(456).certificates.list(789);
   * const all = await forge.server(123).site(456).certificates.list();
   * ```
   */
  async list(domainId?: number): Promise<Array<CertificateAttributes & { id: number }>> {
    const path =
      domainId === undefined ? `${this.sitePath}/certificates` : this.domainPath(domainId);
    const response = await this.client.get<{ data: JsonApiResource<CertificateAttributes>[] }>(
      path,
    );
    return response.data.map(unwrapResource);
  }

  /**
   * Get the active certificate of a domain.
   *
   * @example
   * ```ts
   * const cert = await forge.server(123).site(456).certificates.active(789);
   * ```
   */
  async active(domainId: number): Promise<CertificateAttributes & { id: number }> {
    const response = await this.client.get<JsonApiDocument<CertificateAttributes>>(
      `${this.domainPath(domainId)}/active`,
    );
    return unwrapDocument(response);
  }

  /**
   * Get a certificate of a domain.
   *
   * @example
   * ```ts
   * const cert = await forge.server(123).site(456).certificates.get(789, 12);
   * ```
   */
  async get(
    domainId: number,
    certificateId: number,
  ): Promise<CertificateAttributes & { id: number }> {
    const response = await this.client.get<JsonApiDocument<CertificateAttributes>>(
      `${this.domainPath(domainId)}/${certificateId}`,
    );
    return unwrapDocument(response);
  }

  /**
   * Create a certificate for a domain.
   *
   * @example
   * ```ts
   * const cert = await forge.server(123).site(456).certificates.create(789, {
   *   type: 'letsencrypt',
   * });
   * ```
   */
  async create(
    domainId: number,
    data: CreateCertificateData,
  ): Promise<CertificateAttributes & { id: number }> {
    const response = await this.client.post<JsonApiDocument<CertificateAttributes>>(
      this.domainPath(domainId),
      data,
    );
    return unwrapDocument(response);
  }

  /**
   * Delete a certificate of a domain.
   *
   * @example
   * ```ts
   * await forge.server(123).site(456).certificates.delete(789, 12);
   * ```
   */
  async delete(domainId: number, certificateId: number): Promise<void> {
    await this.client.delete(`${this.domainPath(domainId)}/${certificateId}`);
  }

  /**
   * Activate a certificate of a domain: Forge serves the domain with it.
   *
   * @example
   * ```ts
   * await forge.server(123).site(456).certificates.activate(789, 12);
   * ```
   */
  async activate(domainId: number, certificateId: number): Promise<void> {
    await this.client.post(`${this.domainPath(domainId)}/${certificateId}/actions`, {
      action: "enable",
    });
  }
}
