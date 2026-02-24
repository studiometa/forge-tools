import { describe, expect, it } from "vitest";

import { Forge } from "./forge.ts";
import { createMockFetch } from "./test-utils.ts";

describe("createMockFetch", () => {
  it("should return a function", () => {
    const mockFetch = createMockFetch(() => ({}));
    expect(typeof mockFetch).toBe("function");
  });

  it("should call the handler with a string URL", async () => {
    let capturedUrl: string | undefined;
    const mockFetch = createMockFetch((url) => {
      capturedUrl = url;
      return { servers: [] };
    });
    await mockFetch("https://example.com/api/v1/servers", undefined);
    expect(capturedUrl).toBe("https://example.com/api/v1/servers");
  });

  it("should call the handler with a URL object coerced to string", async () => {
    let capturedUrl: string | undefined;
    const mockFetch = createMockFetch((url) => {
      capturedUrl = url;
      return {};
    });
    await mockFetch(new URL("https://example.com/api/v1/servers"), undefined);
    expect(capturedUrl).toBe("https://example.com/api/v1/servers");
  });

  it("should call the handler with a Request object's URL", async () => {
    let capturedUrl: string | undefined;
    const mockFetch = createMockFetch((url) => {
      capturedUrl = url;
      return {};
    });
    const request = new Request("https://example.com/api/v1/servers");
    await mockFetch(request, undefined);
    expect(capturedUrl).toBe("https://example.com/api/v1/servers");
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
    const data = { servers: [{ id: 1, name: "web-01" }] };
    const mockFetch = createMockFetch(() => data);
    const response = await mockFetch("https://example.com/api/v1/servers", undefined);
    expect(response).toBeInstanceOf(Response);
    const json = await response.json();
    expect(json).toEqual(data);
  });

  it("should return a Response with status 200", async () => {
    const mockFetch = createMockFetch(() => ({}));
    const response = await mockFetch("https://example.com/api", undefined);
    expect(response.status).toBe(200);
  });

  it("should return a Response with application/json content type", async () => {
    const mockFetch = createMockFetch(() => ({}));
    const response = await mockFetch("https://example.com/api", undefined);
    expect(response.headers.get("Content-Type")).toBe("application/json");
  });

  it("should work with Forge SDK for listing resources", async () => {
    const mockServers = { servers: [{ id: 1, name: "web-01" }] };
    const mockFetch = createMockFetch(() => mockServers);
    const forge = new Forge("test-token", { fetch: mockFetch });
    const servers = await forge.servers.list();
    expect(servers).toEqual(mockServers.servers);
  });
});
