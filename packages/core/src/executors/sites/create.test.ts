import { describe, expect, it } from "vitest";

import { mockDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { createSite } from "./create.ts";

describe("createSite", () => {
  it("should create a site", async () => {
    const ctx = createTestExecutorContext({
      client: {
        post: async () =>
          mockDocument(99, "sites", {
            name: "example.com",
            aliases: [],
            root_directory: "/home/forge/example.com",
            web_directory: "/home/forge/example.com/public",
            wildcards: false,
            status: "installing",
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
          }),
      } as never,
      organizationSlug: "test-org",
    });

    const result = await createSite(
      { server_id: "123", domain: "example.com", project_type: "php" },
      ctx,
    );

    expect(result.data.name).toBe("example.com");
  });
});
