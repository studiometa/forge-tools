import type {
  CreateCertificateData,
  ForgeCertificate,
  HttpClient,
  CertificateResponse,
  CertificatesResponse,
} from "@studiometa/forge-api";

import { BaseCollection } from "./base.ts";

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
    private readonly serverId: number,
    private readonly siteId: number,
  ) {
    super(client);
  }

  private get basePath(): string {
    return `/servers/${this.serverId}/sites/${this.siteId}/certificates`;
  }

  /**
   * List all certificates for this site.
   *
   * @example
   * ```ts
   * const certs = await forge.server(123).site(456).certificates.list();
   * ```
   */
  async list(): Promise<ForgeCertificate[]> {
    const response = await this.client.get<CertificatesResponse>(this.basePath);
    return response.certificates;
  }

  /**
   * Get a specific certificate.
   *
   * @example
   * ```ts
   * const cert = await forge.server(123).site(456).certificates.get(789);
   * ```
   */
  async get(certificateId: number): Promise<ForgeCertificate> {
    const response = await this.client.get<CertificateResponse>(
      `${this.basePath}/${certificateId}`,
    );
    return response.certificate;
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
  async create(data: CreateCertificateData): Promise<ForgeCertificate> {
    const response = await this.client.post<CertificateResponse>(this.basePath, data);
    return response.certificate;
  }

  /**
   * Install a Let's Encrypt certificate.
   *
   * @example
   * ```ts
   * await forge.server(123).site(456).certificates.letsEncrypt(['example.com', 'www.example.com']);
   * ```
   */
  async letsEncrypt(domains: string[]): Promise<ForgeCertificate> {
    const response = await this.client.post<CertificateResponse>(`${this.basePath}/letsencrypt`, {
      domains,
    });
    return response.certificate;
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
