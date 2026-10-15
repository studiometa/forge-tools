import { describe, expect, it, vi } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { mockDocument, mockListDocument } from "../../test-helpers.ts";
import { getDomainNginxConfig, updateDomainNginxConfig } from "./domain.ts";

const domains = mockListDocument("domainRecords", [
  {
    id: 6,
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
]);

describe("getDomainNginxConfig", () => {
  it("should get the nginx configuration of a domain by ID", async () => {
    const getMock = vi.fn(async () =>
      mockDocument(1, "nginxConfigs", { content: "server { listen 80; }" }),
    );
    const ctx = createTestExecutorContext({
      client: { get: getMock } as never,
      organizationSlug: "test-org",
    });

    const result = await getDomainNginxConfig({ server_id: "1", site_id: "2", domain: "6" }, ctx);

    expect(getMock).toHaveBeenCalledTimes(1);
    expect(getMock).toHaveBeenCalledWith("/orgs/test-org/servers/1/sites/2/domains/6/nginx");
    expect(result.data).toBe("server { listen 80; }");
  });

  it("should resolve a domain name to its ID", async () => {
    const getMock = vi.fn(async (url: string) =>
      url.endsWith("/domains")
        ? domains
        : mockDocument(1, "nginxConfigs", { content: "server { listen 443; }" }),
    );
    const ctx = createTestExecutorContext({
      client: { get: getMock } as never,
      organizationSlug: "test-org",
    });

    const result = await getDomainNginxConfig(
      { server_id: "1", site_id: "2", domain: "www.example.com" },
      ctx,
    );

    expect(getMock).toHaveBeenLastCalledWith("/orgs/test-org/servers/1/sites/2/domains/6/nginx");
    expect(result.data).toBe("server { listen 443; }");
  });
});

describe("updateDomainNginxConfig", () => {
  it("should send the content as config to the domain nginx endpoint", async () => {
    const putMock = vi.fn(async () => {});
    const ctx = createTestExecutorContext({
      client: { get: async () => domains, put: putMock } as never,
      organizationSlug: "test-org",
    });

    const result = await updateDomainNginxConfig(
      { server_id: "1", site_id: "2", domain: "www.example.com", content: "server { }" },
      ctx,
    );

    expect(putMock).toHaveBeenCalledWith("/orgs/test-org/servers/1/sites/2/domains/6/nginx", {
      config: "server { }",
    });
    expect(result.data).toBeUndefined();
  });
});
