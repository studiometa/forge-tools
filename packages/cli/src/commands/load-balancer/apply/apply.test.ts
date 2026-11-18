import { describe, expect, it } from "vitest";

import { fakeForge, node, site } from "../../sites/apply/test-fixtures.ts";
import { applyLoadBalancerFile, findLoadBalancerSite, resolveNodes } from "./apply.ts";
import type { Change } from "./plan.ts";
import { TARGET, balancerFile } from "./test-fixtures.ts";

/** Sites of both nodes. */
const nodeSites = {
  sites: [site(456, "www.example.com")],
  otherSites: [site(457, "www.example.com")],
};

function writes(calls: unknown[][]) {
  return calls.filter(([method]) => method !== "GET");
}

describe("findLoadBalancerSite", () => {
  it("matches the domain or an alias without case, and refuses several matches", () => {
    const sites = [site(600, "Example.com"), site(601, "other.example.com")];
    expect(findLoadBalancerSite(sites, ["www.example.com", "example.com"])?.id).toBe(600);
    expect(findLoadBalancerSite(sites, ["new.example.com"])).toBeNull();
    expect(() =>
      findLoadBalancerSite(
        [...sites, site(602, "www.example.com")],
        ["www.example.com", "example.com"],
      ),
    ).toThrow(
      "Several sites of the load balancer match the domain and aliases: Example.com, www.example.com",
    );
  });
});

describe("resolveNodes", () => {
  it("resolves the server of each environment", async () => {
    const { ctx } = fakeForge(nodeSites);
    expect(await resolveNodes(balancerFile(), ctx)).toEqual(TARGET);
  });

  it("lists the sites of a server once", async () => {
    const { ctx, calls } = fakeForge(nodeSites);
    const file = balancerFile();
    file.sites[1].file = { ...file.sites[1].file, server: 123 };
    await resolveNodes(file, ctx);
    expect(calls.filter(([, url]) => String(url).endsWith("/servers/123/sites"))).toHaveLength(1);
  });

  it("refuses an environment whose site does not exist", async () => {
    const { ctx } = fakeForge({ sites: nodeSites.sites });
    await expect(resolveNodes(balancerFile(), ctx)).rejects.toThrow(
      "Site www.example.com of environment production-2 does not exist on server 124",
    );
  });
});

describe("applyLoadBalancerFile", () => {
  it("creates the site, waits for it, then adds the aliases", async () => {
    const { ctx, calls, state } = fakeForge({
      ...nodeSites,
      balancerSites: [site(601, "other.example.com")],
      newSiteStatuses: ["installing", "installed"],
    });
    const changes: Change[] = [];

    const plan = await applyLoadBalancerFile(balancerFile(), "300", ctx, {
      sleep: async () => {},
      onChange: (change) => changes.push(change),
    });

    expect(plan.changes.map((change) => change.action)).toEqual([
      "create-load-balancer-site",
      "add-alias",
    ]);
    expect(changes.map((change) => change.action)).toEqual([
      "create-load-balancer-site",
      "add-alias",
    ]);
    expect(writes(calls)).toEqual([
      [
        "POST",
        "/orgs/org/servers/300/sites/balancer",
        {
          domain: "www.example.com",
          allow_wildcard_subdomains: false,
          balancer_method: "round_robin",
          balancing: TARGET,
        },
      ],
      [
        "POST",
        "/orgs/org/servers/300/sites/900/domains",
        { name: "example.com", allow_wildcard_subdomains: false, www_redirect_type: "none" },
      ],
    ]);
    expect(state.balancerDomains[900]).toEqual(["example.com"]);
  });

  it("fails when the new site is not installed", async () => {
    const { ctx } = fakeForge({ ...nodeSites, newSiteStatuses: ["failed"] });
    await expect(applyLoadBalancerFile(balancerFile(), "300", ctx)).rejects.toThrow(
      "Site www.example.com is still failed on the load balancer",
    );
  });

  it("fails when the new site is not on the load balancer after its creation", async () => {
    const { ctx, client, state } = fakeForge(nodeSites);
    const post = client.post.getMockImplementation()!;
    client.post.mockImplementation(async (url: string, body: Record<string, unknown>) => {
      const created = await post(url, body);
      state.balancerSites[0].name = "renamed.example.com";
      return created;
    });
    await expect(applyLoadBalancerFile(balancerFile(), "300", ctx)).rejects.toThrow(
      "Site www.example.com is not on the load balancer after its creation",
    );
  });

  it("replaces the nodes of a site that the alias names", async () => {
    const { ctx, calls } = fakeForge({
      ...nodeSites,
      balancerSites: [site(600, "example.com")],
      balancerDomains: { 600: ["www.example.com"] },
      nodes: { 600: [node(122)] },
    });

    const plan = await applyLoadBalancerFile(balancerFile({ method: "least_conn" }), "300", ctx);

    expect(plan.changes.map((change) => change.action)).toEqual(["update-load-balancer-nodes"]);
    expect(writes(calls)).toEqual([
      [
        "PUT",
        "/orgs/org/servers/300/sites/600/load-balancing-nodes",
        { balancer_method: "least_conn", balancing: TARGET },
      ],
    ]);
  });

  it("changes nothing when Forge matches", async () => {
    const { ctx, calls } = fakeForge({
      ...nodeSites,
      balancerSites: [site(600, "www.example.com")],
      balancerDomains: { 600: ["example.com"] },
      nodes: { 600: [node(123), node(124, { weight: 2 })] },
    });
    expect((await applyLoadBalancerFile(balancerFile(), "300", ctx)).changes).toEqual([]);
    expect(writes(calls)).toEqual([]);
  });
});
