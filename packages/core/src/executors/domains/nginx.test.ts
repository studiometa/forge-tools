import { describe, expect, it, vi } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { mockDocument } from "../../test-helpers.ts";
import { getDomainNginxConfig } from "./nginx.ts";

describe("getDomainNginxConfig", () => {
  it("gets the Nginx configuration of a domain", async () => {
    const get = vi.fn(async () =>
      mockDocument(1, "nginxConfigurations", { content: "server_name .example.com;" }),
    );
    const ctx = createTestExecutorContext({
      client: { get } as never,
      organizationSlug: "test-org",
    });

    const result = await getDomainNginxConfig(
      { server_id: "1", site_id: "2", domain_id: "3" },
      ctx,
    );

    expect(result.data).toBe("server_name .example.com;");
    expect(get).toHaveBeenCalledWith("/orgs/test-org/servers/1/sites/2/domains/3/nginx");
  });
});

describe("getDomainNginxConfig on an older site", () => {
  it("gives an empty content when the domain has no Nginx file", async () => {
    const ctx = createTestExecutorContext({
      client: { get: async () => mockDocument(1, "nginxConfigurations", { content: "" }) } as never,
      organizationSlug: "test-org",
    });
    const result = await getDomainNginxConfig(
      { server_id: "1", site_id: "2", domain_id: "3" },
      ctx,
    );
    expect(result.data).toBe("");
  });

  it("gives an empty content when Forge sends no content", async () => {
    const ctx = createTestExecutorContext({
      client: {
        get: async () => mockDocument(1, "nginxConfigurations", { content: null }),
      } as never,
      organizationSlug: "test-org",
    });
    const result = await getDomainNginxConfig(
      { server_id: "1", site_id: "2", domain_id: "3" },
      ctx,
    );
    expect(result.data).toBe("");
  });
});
