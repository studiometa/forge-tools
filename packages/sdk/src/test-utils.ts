import { vi } from "vitest";

/**
 * Create a mock `fetch` function for use in SDK tests.
 *
 * The handler receives the request URL and init options, and should return
 * the data to be serialised as JSON in the response body.
 *
 * @param handler A function that receives `(url, init)` and returns response data.
 * @returns A vitest mock function compatible with the `fetch` signature.
 *
 * @example
 * ```ts
 * import { describe, it, expect } from 'vitest';
 * import { Forge } from '@studiometa/forge-sdk';
 * import { createMockFetch } from '@studiometa/forge-sdk/test-utils';
 *
 * describe('my feature', () => {
 *   it('lists servers', async () => {
 *     const mockFetch = createMockFetch(() => ({ servers: [] }));
 *     const forge = new Forge('test-token', { fetch: mockFetch });
 *     const servers = await forge.servers.list();
 *     expect(servers).toEqual([]);
 *   });
 * });
 * ```
 */
export function createMockFetch(
  handler: (url: string, init?: RequestInit) => unknown,
): typeof fetch {
  return vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
    const urlStr = typeof url === "string" ? url : url instanceof URL ? url.toString() : url.url;
    const data = handler(urlStr, init);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as unknown as typeof fetch;
}
