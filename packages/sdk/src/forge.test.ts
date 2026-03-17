import { describe, expect, it } from "vitest";

import { Forge } from "./forge.ts";
import { ServersCollection, ServerResource } from "./resources/servers.ts";
import { RecipesCollection } from "./resources/recipes.ts";

function mockJsonApiDocument<T>(id: string, attributes: T) {
  return {
    data: {
      id,
      type: "resource",
      attributes,
    },
  };
}

function createMockFetch(body: unknown = {}): typeof globalThis.fetch {
  return async () =>
    ({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => body,
      text: async () => JSON.stringify(body),
    }) as Response;
}

describe("Forge", () => {
  it("should create an instance with a token and org slug", () => {
    const forge = new Forge("test-token", "test-org", { fetch: createMockFetch() });
    expect(forge).toBeInstanceOf(Forge);
    expect(forge.organizationSlug).toBe("test-org");
  });

  it("should expose servers collection", () => {
    const forge = new Forge("test-token", "test-org", { fetch: createMockFetch() });
    expect(forge.servers).toBeInstanceOf(ServersCollection);
  });

  it("should expose recipes collection", () => {
    const forge = new Forge("test-token", "test-org", { fetch: createMockFetch() });
    expect(forge.recipes).toBeInstanceOf(RecipesCollection);
  });

  describe("server()", () => {
    it("should return a ServerResource", () => {
      const forge = new Forge("test-token", "test-org", { fetch: createMockFetch() });
      const server = forge.server(123);
      expect(server).toBeInstanceOf(ServerResource);
    });
  });

  describe("user()", () => {
    it("should return the authenticated user", async () => {
      const mockUser = mockJsonApiDocument("1", {
        name: "Test User",
        email: "test@example.com",
        two_factor_enabled: false,
        two_factor_confirmed: false,
        github_connected: false,
        gitlab_connected: false,
        bitbucket_connected: false,
        do_connected: false,
        timezone: "UTC",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      });
      const forge = new Forge("test-token", "test-org", { fetch: createMockFetch(mockUser) });

      const user = await forge.user();
      expect(user.name).toBe("Test User");
      expect(user.email).toBe("test@example.com");
    });
  });
});
