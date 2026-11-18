import type { HttpClient } from "@studiometa/forge-api";

import { BaseCollection } from "./base.ts";

/**
 * Base of the resources of one site.
 */
export abstract class SiteScoped extends BaseCollection {
  /** @internal */
  constructor(
    client: HttpClient,
    orgSlug: string,
    protected readonly serverId: number,
    protected readonly siteId: number,
  ) {
    super(client, orgSlug);
  }

  /** @internal */
  protected get sitePath(): string {
    return `/orgs/${this.orgSlug}/servers/${this.serverId}/sites/${this.siteId}`;
  }
}
