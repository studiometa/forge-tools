/**
 * Option types for certificate executors.
 *
 * In v2, a domain of a site has several certificates, one of them active:
 * `/sites/{site}/domains/{domain}/certificates`
 */

import type { CreateCertificateData } from "@studiometa/forge-api";

/**
 * Options for listing certificates: those of a domain, or of every domain of the site
 * when `domain_id` is not given.
 */
export interface ListCertificatesOptions {
  server_id: string;
  site_id: string;
  domain_id?: string;
}

/**
 * Options for getting a certificate of a domain: the active one when `id` is not given.
 */
export interface GetCertificateOptions {
  server_id: string;
  site_id: string;
  domain_id: string;
  id?: string;
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
 * Options for deleting a certificate of a domain.
 */
export interface DeleteCertificateOptions {
  server_id: string;
  site_id: string;
  domain_id: string;
  id: string;
}

/**
 * Options for activating a certificate of a domain.
 */
export interface ActivateCertificateOptions {
  server_id: string;
  site_id: string;
  domain_id: string;
  id: string;
}

/**
 * Options for deactivating a certificate of a domain.
 */
export type DeactivateCertificateOptions = ActivateCertificateOptions;
