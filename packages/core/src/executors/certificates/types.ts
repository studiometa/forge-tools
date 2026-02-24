/**
 * Option types for certificate executors.
 */

import type { CreateCertificateData } from "@studiometa/forge-api";

/**
 * Options for listing SSL certificates for a site.
 */
export interface ListCertificatesOptions {
  server_id: string;
  site_id: string;
}

/**
 * Options for getting a single SSL certificate.
 */
export interface GetCertificateOptions {
  server_id: string;
  site_id: string;
  id: string;
}

/**
 * Options for creating an SSL certificate.
 */
export interface CreateCertificateOptions extends CreateCertificateData {
  server_id: string;
  site_id: string;
}

/**
 * Options for deleting an SSL certificate.
 */
export interface DeleteCertificateOptions {
  server_id: string;
  site_id: string;
  id: string;
}

/**
 * Options for activating an SSL certificate.
 */
export interface ActivateCertificateOptions {
  server_id: string;
  site_id: string;
  id: string;
}
