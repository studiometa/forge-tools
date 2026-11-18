import { describe, expect, it } from "vitest";

import { node, site } from "../../sites/apply/test-fixtures.ts";
import { type RemoteState, buildPlan, describeChange, describeNode, sameNodes } from "./plan.ts";
import { TARGET, balancerFile } from "./test-fixtures.ts";

function state(overrides: Partial<RemoteState> = {}): RemoteState {
  return {
    serverId: "300",
    site: site(600, "example.com"),
    nodes: [node(123), node(124, { weight: 2 })],
    domains: ["example.com", "www.example.com"],
    target: TARGET,
    ...overrides,
  };
}

describe("buildPlan", () => {
  it("plans nothing when Forge matches the file", () => {
    expect(buildPlan(balancerFile(), state()).changes).toEqual([]);
    expect(
      buildPlan(balancerFile(), state({ nodes: [node(124, { weight: 2 }), node(123)] })).changes,
    ).toEqual([]);
  });

  it("creates a missing site, then adds its aliases", () => {
    const plan = buildPlan(
      balancerFile({ method: "least_conn", wildcards: true }),
      state({ site: null, nodes: [], domains: [] }),
    );
    expect(plan.changes).toEqual([
      {
        action: "create-load-balancer-site",
        domain: "www.example.com",
        method: "least_conn",
        wildcards: true,
        nodes: TARGET,
      },
      { action: "add-alias", name: "example.com" },
    ]);
  });

  it("replaces nodes that differ", () => {
    for (const nodes of [
      [node(123)],
      [node(123), node(124)],
      [node(123), node(124, { weight: 2, port: 8080 })],
      [node(123), node(124, { weight: 2, backup: true })],
      [node(123, { down: true }), node(124, { weight: 2 })],
    ]) {
      expect(buildPlan(balancerFile(), state({ nodes })).changes).toEqual([
        {
          action: "update-load-balancer-nodes",
          site: "example.com",
          method: "round_robin",
          from: nodes.map(({ id: _, ...rest }) => rest),
          to: TARGET,
        },
      ]);
    }
  });

  it("adds the domain and the aliases that the site does not have, without case", () => {
    expect(
      buildPlan(
        balancerFile({ aliases: ["example.com", "example.org"] }),
        state({ domains: ["EXAMPLE.com"] }),
      ).changes,
    ).toEqual([
      { action: "add-alias", name: "www.example.com" },
      { action: "add-alias", name: "example.org" },
    ]);
  });
});

describe("sameNodes", () => {
  it("compares nodes in any order", () => {
    expect(sameNodes(TARGET, [...TARGET].toReversed())).toBe(true);
    expect(sameNodes(TARGET, [TARGET[0], TARGET[0]])).toBe(false);
    expect(sameNodes(TARGET, [TARGET[0]])).toBe(false);
  });
});

describe("describeChange", () => {
  it("describes each change", () => {
    expect(describeNode({ server_id: 1, port: 80, weight: 3, backup: true, down: true })).toBe(
      "server 1:80 weight 3 backup down",
    );
    expect(
      describeChange({
        action: "create-load-balancer-site",
        domain: "www.example.com",
        method: "round_robin",
        wildcards: true,
        nodes: TARGET,
      }),
    ).toBe(
      "+ create load balancer site www.example.com (method: round_robin, wildcards): server 123:80, server 124:80 weight 2",
    );
    expect(
      describeChange({
        action: "create-load-balancer-site",
        domain: "www.example.com",
        method: "ip_hash",
        wildcards: false,
        nodes: [TARGET[0]],
      }),
    ).toBe("+ create load balancer site www.example.com (method: ip_hash): server 123:80");
    expect(
      describeChange({
        action: "update-load-balancer-nodes",
        site: "example.com",
        method: "round_robin",
        from: [],
        to: TARGET,
      }),
    ).toBe(
      "~ update load balancer nodes of example.com (method: round_robin): (none) → server 123:80, server 124:80 weight 2",
    );
    expect(describeChange({ action: "add-alias", name: "example.com" })).toBe(
      "+ add alias example.com",
    );
  });
});
