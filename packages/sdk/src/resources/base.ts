import type {
  HttpClient,
  JsonApiDocument,
  JsonApiListDocument,
  JsonApiResource,
} from "@studiometa/forge-api";

import { unwrapDocument, unwrapListDocument, unwrapResource } from "@studiometa/forge-api";

import type { ListOptions } from "../list-options.ts";

import { listQuery } from "../list-options.ts";
import { AsyncPaginatedIterator } from "../pagination.ts";

/**
 * Abstract base class for resource collections.
 * Provides shared `client` and `orgSlug` properties, and the requests that every collection makes.
 */
export abstract class BaseCollection {
  protected readonly client: HttpClient;
  protected readonly orgSlug: string;

  constructor(client: HttpClient, orgSlug: string) {
    this.client = client;
    this.orgSlug = orgSlug;
  }

  /** GET a single resource and unwrap it. */
  protected async getResource<T>(path: string): Promise<T & { id: number }> {
    return unwrapDocument(await this.client.get<JsonApiDocument<T>>(path));
  }

  /** POST to a route that answers with a resource, and unwrap it. */
  protected async postResource<T>(path: string, body?: unknown): Promise<T & { id: number }> {
    return unwrapDocument(await this.client.post<JsonApiDocument<T>>(path, body));
  }

  /** PUT to a route that answers with a resource, and unwrap it. */
  protected async putResource<T>(path: string, body?: unknown): Promise<T & { id: number }> {
    return unwrapDocument(await this.client.put<JsonApiDocument<T>>(path, body));
  }

  /** PATCH a route that answers with a resource, and unwrap it. */
  protected async patchResource<T>(path: string, body?: unknown): Promise<T & { id: number }> {
    return unwrapDocument(await this.client.patch<JsonApiDocument<T>>(path, body));
  }

  /** GET one page of a paginated list. */
  protected async listPage<T>(
    path: string,
    options: ListOptions<string, string, string> = {},
  ): Promise<Array<T & { id: number }>> {
    const response = await this.client.get<JsonApiListDocument<T>>(`${path}${listQuery(options)}`);
    return unwrapListDocument(response);
  }

  /** Iterate over every page of a paginated list. */
  protected iterate<T>(
    path: string,
    options: ListOptions<string, string, string> = {},
  ): AsyncPaginatedIterator<T & { id: number }> {
    return new AsyncPaginatedIterator<T & { id: number }>(async (cursor) => {
      const response = await this.client.get<JsonApiListDocument<T>>(
        `${path}${listQuery(options, cursor)}`,
      );
      return {
        items: unwrapListDocument(response),
        nextCursor: response.meta.next_cursor ?? null,
      };
    });
  }

  /** GET a list that the API sends in one response, without pagination. */
  protected async listAll<T>(path: string): Promise<Array<T & { id: number }>> {
    const response = await this.client.get<{ data: JsonApiResource<T>[] }>(path);
    return response.data.map(unwrapResource);
  }
}
