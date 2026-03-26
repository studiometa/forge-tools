import type {
  CreateCertificateData,
  HttpClient,
  JsonApiDocument,
  CertificateAttributes,
} from "@studiometa/forge-api";

import { unwrapDocument } from "@studiometa/forge-api";

import { BaseCollection } from "./base.ts";

/**
 * SSL certificates for a site, accessed per-domain.
 *
 * In v2, certificates are a singular sub-resource of a domain:
 * `/orgs/{org}/servers/{server}/sites/{site}/domains/{domain}/certificate`
 *
 * Access via `forge.server(id).site(id).certificates`.
 *
 * @example
 * ```ts
 * const cert = await forge.server(123).site(456).certificates.get(789);
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

  private domainPath(domainId: number): string {
    return `/orgs/${this.orgSlug}/servers/${this.serverId}/sites/${this.siteId}/domains/${domainId}/certificate`;
  }

  /**
   * Get the certificate for a domain.
   *
   * @example
   * ```ts
   * const cert = await forge.server(123).site(456).certificates.get(789);
   * ```
   */
  async get(domainId: number): Promise<CertificateAttributes & { id: number }> {
    const response = await this.client.get<JsonApiDocument<CertificateAttributes>>(
      this.domainPath(domainId),
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
   * Delete the certificate for a domain.
   *
   * @example
   * ```ts
   * await forge.server(123).site(456).certificates.delete(789);
   * ```
   */
  async delete(domainId: number): Promise<void> {
    await this.client.delete(this.domainPath(domainId));
  }

  /**
   * Activate the certificate for a domain.
   *
   * @example
   * ```ts
   * await forge.server(123).site(456).certificates.activate(789);
   * ```
   */
  async activate(domainId: number): Promise<void> {
    await this.client.post(`${this.domainPath(domainId)}/actions`, { action: "activate" });
  }
}
