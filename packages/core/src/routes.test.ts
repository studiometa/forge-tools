import { describe, expect, it } from "vitest";
import * as v from "valibot";

import { ROUTES, buildUrl, request, flattenRoutes } from "./routes.ts";
import { createTestExecutorContext } from "./context.ts";

describe("buildUrl", () => {
  const ctx = createTestExecutorContext({ organizationSlug: "test-org" });

  it("should resolve all params correctly", () => {
    const url = buildUrl(ROUTES.databases.get, ctx, { server_id: "42", id: "7" });
    expect(url).toBe("/orgs/test-org/servers/42/database/schemas/7");
  });

  it("should auto-inject :org from context", () => {
    const url = buildUrl(ROUTES.servers.list, ctx);
    expect(url).toBe("/orgs/test-org/servers");
  });

  it("should throw on missing required params", () => {
    expect(() => buildUrl(ROUTES.databases.get, ctx, { server_id: "42" })).toThrow(
      "Missing route params: id",
    );
  });

  it("should throw on missing org when context has none", () => {
    const noOrgCtx = createTestExecutorContext({});
    expect(() => buildUrl(ROUTES.servers.list, noOrgCtx)).toThrow("Missing route params: org");
  });

  it("should append query string when provided", () => {
    const url = buildUrl(ROUTES.servers.list, ctx, {}, { page: "2", size: "10" });
    expect(url).toContain("?");
    expect(url).toContain("page=2");
    expect(url).toContain("size=10");
  });

  it("should handle the user route (no org prefix)", () => {
    const noOrgCtx = createTestExecutorContext({});
    const url = buildUrl(ROUTES.user.get, noOrgCtx);
    expect(url).toBe("/user");
  });

  it("should resolve certificate routes with domain_id", () => {
    const url = buildUrl(ROUTES.certificates.get, ctx, {
      server_id: "1",
      site_id: "2",
      domain_id: "3",
    });
    expect(url).toBe("/orgs/test-org/servers/1/sites/2/domains/3/certificate");
  });
});

describe("request", () => {
  it("should dispatch GET for GET routes", async () => {
    let calledPath = "";
    const ctx = createTestExecutorContext({
      client: {
        get: async (path: string) => {
          calledPath = path;
          return { data: [] };
        },
      } as never,
      organizationSlug: "test-org",
    });

    await request(ROUTES.servers.list, ctx);
    expect(calledPath).toBe("/orgs/test-org/servers");
  });

  it("should dispatch POST with body for POST routes", async () => {
    let calledPath = "";
    let calledBody: unknown;
    const ctx = createTestExecutorContext({
      client: {
        post: async (path: string, body: unknown) => {
          calledPath = path;
          calledBody = body;
          return { data: {} };
        },
      } as never,
      organizationSlug: "test-org",
    });

    await request(ROUTES.servers.create, ctx, {}, { body: { name: "web-1" } });
    expect(calledPath).toBe("/orgs/test-org/servers");
    expect(calledBody).toEqual({ name: "web-1" });
  });

  it("should dispatch PUT for PUT routes", async () => {
    let calledMethod = "";
    const ctx = createTestExecutorContext({
      client: {
        put: async () => {
          calledMethod = "PUT";
          return {};
        },
      } as never,
      organizationSlug: "test-org",
    });

    await request(
      ROUTES.env.update,
      ctx,
      { server_id: "1", site_id: "2" },
      { body: { content: "FOO=bar" } },
    );
    expect(calledMethod).toBe("PUT");
  });

  it("should dispatch DELETE for DELETE routes", async () => {
    let calledMethod = "";
    const ctx = createTestExecutorContext({
      client: {
        delete: async () => {
          calledMethod = "DELETE";
        },
      } as never,
      organizationSlug: "test-org",
    });

    await request(ROUTES.servers.delete, ctx, { server_id: "1" });
    expect(calledMethod).toBe("DELETE");
  });

  it("should validate response through schema when provided", async () => {
    const schema = v.object({ value: v.number() });
    const ctx = createTestExecutorContext({
      client: {
        get: async () => ({ value: 42 }),
      } as never,
      organizationSlug: "test-org",
    });

    const result = await request<{ value: number }>(ROUTES.user.get, ctx, {}, { schema });
    expect(result.value).toBe(42);
  });

  it("should throw ValiError on schema mismatch", async () => {
    const schema = v.object({ value: v.number() });
    const ctx = createTestExecutorContext({
      client: {
        get: async () => ({ value: "not-a-number" }),
      } as never,
      organizationSlug: "test-org",
    });

    await expect(request(ROUTES.user.get, ctx, {}, { schema })).rejects.toThrow();
  });

  it("should return unvalidated response when no schema provided", async () => {
    const ctx = createTestExecutorContext({
      client: {
        get: async () => ({ anything: "goes" }),
      } as never,
      organizationSlug: "test-org",
    });

    const result = await request<{ anything: string }>(ROUTES.user.get, ctx);
    expect(result.anything).toBe("goes");
  });
});

describe("flattenRoutes", () => {
  it("should return all routes as a flat array", () => {
    const flat = flattenRoutes(ROUTES);
    expect(flat.length).toBeGreaterThan(50);
    expect(flat[0]!.key).toContain(".");
    expect(flat[0]!.route).toHaveProperty("method");
    expect(flat[0]!.route).toHaveProperty("path");
  });

  it("should include known routes", () => {
    const flat = flattenRoutes(ROUTES);
    const keys = flat.map((r) => r.key);
    expect(keys).toContain("servers.list");
    expect(keys).toContain("databases.create");
    expect(keys).toContain("user.get");
  });
});
