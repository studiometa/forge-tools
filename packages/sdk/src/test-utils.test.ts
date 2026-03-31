import { describe, expect, it } from "vitest";

import { Forge } from "./forge.ts";
import { createMockFetch } from "./test-utils.ts";

function mockListDocument<T>(
  items: Array<{ id: string; attributes: T }>,
  nextCursor: string | null = null,
) {
  return {
    data: items.map(({ id, attributes }) => ({ id, type: "resource", attributes })),
    links: {},
    meta: { per_page: 200, next_cursor: nextCursor },
  };
}

describe("createMockFetch", () => {
  it("should return a function", () => {
    const mockFetch = createMockFetch(() => ({}));
    expect(typeof mockFetch).toBe("function");
  });

  it("should call the handler with a string URL", async () => {
    let capturedUrl: string | undefined;
    const mockFetch = createMockFetch((url) => {
      capturedUrl = url;
      return mockListDocument([]);
    });
    await mockFetch("https://example.com/api/v2/orgs/test-org/servers");
    expect(capturedUrl).toBe("https://example.com/api/v2/orgs/test-org/servers");
  });

  it("should call the handler with a URL object coerced to string", async () => {
    let capturedUrl: string | undefined;
    const mockFetch = createMockFetch((url) => {
      capturedUrl = url;
      return {};
    });
    await mockFetch(new URL("https://example.com/api/v2/orgs/test-org/servers"));
    expect(capturedUrl).toBe("https://example.com/api/v2/orgs/test-org/servers");
  });

  it("should call the handler with a Request object's URL", async () => {
    let capturedUrl: string | undefined;
    const mockFetch = createMockFetch((url) => {
      capturedUrl = url;
      return {};
    });
    const request = new Request("https://example.com/api/v2/orgs/test-org/servers");
    await mockFetch(request);
    expect(capturedUrl).toBe("https://example.com/api/v2/orgs/test-org/servers");
  });

  it("should pass init to the handler", async () => {
    let capturedInit: RequestInit | undefined;
    const mockFetch = createMockFetch((_, init) => {
      capturedInit = init;
      return {};
    });
    const init: RequestInit = { method: "POST", body: JSON.stringify({ test: true }) };
    await mockFetch("https://example.com/api", init);
    expect(capturedInit).toBe(init);
  });

  it("should return a Response with JSON body", async () => {
    const data = mockListDocument([{ id: "1", attributes: { name: "web-01" } }]);
    const mockFetch = createMockFetch(() => data);
    const response = await mockFetch("https://example.com/api/v2/orgs/test-org/servers");
    expect(response).toBeInstanceOf(Response);
    const json = await response.json();
    expect(json).toEqual(data);
  });

  it("should return a Response with status 200", async () => {
    const mockFetch = createMockFetch(() => ({}));
    const response = await mockFetch("https://example.com/api");
    expect(response.status).toBe(200);
  });

  it("should return a Response with application/json content type", async () => {
    const mockFetch = createMockFetch(() => ({}));
    const response = await mockFetch("https://example.com/api");
    expect(response.headers.get("Content-Type")).toBe("application/json");
  });

  it("should work with Forge SDK for listing resources", async () => {
    const mockServers = mockListDocument([{ id: "1", attributes: { name: "web-01" } }]);
    const mockFetch = createMockFetch(() => mockServers);
    const forge = new Forge("test-token", "test-org", { fetch: mockFetch });
    const servers = await forge.servers.list();
    expect(servers).toHaveLength(1);
    expect(servers[0].name).toBe("web-01");
    expect(servers[0].id).toBe(1);
  });
});
