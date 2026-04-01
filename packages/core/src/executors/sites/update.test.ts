import { describe, expect, it } from "vitest";

import { mockDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { updateSite } from "./update.ts";

describe("updateSite", () => {
  it("should update a site", async () => {
    const ctx = createTestExecutorContext({
      client: {
        put: async () =>
          mockDocument(99, "sites", {
            name: "example.com",
            aliases: [],
            root_directory: "/home/forge/example.com",
            web_directory: "/home/forge/example.com/public",
            wildcards: false,
            status: "installed",
            repository: {
              provider: "github",
              url: "user/repo",
              branch: "main",
              status: "installed",
            },
            quick_deploy: true,
            deployment_status: null,
            deployment_url: "https://example.com/deploy",
            deployment_script: null,
            php_version: "php84",
            app_type: "php",
            url: "https://example.com",
            https: true,
            isolated: false,
            user: "forge",
            database: null,
            shared_paths: null,
            uses_envoyer: false,
            zero_downtime_deployments: false,
            maintenance_mode: null,
            healthcheck_url: null,
            created_at: "2024-01-01T00:00:00.000000Z",
            updated_at: "2024-01-02T00:00:00.000000Z",
          }),
      } as never,
      organizationSlug: "test-org",
    });

    const result = await updateSite(
      { server_id: "123", site_id: "99", php_version: "php84", push_to_deploy: true },
      ctx,
    );

    expect(result.data.id).toBe(99);
    expect(result.data.php_version).toBe("php84");
    expect(result.data.quick_deploy).toBe(true);
  });
});
