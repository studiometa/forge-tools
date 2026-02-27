import { describe, expect, it } from "vitest";

import type { HandlerContext } from "./types.ts";
import { handleServerContext, handleSiteContext } from "./context.ts";

function createMockContext(): HandlerContext {
  return {
    executorContext: {
      client: {
        get: async (url: string) => {
          // Server sub-resources
          if (url.match(/\/servers\/\d+\/sites$/)) return { sites: [{ id: 1, name: "app.com" }] };
          if (url.match(/\/servers\/\d+\/databases$/))
            return { databases: [{ id: 1, name: "mydb" }] };
          if (url.match(/\/servers\/\d+\/database-users$/))
            return { users: [{ id: 1, name: "forge" }] };
          if (url.match(/\/servers\/\d+\/daemons$/)) return { daemons: [] };
          if (url.match(/\/servers\/\d+\/firewall-rules$/)) return { rules: [] };
          if (url.match(/\/servers\/\d+\/jobs$/)) return { jobs: [] };
          // Site sub-resources (must come before server get)
          if (url.match(/\/servers\/\d+\/sites\/\d+\/deployments$/)) {
            return {
              deployments: Array.from({ length: 8 }, (_, i) => ({ id: i + 1 })),
            };
          }
          if (url.match(/\/servers\/\d+\/sites\/\d+\/certificates$/)) return { certificates: [] };
          if (url.match(/\/servers\/\d+\/sites\/\d+\/redirect-rules$/))
            return { redirect_rules: [] };
          if (url.match(/\/servers\/\d+\/sites\/\d+\/security-rules$/))
            return { security_rules: [] };
          // Site get (must come before server get)
          if (url.match(/\/servers\/\d+\/sites\/\d+$/))
            return { site: { id: 1, name: "app.com", server_id: 1 } };
          // Server get
          if (url.match(/\/servers\/\d+$/)) return { server: { id: 1, name: "web-1" } };
          return {};
        },
      } as never,
    },
    compact: false,
  };
}

describe("handleServerContext", () => {
  it("returns server plus all sub-resources", async () => {
    const result = await handleServerContext(
      { resource: "servers", action: "context", id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    const data = JSON.parse(result.content[0]!.text);
    expect(data.server).toBeDefined();
    expect(data.server.name).toBe("web-1");
    expect(data.sites).toBeDefined();
    expect(Array.isArray(data.sites)).toBe(true);
    expect(data.databases).toBeDefined();
    expect(data.database_users).toBeDefined();
    expect(data.daemons).toBeDefined();
    expect(data.firewall_rules).toBeDefined();
    expect(data.scheduled_jobs).toBeDefined();
  });

  it("returns error when id is missing", async () => {
    const result = await handleServerContext(
      { resource: "servers", action: "context" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("id");
  });

  it("includes structured content on success", async () => {
    const result = await handleServerContext(
      { resource: "servers", action: "context", id: "42" },
      createMockContext(),
    );
    expect(result.structuredContent).toBeDefined();
    expect(result.structuredContent?.success).toBe(true);
  });
});

describe("handleSiteContext", () => {
  it("returns site plus all sub-resources", async () => {
    const result = await handleSiteContext(
      { resource: "sites", action: "context", server_id: "1", id: "2" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    const data = JSON.parse(result.content[0]!.text);
    expect(data.site).toBeDefined();
    expect(data.site.name).toBe("app.com");
    expect(data.deployments).toBeDefined();
    expect(data.certificates).toBeDefined();
    expect(data.redirect_rules).toBeDefined();
    expect(data.security_rules).toBeDefined();
  });

  it("limits deployments to last 5", async () => {
    const result = await handleSiteContext(
      { resource: "sites", action: "context", server_id: "1", id: "2" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    const data = JSON.parse(result.content[0]!.text);
    expect(data.deployments).toHaveLength(5);
  });

  it("returns error when server_id is missing", async () => {
    const result = await handleSiteContext(
      { resource: "sites", action: "context", id: "2" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("server_id");
  });

  it("returns error when id is missing", async () => {
    const result = await handleSiteContext(
      { resource: "sites", action: "context", server_id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("id");
  });

  it("includes structured content on success", async () => {
    const result = await handleSiteContext(
      { resource: "sites", action: "context", server_id: "1", id: "2" },
      createMockContext(),
    );
    expect(result.structuredContent).toBeDefined();
    expect(result.structuredContent?.success).toBe(true);
  });
});
