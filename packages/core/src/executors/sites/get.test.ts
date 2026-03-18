import { describe, expect, it } from "vitest";

import { mockDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { getSite } from "./get.ts";

describe("getSite", () => {
  it("should get a site and format output", async () => {
    const getMock = async () =>
      mockDocument(456, "sites", {
        name: "example.com",
        aliases: [],
        root_directory: "/home/forge/example.com",
        web_directory: "/home/forge/example.com/public",
        wildcards: false,
        status: "installed",
        repository: "user/repo",
        quick_deploy: true,
        deployment_status: null,
        deployment_url: "https://example.com/deploy",
        deployment_script: null,
        php_version: "php83",
        app_type: null,
        url: "https://example.com",
        https: false,
        isolated: false,
        user: null,
        database: null,
        shared_paths: [],
        uses_envoyer: false,
        zero_downtime_deployments: false,
        maintenance_mode: false,
        healthcheck_url: null,
        created_at: "2024-01-01T00:00:00.000000Z",
        updated_at: "2024-01-01T00:00:00.000000Z",
      });

    const ctx = createTestExecutorContext({
      client: { get: getMock } as never,
      organizationSlug: "test-org",
    });

    const result = await getSite({ server_id: "123", site_id: "456" }, ctx);

    expect(result.data.name).toBe("example.com");
  });

  it("should show none for null fields and disabled quick deploy", async () => {
    const getMock = async () =>
      mockDocument(789, "sites", {
        name: "test.com",
        aliases: [],
        root_directory: "/home/forge/test.com",
        web_directory: "/home/forge/test.com/public",
        wildcards: false,
        status: "installed",
        repository: null,
        quick_deploy: false,
        deployment_status: null,
        deployment_url: "https://test.com/deploy",
        deployment_script: null,
        php_version: "php84",
        app_type: null,
        url: "https://test.com",
        https: false,
        isolated: false,
        user: null,
        database: null,
        shared_paths: [],
        uses_envoyer: false,
        zero_downtime_deployments: false,
        maintenance_mode: false,
        healthcheck_url: null,
        created_at: "2024-02-01T00:00:00.000000Z",
        updated_at: "2024-02-01T00:00:00.000000Z",
      });

    const ctx = createTestExecutorContext({
      client: { get: getMock } as never,
      organizationSlug: "test-org",
    });

    await getSite({ server_id: "123", site_id: "789" }, ctx);
  });
});
