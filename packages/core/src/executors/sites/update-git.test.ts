import { describe, expect, it, vi } from "vitest";

import { mockDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { updateSiteGit } from "./update-git.ts";

describe("updateSiteGit", () => {
  it("should send the new repository and return the site", async () => {
    const put = vi.fn(async () =>
      mockDocument(99, "sites", {
        name: "example.com",
        aliases: [],
        root_directory: null,
        web_directory: "/public",
        wildcards: false,
        status: "installed",
        repository: { provider: "github", url: "acme/app", branch: "main", status: "installing" },
        quick_deploy: false,
        deployment_status: null,
        deployment_url: null,
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
        created_at: null,
        updated_at: null,
      }),
    );
    const ctx = createTestExecutorContext({ client: { put } as never, organizationSlug: "o" });

    const result = await updateSiteGit(
      {
        server_id: "1",
        site_id: "99",
        source_control_provider: "github",
        repository: "acme/app",
        branch: "main",
      },
      ctx,
    );

    expect(put).toHaveBeenCalledWith("/orgs/o/servers/1/sites/99/git", {
      source_control_provider: "github",
      repository: "acme/app",
      branch: "main",
    });
    expect(result.data.repository?.url).toBe("acme/app");
  });
});
