import type { DeploymentWebhookAttributes } from "@studiometa/forge-api";

import type { AllOptions, ListOptions } from "../list-options.ts";
import type { AsyncPaginatedIterator } from "../pagination.ts";

import { SiteScoped } from "./site-scoped.ts";

/** Options for listing the deployment webhooks of a site. */
export type WebhookListOptions = ListOptions<never, "created_at" | "updated_at">;

/**
 * The deployment webhooks of a site: URLs that Forge calls after each deployment.
 *
 * Access via `forge.server(id).site(id).webhooks`.
 *
 * @example
 * ```ts
 * await forge.server(123).site(456).webhooks.create('https://example.com/deployed');
 * ```
 */
export class WebhooksCollection extends SiteScoped {
  /** @internal */
  private get basePath(): string {
    return `${this.sitePath}/webhooks`;
  }

  /**
   * List the deployment webhooks of the site.
   *
   * @example
   * ```ts
   * const webhooks = await forge.server(123).site(456).webhooks.list();
   * ```
   */
  async list(
    options: WebhookListOptions = {},
  ): Promise<Array<DeploymentWebhookAttributes & { id: number }>> {
    return this.listPage<DeploymentWebhookAttributes>(this.basePath, options);
  }

  /**
   * Iterate over all the deployment webhooks of the site.
   *
   * @example
   * ```ts
   * const webhooks = await forge.server(123).site(456).webhooks.all().toArray();
   * ```
   */
  all(
    options: AllOptions<WebhookListOptions> = {},
  ): AsyncPaginatedIterator<DeploymentWebhookAttributes & { id: number }> {
    return this.iterate<DeploymentWebhookAttributes>(this.basePath, options);
  }

  /**
   * Get a deployment webhook.
   *
   * @example
   * ```ts
   * const webhook = await forge.server(123).site(456).webhooks.get(789);
   * ```
   */
  async get(webhookId: number): Promise<DeploymentWebhookAttributes & { id: number }> {
    return this.getResource<DeploymentWebhookAttributes>(`${this.basePath}/${webhookId}`);
  }

  /**
   * Add a deployment webhook.
   *
   * @example
   * ```ts
   * await forge.server(123).site(456).webhooks.create('https://example.com/deployed');
   * ```
   */
  async create(url: string): Promise<void> {
    await this.client.post(this.basePath, { url });
  }

  /**
   * Delete a deployment webhook.
   *
   * @example
   * ```ts
   * await forge.server(123).site(456).webhooks.delete(789);
   * ```
   */
  async delete(webhookId: number): Promise<void> {
    await this.client.delete(`${this.basePath}/${webhookId}`);
  }
}
