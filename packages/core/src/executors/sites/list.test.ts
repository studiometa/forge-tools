import { describe, expect, it } from "vitest";

import { mockListDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { listSites } from "./list.ts";

const siteAttrs = {
  name: "example.com",
  aliases: [],
  root_directory: "/home/forge/example.com",
  web_directory: "/home/forge/example.com/public",
  wildcards: false,
  status: "installed",
  repository: null,
  quick_deploy: false,
  deployment_status: null,
  deployment_url: "https://example.com/deploy",
  deployment_script: null,
  php_version: "php83",
  app_type: "php",
  url: "https://example.com",
  https: false,
  isolated: false,
  user: "forge",
  database: null,
  shared_paths: null,
  uses_envoyer: false,
  zero_downtime_deployments: false,
  maintenance_mode: null,
  healthcheck_url: null,
  created_at: "2024-01-01T00:00:00.000000Z",
  updated_at: "2024-01-01T00:00:00.000000Z",
};

describe("listSites", () => {
  it("should list sites and format output", async () => {
    const getMock = async () =>
      mockListDocument("sites", [
        { id: 1, attributes: { ...siteAttrs, name: "example.com" } },
        { id: 2, attributes: { ...siteAttrs, name: "api.example.com" } },
      ]);

    const ctx = createTestExecutorContext({
      client: { get: getMock } as never,
      organizationSlug: "test-org",
    });

    const result = await listSites({ server_id: "123" }, ctx);

    expect(result.data).toHaveLength(2);
  });

  it("should handle empty site list", async () => {
    const ctx = createTestExecutorContext({
      client: {
        get: async () => mockListDocument("sites", []),
      } as never,
      organizationSlug: "test-org",
    });

    const result = await listSites({ server_id: "123" }, ctx);

    expect(result.data).toHaveLength(0);
  });
});
