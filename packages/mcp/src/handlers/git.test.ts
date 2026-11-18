import { describe, expect, it, vi } from "vitest";

import { mockDocument } from "@studiometa/forge-core";

import type { HandlerContext } from "./types.ts";

import { handleGit } from "./git.ts";

const siteAttrs = {
  name: "example.com",
  aliases: [],
  root_directory: null,
  web_directory: "/public",
  wildcards: false,
  status: "installed",
  repository: { provider: "github", url: "acme/app", branch: "release", status: "installing" },
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
};

describe("handleGit", () => {
  it("should change the repository of a site", async () => {
    const put = vi.fn(async () => mockDocument(2, "sites", siteAttrs));
    const ctx: HandlerContext = {
      executorContext: { organizationSlug: "o", client: { put } as never },
      compact: true,
    };

    const result = await handleGit(
      "update",
      {
        resource: "git",
        action: "update",
        server_id: "1",
        site_id: "2",
        source_control_provider: "github",
        repository: "acme/app",
        branch: "release",
      },
      ctx,
    );

    expect(put).toHaveBeenCalledWith("/orgs/o/servers/1/sites/2/git", {
      source_control_provider: "github",
      repository: "acme/app",
      branch: "release",
    });
    expect(result.content[0].text).toContain("example.com");
  });

  it("should refuse an unknown provider", async () => {
    const result = await handleGit(
      "update",
      {
        resource: "git",
        action: "update",
        server_id: "1",
        site_id: "2",
        source_control_provider: "svn",
        repository: "a",
        branch: "b",
      },
      { executorContext: { organizationSlug: "o", client: {} as never }, compact: true },
    );
    expect(result.isError).toBe(true);
  });
});
