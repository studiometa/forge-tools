import { describe, expect, it } from "vitest";

import { HttpClient } from "./client.ts";
import { ForgeApiError } from "./errors.ts";

/**
 * Create a mock fetch that returns the given response.
 */
function createMockFetch(
  response: {
    status?: number;
    body?: unknown;
    headers?: Record<string, string>;
    contentType?: string;
    text?: string;
  } = {},
): typeof globalThis.fetch {
  const {
    status = 200,
    body = {},
    headers = {},
    contentType = "application/json",
    text,
  } = response;

  return async (_url: string | URL | Request, _init?: RequestInit) => {
    const responseHeaders = new Headers({
      "content-type": contentType,
      ...headers,
    });

    return {
      ok: status >= 200 && status < 300,
      status,
      headers: responseHeaders,
      json: async () => body,
      text: async () => text ?? JSON.stringify(body),
    } as Response;
  };
}

/**
 * Create a mock fetch that records calls and returns responses in sequence.
 */
function createSequenceFetch(
  responses: Array<{
    status?: number;
    body?: unknown;
    headers?: Record<string, string>;
  }>,
): { fetch: typeof globalThis.fetch; calls: Array<{ url: string; init?: RequestInit }> } {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  let index = 0;

  const mockFetch = async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: url.toString(), init });
    const response = responses[index] ?? responses.at(-1)!;
    index++;

    return {
      ok: (response.status ?? 200) >= 200 && (response.status ?? 200) < 300,
      status: response.status ?? 200,
      headers: new Headers({
        "content-type": "application/json",
        ...response.headers,
      }),
      json: async () => response.body ?? {},
      text: async () => JSON.stringify(response.body ?? {}),
    } as Response;
  };

  return { fetch: mockFetch as typeof globalThis.fetch, calls };
}

describe("HttpClient", () => {
  const defaultOptions = {
    token: "test-token",
    rateLimit: { maxRetries: 0 },
  };

  describe("authentication", () => {
    it("should send Bearer token in Authorization header", async () => {
      const { fetch, calls } = createSequenceFetch([{ body: { servers: [] } }]);
      const client = new HttpClient({ ...defaultOptions, fetch });

      await client.get("/servers");

      expect(calls[0]!.init?.headers).toEqual(
        expect.objectContaining({
          Authorization: "Bearer test-token",
          Accept: "application/json",
        }),
      );
    });
  });

  describe("get", () => {
    it("should make GET request and return parsed JSON", async () => {
      const mockFetch = createMockFetch({
        body: { servers: [{ id: 1, name: "web-1" }] },
      });
      const client = new HttpClient({ ...defaultOptions, fetch: mockFetch });

      const result = await client.get<{ servers: Array<{ id: number; name: string }> }>("/servers");
      expect(result.servers).toHaveLength(1);
      expect(result.servers[0]!.name).toBe("web-1");
    });

    it("should use default base URL", async () => {
      const { fetch, calls } = createSequenceFetch([{ body: {} }]);
      const client = new HttpClient({ ...defaultOptions, fetch });

      await client.get("/servers");

      expect(calls[0]!.url).toBe("https://forge.laravel.com/api/v1/servers");
    });

    it("should use custom base URL", async () => {
      const { fetch, calls } = createSequenceFetch([{ body: {} }]);
      const client = new HttpClient({
        ...defaultOptions,
        baseUrl: "https://custom.api.com",
        fetch,
      });

      await client.get("/servers");

      expect(calls[0]!.url).toBe("https://custom.api.com/servers");
    });
  });

  describe("post", () => {
    it("should make POST request with JSON body", async () => {
      const { fetch, calls } = createSequenceFetch([{ body: { server: { id: 1 } } }]);
      const client = new HttpClient({ ...defaultOptions, fetch });

      await client.post("/servers", { name: "web-2" });

      expect(calls[0]!.init?.method).toBe("POST");
      expect(calls[0]!.init?.body).toBe(JSON.stringify({ name: "web-2" }));
      expect(calls[0]!.init?.headers).toEqual(
        expect.objectContaining({
          "Content-Type": "application/json",
        }),
      );
    });

    it("should make POST request without body", async () => {
      const { fetch, calls } = createSequenceFetch([{ body: {} }]);
      const client = new HttpClient({ ...defaultOptions, fetch });

      await client.post("/servers/1/reboot");

      expect(calls[0]!.init?.method).toBe("POST");
      expect(calls[0]!.init?.body).toBeUndefined();
    });
  });

  describe("put", () => {
    it("should make PUT request with JSON body", async () => {
      const { fetch, calls } = createSequenceFetch([{ body: { server: { id: 1 } } }]);
      const client = new HttpClient({ ...defaultOptions, fetch });

      await client.put("/servers/1", { name: "updated" });

      expect(calls[0]!.init?.method).toBe("PUT");
      expect(calls[0]!.init?.body).toBe(JSON.stringify({ name: "updated" }));
    });
  });

  describe("delete", () => {
    it("should make DELETE request", async () => {
      const mockFetch = createMockFetch({ status: 204 });
      const client = new HttpClient({ ...defaultOptions, fetch: mockFetch });

      await client.delete("/servers/1");
    });
  });

  describe("error handling", () => {
    it("should throw ForgeApiError on 401", async () => {
      const mockFetch = createMockFetch({
        status: 401,
        body: { message: "Unauthenticated." },
      });
      const client = new HttpClient({ ...defaultOptions, fetch: mockFetch });

      await expect(client.get("/servers")).rejects.toThrow(ForgeApiError);
      try {
        await client.get("/servers");
      } catch (error) {
        const apiError = error as ForgeApiError;
        expect(apiError.status).toBe(401);
        expect(apiError.message).toBe("Unauthenticated.");
        expect(apiError.url).toContain("/servers");
      }
    });

    it("should throw ForgeApiError on 404", async () => {
      const mockFetch = createMockFetch({
        status: 404,
        body: { message: "Not found." },
      });
      const client = new HttpClient({ ...defaultOptions, fetch: mockFetch });

      await expect(client.get("/servers/999")).rejects.toThrow(ForgeApiError);
    });

    it("should throw ForgeApiError on 422 with validation errors", async () => {
      const mockFetch = createMockFetch({
        status: 422,
        body: { message: "The given data was invalid.", errors: { name: ["required"] } },
      });
      const client = new HttpClient({ ...defaultOptions, fetch: mockFetch });

      await expect(client.post("/servers", {})).rejects.toThrow(ForgeApiError);
    });

    it("should handle error responses with no JSON body", async () => {
      const mockFetch = async () =>
        ({
          ok: false,
          status: 500,
          headers: new Headers({ "content-type": "text/plain" }),
          json: async () => {
            throw new Error("not JSON");
          },
          text: async () => "Internal Server Error",
        }) as Response;

      const client = new HttpClient({ ...defaultOptions, fetch: mockFetch });

      await expect(client.get("/servers")).rejects.toThrow(ForgeApiError);
      try {
        await client.get("/servers");
      } catch (error) {
        const apiError = error as ForgeApiError;
        expect(apiError.status).toBe(500);
        expect(apiError.body).toBe("Internal Server Error");
      }
    });

    it("should provide default message for known status codes", async () => {
      const mockFetch = createMockFetch({
        status: 403,
        body: {},
      });
      const client = new HttpClient({ ...defaultOptions, fetch: mockFetch });

      try {
        await client.get("/servers");
      } catch (error) {
        const apiError = error as ForgeApiError;
        expect(apiError.message).toContain("Insufficient permissions");
      }
    });
  });

  describe("rate limiting retry", () => {
    it("should retry on 429 response", async () => {
      const { fetch, calls } = createSequenceFetch([
        { status: 429, headers: { "retry-after": "1" } },
        { body: { servers: [] } },
      ]);
      const client = new HttpClient({
        token: "test",
        fetch,
        rateLimit: { maxRetries: 3, baseDelay: 10 },
      });

      const result = await client.get<{ servers: unknown[] }>("/servers");

      expect(calls).toHaveLength(2);
      expect(result.servers).toEqual([]);
    });

    it("should throw after max retries on 429", async () => {
      const mockFetch = createMockFetch({
        status: 429,
        body: { message: "Too Many Requests" },
      });
      const client = new HttpClient({
        token: "test",
        fetch: mockFetch,
        rateLimit: { maxRetries: 0 },
      });

      await expect(client.get("/servers")).rejects.toThrow(ForgeApiError);
    });
  });

  describe("response handling", () => {
    it("should handle 204 No Content", async () => {
      const mockFetch = createMockFetch({ status: 204 });
      const client = new HttpClient({ ...defaultOptions, fetch: mockFetch });

      const result = await client.delete("/servers/1");
      expect(result).toBeUndefined();
    });

    it("should handle plain text responses", async () => {
      const mockFetch = createMockFetch({
        contentType: "text/plain",
        text: "APP_ENV=production\nAPP_DEBUG=false",
      });
      const client = new HttpClient({ ...defaultOptions, fetch: mockFetch });

      const result = await client.get<string>("/servers/1/sites/1/env");
      expect(result).toBe("APP_ENV=production\nAPP_DEBUG=false");
    });
  });
});
