/**
 * Option types for Nginx template executors.
 */

import type { CreateNginxTemplateData } from "@studiometa/forge-api";

/**
 * Options for listing Nginx templates on a server.
 */
export interface ListNginxTemplatesOptions {
  server_id: string;
}

/**
 * Options for getting a single Nginx template.
 */
export interface GetNginxTemplateOptions {
  server_id: string;
  id: string;
}

/**
 * Options for creating a Nginx template.
 */
export interface CreateNginxTemplateOptions extends CreateNginxTemplateData {
  server_id: string;
}

/**
 * Options for updating a Nginx template.
 */
export interface UpdateNginxTemplateOptions {
  server_id: string;
  id: string;
  name?: string;
  content?: string;
}

/**
 * Options for deleting a Nginx template.
 */
export interface DeleteNginxTemplateOptions {
  server_id: string;
  id: string;
}
