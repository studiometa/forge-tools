import { describe, expect, it, vi } from "vitest";

import { mockDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { createLoadBalancerSite } from "./create-site.ts";

describe("createLoadBalancerSite", () => {
  it("creates a site on a load balancer", async () => {
    const post = vi.fn(async () =>
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
    );
    const ctx = createTestExecutorContext({ client: { post } as never, organizationSlug: "org" });

    const result = await createLoadBalancerSite(
      {
        server_id: "123",
        domain: "example.com",
        balancer_method: "round_robin",
        balancing: [{ server_id: 789, port: 80, weight: 1, backup: false, down: false }],
      },
      ctx,
    );

    expect(post).toHaveBeenCalledWith("/orgs/org/servers/123/sites/balancer", {
      domain: "example.com",
      balancer_method: "round_robin",
      balancing: [{ server_id: 789, port: 80, weight: 1, backup: false, down: false }],
    });
    expect(result.data).toMatchObject({ id: 99, name: "example.com", status: "installing" });
  });
});
