import type { HttpClient } from "@studiometa/forge-api";

/**
 * Abstract base class for resource collections.
 * Provides a shared `client` property to avoid duplication across all collection classes.
 */
export abstract class BaseCollection {
  protected readonly client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }
}
