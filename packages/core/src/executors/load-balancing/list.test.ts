import { describe, expect, it, vi } from "vitest";

import { mockListDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { listLoadBalancingNodes } from "./list.ts";

describe("listLoadBalancingNodes", () => {
  it("lists the nodes of a site", async () => {
    const get = vi.fn(async () =>
      mockListDocument("loadBalancingNodes", [
        {
          id: 789,
          attributes: { server_id: 789, port: 80, weight: 1, backup: false, down: false },
        },
      ]),
    );
    const ctx = createTestExecutorContext({ client: { get } as never, organizationSlug: "org" });

    const result = await listLoadBalancingNodes({ server_id: "123", site_id: "456" }, ctx);

    expect(get).toHaveBeenCalledWith("/orgs/org/servers/123/sites/456/load-balancing-nodes");
    expect(result.data).toEqual([
      { id: 789, server_id: 789, port: 80, weight: 1, backup: false, down: false },
    ]);
  });
});
