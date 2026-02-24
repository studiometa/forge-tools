import { describe, expect, it } from "vitest";

import { Forge } from "./forge.ts";
import { ServersCollection, ServerResource } from "./resources/servers.ts";
import { RecipesCollection } from "./resources/recipes.ts";

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
  it("should create an instance with a token", () => {
    const forge = new Forge("test-token", { fetch: createMockFetch() });
    expect(forge).toBeInstanceOf(Forge);
  });

  it("should expose servers collection", () => {
    const forge = new Forge("test-token", { fetch: createMockFetch() });
    expect(forge.servers).toBeInstanceOf(ServersCollection);
  });

  it("should expose recipes collection", () => {
    const forge = new Forge("test-token", { fetch: createMockFetch() });
    expect(forge.recipes).toBeInstanceOf(RecipesCollection);
  });

  describe("server()", () => {
    it("should return a ServerResource", () => {
      const forge = new Forge("test-token", { fetch: createMockFetch() });
      const server = forge.server(123);
      expect(server).toBeInstanceOf(ServerResource);
    });
  });

  describe("user()", () => {
    it("should return the authenticated user", async () => {
      const mockUser = {
        user: {
          id: 1,
          name: "Test User",
          email: "test@example.com",
        },
      };
      const forge = new Forge("test-token", { fetch: createMockFetch(mockUser) });

      const user = await forge.user();
      expect(user.name).toBe("Test User");
      expect(user.email).toBe("test@example.com");
    });
  });
});
