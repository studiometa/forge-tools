import type { HttpClient } from "@studiometa/forge-api";

/**
 * Abstract base class for resource collections.
 * Provides shared `client` and `orgSlug` properties to avoid duplication across all collection classes.
 */
export abstract class BaseCollection {
  protected readonly client: HttpClient;
  protected readonly orgSlug: string;

  constructor(client: HttpClient, orgSlug: string) {
    this.client = client;
    this.orgSlug = orgSlug;
  }
}
