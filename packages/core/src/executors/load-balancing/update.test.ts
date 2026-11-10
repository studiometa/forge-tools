import { describe, expect, it, vi } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { updateLoadBalancingNodes } from "./update.ts";

describe("updateLoadBalancingNodes", () => {
  it("replaces the nodes of a site", async () => {
    const put = vi.fn(async () => {});
    const ctx = createTestExecutorContext({ client: { put } as never, organizationSlug: "org" });

    const result = await updateLoadBalancingNodes(
      {
        server_id: "123",
        site_id: "456",
        balancer_method: "round_robin",
        balancing: [{ server_id: 789, port: 80, weight: 1 }],
      },
      ctx,
    );

    expect(put).toHaveBeenCalledWith("/orgs/org/servers/123/sites/456/load-balancing-nodes", {
      balancer_method: "round_robin",
      balancing: [{ server_id: 789, port: 80, weight: 1 }],
    });
    expect(result.data).toBeUndefined();
  });
});
