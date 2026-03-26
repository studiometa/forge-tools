/**
 * Option types for certificate executors.
 *
 * In v2, certificates are scoped per domain:
 * `/sites/{site}/domains/{domain}/certificate`
 */

import type { CreateCertificateData } from "@studiometa/forge-api";

/**
 * Options for getting the SSL certificate for a domain.
 */
export interface GetCertificateOptions {
  server_id: string;
  site_id: string;
  domain_id: string;
}

/**
 * Options for creating an SSL certificate for a domain.
 */
export interface CreateCertificateOptions extends CreateCertificateData {
  server_id: string;
  site_id: string;
  domain_id: string;
}

/**
 * Options for deleting the SSL certificate for a domain.
 */
export interface DeleteCertificateOptions {
  server_id: string;
  site_id: string;
  domain_id: string;
}

/**
 * Options for activating the SSL certificate for a domain.
 */
export interface ActivateCertificateOptions {
  server_id: string;
  site_id: string;
  domain_id: string;
}
