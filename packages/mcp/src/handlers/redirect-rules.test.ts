import { describe, expect, it, vi } from "vitest";

import { mockDocument, mockListDocument } from "@studiometa/forge-core";

import type { HandlerContext } from "./types.ts";

import { handleRedirectRules } from "./redirect-rules.ts";

function makeRuleAttrs(overrides: Record<string, unknown> = {}) {
  return {
    from: "/old",
    to: "/new",
    type: "301",
    status: "active",
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
    ...overrides,
  };
}

function createMockContext(): HandlerContext {
  return {
    executorContext: {
      organizationSlug: "test-org",
      client: {
        get: async (url: string) => {
          if (/\/redirect-rules\/\d+$/.test(url)) {
            return mockDocument(1, "redirect-rules", makeRuleAttrs());
          }
          return mockListDocument("redirect-rules", [
            { id: 1, attributes: makeRuleAttrs() as never },
          ]);
        },
        post: async () => {},
        delete: async () => {},
      } as never,
    },
    compact: true,
  };
}

describe("handleRedirectRules", () => {
  it("should list redirect rules", async () => {
    const result = await handleRedirectRules(
      "list",
      { resource: "redirect-rules", action: "list", server_id: "1", site_id: "10" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("/old");
  });

  it("should get a redirect rule", async () => {
    const result = await handleRedirectRules(
      "get",
      { resource: "redirect-rules", action: "get", server_id: "1", site_id: "10", id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("/old");
  });

  it("should create a redirect rule", async () => {
    const result = await handleRedirectRules(
      "create",
      {
        resource: "redirect-rules",
        action: "create",
        server_id: "1",
        site_id: "10",
        from: "/src",
        to: "/dst",
      },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("Done");
  });

  it("should delete a redirect rule", async () => {
    const result = await handleRedirectRules(
      "delete",
      { resource: "redirect-rules", action: "delete", server_id: "1", site_id: "10", id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("deleted");
  });

  it("should require server_id and site_id for list", async () => {
    const result = await handleRedirectRules(
      "list",
      { resource: "redirect-rules", action: "list" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
  });

  it("should handle unknown action", async () => {
    const result = await handleRedirectRules(
      "unknown",
      { resource: "redirect-rules", action: "unknown", server_id: "1", site_id: "10" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
  });
});

describe("handleRedirectRules — export, import, reorder", () => {
  const site = { resource: "redirect-rules", server_id: "1", site_id: "10" };

  function context(client: Record<string, unknown>): HandlerContext {
    return { executorContext: { organizationSlug: "o", client: client as never }, compact: true };
  }

  it("should export the rules as CSV", async () => {
    const get = vi.fn(async () => "from,to,type\n/a,/b,redirect\n");
    const result = await handleRedirectRules(
      "export",
      { ...site, action: "export" },
      context({ get }),
    );
    expect(get).toHaveBeenCalledWith("/orgs/o/servers/1/sites/10/redirect-rules/export");
    expect(result.content[0].text).toBe("from,to,type\n/a,/b,redirect\n");
  });

  it("should import the CSV of content with a mode", async () => {
    const post = vi.fn(async (_url: string, _form: FormData) => ({ imported: 2 }));
    const result = await handleRedirectRules(
      "import",
      { ...site, action: "import", content: "from,to,type\n", mode: "append" },
      context({ post }),
    );
    expect(post.mock.calls[0][0]).toBe("/orgs/o/servers/1/sites/10/redirect-rules/import");
    expect(post.mock.calls[0][1].get("mode")).toBe("append");
    expect(result.content[0].text).toBe("2 redirect rule(s) imported.");
  });

  it("should refuse an unknown import mode", async () => {
    const result = await handleRedirectRules(
      "import",
      { ...site, action: "import", content: "x", mode: "merge" },
      context({}),
    );
    expect(result.isError).toBe(true);
  });

  it("should reorder the rules", async () => {
    const put = vi.fn(async () => {});
    const result = await handleRedirectRules(
      "reorder",
      { ...site, action: "reorder", redirects: [2, 1] },
      context({ put }),
    );
    expect(put).toHaveBeenCalledWith("/orgs/o/servers/1/sites/10/redirect-rules/reorder", {
      redirects: [2, 1],
    });
    expect(result.content[0].text).toBe("Redirect rules of site 10 reordered.");
  });
});
