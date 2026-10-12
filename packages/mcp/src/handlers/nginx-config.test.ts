import { describe, expect, it, vi } from "vitest";

import type { HandlerContext } from "./types.ts";

import { handleNginxConfig } from "./nginx-config.ts";

const domains = {
  data: [
    {
      id: "6",
      type: "domainRecords",
      attributes: {
        name: "www.example.com",
        type: "alias",
        status: "enabled",
        www_redirect_type: "none",
        allow_wildcard_subdomains: false,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
    },
  ],
  links: { next: null, prev: null },
  meta: { per_page: 30, next_cursor: null, prev_cursor: null },
};

function createMockContext() {
  const get = vi.fn(async (url: string) =>
    url.endsWith("/domains")
      ? domains
      : {
          data: {
            id: "1",
            type: "nginx-configs",
            attributes: { content: "server { listen 80; }" },
          },
        },
  );
  const put = vi.fn(async () => ({}));
  const ctx: HandlerContext = {
    executorContext: {
      organizationSlug: "test-org",
      client: { get, put } as never,
    },
    compact: true,
  };
  return { ctx, get, put };
}

describe("handleNginxConfig", () => {
  it("should get nginx config", async () => {
    const { ctx, get } = createMockContext();
    const result = await handleNginxConfig(
      "get",
      { resource: "nginx", action: "get", server_id: "1", site_id: "2" },
      ctx,
    );
    expect(result.isError).toBeUndefined();
    expect(get).toHaveBeenCalledWith("/orgs/test-org/servers/1/sites/2/nginx");
  });

  it("should update nginx config", async () => {
    const { ctx, put } = createMockContext();
    const result = await handleNginxConfig(
      "update",
      {
        resource: "nginx",
        action: "update",
        server_id: "1",
        site_id: "2",
        content: "server { listen 443; }",
      },
      ctx,
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("Nginx configuration updated.");
    expect(put).toHaveBeenCalledWith("/orgs/test-org/servers/1/sites/2/nginx", {
      content: "server { listen 443; }",
    });
  });

  it("should get the nginx config of a domain given by name", async () => {
    const { ctx, get } = createMockContext();
    const result = await handleNginxConfig(
      "get",
      {
        resource: "nginx",
        action: "get",
        server_id: "1",
        site_id: "2",
        domain_id: "www.example.com",
      },
      ctx,
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("listen 80");
    expect(get).toHaveBeenLastCalledWith("/orgs/test-org/servers/1/sites/2/domains/6/nginx");
  });

  it("should update the nginx config of a domain", async () => {
    const { ctx, put } = createMockContext();
    const result = await handleNginxConfig(
      "update",
      {
        resource: "nginx",
        action: "update",
        server_id: "1",
        site_id: "2",
        domain_id: "6",
        content: "server { listen 443; }",
      },
      ctx,
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("Nginx configuration for domain 6 updated.");
    expect(put).toHaveBeenCalledWith("/orgs/test-org/servers/1/sites/2/domains/6/nginx", {
      config: "server { listen 443; }",
    });
  });

  it("should handle unknown action", async () => {
    const { ctx } = createMockContext();
    const result = await handleNginxConfig(
      "unknown",
      { resource: "nginx", action: "unknown", server_id: "1", site_id: "2" },
      ctx,
    );
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Unknown action");
  });
});
