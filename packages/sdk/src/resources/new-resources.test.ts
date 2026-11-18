import { describe, expect, it } from "vitest";

import { Forge } from "../forge.ts";
import { createMockFetch } from "../test-utils.ts";

/**
 * The values that the new SDK methods return. The requests that they send are checked against
 * the spec in `routes.conformance.test.ts`.
 */

const doc = (attributes: Record<string, unknown>, id = "7") => ({
  data: { id, type: "resource", attributes },
});
const list = (attributes: Record<string, unknown>, id = "7") => ({
  data: [{ id, type: "resource", attributes }],
  links: {},
  meta: { per_page: 30, next_cursor: null },
});

function forgeAnswering(body: unknown): { forge: Forge; urls: string[] } {
  const urls: string[] = [];
  const forge = new Forge("token", "org", {
    fetch: createMockFetch((url) => {
      urls.push(url);
      return body;
    }),
  });
  return { forge, urls };
}

describe("organizations", () => {
  it("lists the organizations and gets the organization of the SDK", async () => {
    const { forge, urls } = forgeAnswering(list({ name: "Org" }));
    expect(await forge.organizations.list()).toEqual([{ id: 7, name: "Org" }]);
    expect(await forge.organizations.all().toArray()).toEqual([{ id: 7, name: "Org" }]);
    const single = forgeAnswering(doc({ name: "Org" }));
    expect(await single.forge.organizations.get()).toEqual({ id: 7, name: "Org" });
    expect(await single.forge.organizations.get("other")).toEqual({ id: 7, name: "Org" });
    expect(urls[0]).toMatch(/\/orgs$/);
  });
});

describe("events", () => {
  it("lists the events of the organization and of a server", async () => {
    const { forge, urls } = forgeAnswering(list({ description: "Deploy" }));
    expect(await forge.events.list()).toEqual([{ id: 7, description: "Deploy" }]);
    await forge.server(1).events.all().toArray();
    expect(urls[0]).toMatch(/\/orgs\/org\/events$/);
    expect(urls[1]).toMatch(/\/orgs\/org\/servers\/1\/events$/);
  });

  it("gets an event of a server and its output", async () => {
    const { forge } = forgeAnswering(doc({ description: "Deploy", output: "done" }));
    expect(await forge.server(1).events.get(7)).toMatchObject({ id: 7 });
    expect(await forge.server(1).events.output(7)).toBe("done");
  });
});

describe("organization sites", () => {
  it("lists and gets the sites of the organization", async () => {
    const { forge } = forgeAnswering(list({ name: "example.com" }));
    expect(await forge.sites.list()).toEqual([{ id: 7, name: "example.com" }]);
    expect(await forge.sites.all().toArray()).toHaveLength(1);
    const single = forgeAnswering(doc({ name: "example.com" }));
    expect(await single.forge.sites.get(7)).toEqual({ id: 7, name: "example.com" });
  });
});

describe("server settings", () => {
  it("lists the network of a server", async () => {
    const { forge } = forgeAnswering({ data: [{ id: "2", type: "servers", attributes: {} }] });
    expect(await forge.server(1).network.list()).toEqual([{ id: 2 }]);
  });

  it("gets and regenerates the key of a server", async () => {
    const { forge } = forgeAnswering(doc({ public_key: "ssh-ed25519 x", fingerprint: "f" }));
    expect(await forge.server(1).key.get()).toMatchObject({ public_key: "ssh-ed25519 x" });
    expect(await forge.server(1).key.regenerate()).toMatchObject({ fingerprint: "f" });
  });

  it("gets a log of a server by key", async () => {
    const { forge, urls } = forgeAnswering(doc({ content: "error" }));
    expect(await forge.server(1).logs.get("php8.3-fpm")).toBe("error");
    expect(urls[0]).toMatch(/\/logs\/php8\.3-fpm$/);
  });

  it("lists the deployments of a server, the most recent first", async () => {
    const { forge, urls } = forgeAnswering(list({ status: "finished" }));
    expect(await forge.server(1).deployments.list()).toHaveLength(1);
    expect(
      await forge
        .server(1)
        .deployments.all({ sort: ["created_at"] })
        .toArray(),
    ).toHaveLength(1);
    expect(urls[0]).toContain("sort=-created_at");
    expect(urls[1]).toContain("sort=created_at");
  });

  it("lists the archived servers", async () => {
    const { forge } = forgeAnswering(list({ name: "old" }));
    expect(await forge.servers.archives.list()).toEqual([{ id: 7, name: "old" }]);
    expect(await forge.servers.archives.all().toArray()).toHaveLength(1);
  });
});

describe("site settings", () => {
  it("reads the healthcheck, logs and deploy key of a site", async () => {
    const { forge } = forgeAnswering(
      doc({ healthcheck_endpoint: "https://example.com/up", content: "log", key: "ssh-rsa x" }),
    );
    const site = forge.server(1).site(2);
    expect(await site.healthcheck.get()).toBe("https://example.com/up");
    expect(await site.logs.get("application")).toBe("log");
    expect(await site.deployKey.get()).toBe("ssh-rsa x");
    expect(await site.deployKey.create()).toBe("ssh-rsa x");
  });

  it("lists the nodes of a load balancer", async () => {
    const { forge } = forgeAnswering(list({ server_id: 3, weight: 1 }));
    expect(await forge.server(1).site(2).loadBalancing.list()).toEqual([
      { id: 7, server_id: 3, weight: 1 },
    ]);
  });

  it("updates the git repository of a site", async () => {
    const { forge } = forgeAnswering(doc({ name: "example.com" }));
    expect(
      await forge
        .server(1)
        .site(2)
        .updateGit({ source_control_provider: "github", repository: "a/b", branch: "main" }),
    ).toEqual({ id: 7, name: "example.com" });
  });

  it("reads the environment and the Nginx configuration of a site", async () => {
    const { forge } = forgeAnswering(doc({ content: "APP_ENV=production" }));
    expect(await forge.server(1).site(2).env.get()).toBe("APP_ENV=production");
    expect(await forge.server(1).site(2).nginx.get()).toBe("APP_ENV=production");
    const empty = forgeAnswering(doc({ content: null }));
    expect(await empty.forge.server(1).site(2).nginx.get()).toBe("");
  });
});

describe("domains", () => {
  it("lists, gets, creates and updates domains", async () => {
    const { forge } = forgeAnswering(list({ name: "www.example.com" }));
    const domains = forge.server(1).site(2).domains;
    expect(await domains.list()).toEqual([{ id: 7, name: "www.example.com" }]);
    expect(await domains.all().toArray()).toHaveLength(1);
    const single = forgeAnswering(doc({ name: "www.example.com" }));
    const singleDomains = single.forge.server(1).site(2).domains;
    expect(await singleDomains.get(7)).toMatchObject({ id: 7 });
    expect(
      await singleDomains.create({
        name: "www.example.com",
        allow_wildcard_subdomains: false,
        www_redirect_type: "none",
      }),
    ).toMatchObject({ id: 7 });
    expect(await singleDomains.update(7, { www_redirect_type: "to-www" })).toMatchObject({ id: 7 });
  });

  it("lists the DNS records of a domain and reads its Nginx configuration", async () => {
    const { forge } = forgeAnswering({
      data: [{ id: "1", type: "records", attributes: { type: "A" } }],
    });
    expect(await forge.server(1).site(2).domains.configurations(7)).toEqual([{ id: 1, type: "A" }]);
    const nginx = forgeAnswering(doc({ content: null }));
    expect(await nginx.forge.server(1).site(2).domains.nginx(7)).toBe("");
    const config = forgeAnswering(doc({ content: "server {}" }));
    expect(await config.forge.server(1).site(2).domains.nginx(7)).toBe("server {}");
  });
});

describe("credentials", () => {
  it("lists and gets the Composer and npm credentials of a site", async () => {
    const { forge, urls } = forgeAnswering({
      data: [{ id: "1", type: "c", attributes: { username: "u" } }],
    });
    const site = forge.server(1).site(2);
    expect(await site.composerCredentials.list()).toEqual([{ id: 1, username: "u" }]);
    expect(await site.npmCredentials.list()).toEqual([{ id: 1, username: "u" }]);
    const single = forgeAnswering(doc({ username: "u" }));
    expect(await single.forge.server(1).site(2).composerCredentials.get("repo/a")).toMatchObject({
      username: "u",
    });
    expect(await single.forge.server(1).site(2).npmCredentials.get("@a/b")).toMatchObject({
      username: "u",
    });
    expect(single.urls[0]).toMatch(/credentials\/repo%2Fa$/);
    expect(urls).toHaveLength(2);
  });
});

describe("heartbeats and webhooks", () => {
  it("lists, gets, creates and updates heartbeats", async () => {
    const { forge } = forgeAnswering(list({ name: "h" }));
    const heartbeats = forge.server(1).site(2).heartbeats;
    expect(await heartbeats.list()).toEqual([{ id: 7, name: "h" }]);
    expect(await heartbeats.all().toArray()).toHaveLength(1);
    const single = forgeAnswering(doc({ name: "h" }));
    const one = single.forge.server(1).site(2).heartbeats;
    expect(await one.get(7)).toMatchObject({ id: 7 });
    expect(await one.create({ name: "h", grace_period: 5, frequency: 60 })).toMatchObject({
      id: 7,
    });
    expect(await one.update(7, { name: "h", grace_period: 5, frequency: 60 })).toMatchObject({
      id: 7,
    });
  });

  it("lists and gets webhooks", async () => {
    const { forge } = forgeAnswering(list({ url: "https://example.com" }));
    expect(await forge.server(1).site(2).webhooks.list()).toHaveLength(1);
    expect(await forge.server(1).site(2).webhooks.all().toArray()).toHaveLength(1);
    const single = forgeAnswering(doc({ url: "https://example.com" }));
    expect(await single.forge.server(1).site(2).webhooks.get(7)).toMatchObject({ id: 7 });
  });
});

describe("integrations", () => {
  it("gets the state of an integration", async () => {
    const { forge, urls } = forgeAnswering(doc({ enabled: true, horizon_installed: true }));
    expect(await forge.server(1).site(2).integrations.horizon.get()).toEqual({
      id: 7,
      enabled: true,
      horizon_installed: true,
    });
    await forge.server(1).site(2).integrations.maintenance.get();
    expect(urls[1]).toMatch(/integrations\/laravel-maintenance$/);
  });
});

describe("teams, roles, providers and credentials", () => {
  it("returns the resources of teams", async () => {
    const { forge } = forgeAnswering(doc({ name: "Developers" }));
    expect(await forge.teams.get(4)).toMatchObject({ name: "Developers" });
    expect(await forge.teams.create({ name: "Developers" })).toMatchObject({ id: 7 });
    expect(await forge.teams.update(4, { name: "Developers" })).toMatchObject({ id: 7 });
    expect(await forge.team(4).members.get(5)).toMatchObject({ id: 7 });
    expect(await forge.team(4).members.update(5, 3)).toMatchObject({ id: 7 });
    expect(await forge.team(4).invites.get(5)).toMatchObject({ id: 7 });
    expect(await forge.team(4).invites.create({ email: "a@b.c", role_id: 3 })).toMatchObject({
      id: 7,
    });
    expect(await forge.team(4).recipes.add(3)).toMatchObject({ id: 7 });
    expect(await forge.team(4).serverCredentials.add(8)).toMatchObject({ id: 7 });
  });

  it("lists the members, invitations, recipes and credentials of a team", async () => {
    const { forge } = forgeAnswering(list({ name: "x" }));
    const team = forge.team(4);
    for (const collection of [team.members, team.invites, team.recipes, team.serverCredentials]) {
      expect(await collection.list()).toEqual([{ id: 7, name: "x" }]);
      expect(await collection.all().toArray()).toHaveLength(1);
    }
  });

  it("returns roles and permissions", async () => {
    const { forge } = forgeAnswering(list({ name: "x" }));
    expect(await forge.roles.list()).toHaveLength(1);
    expect(await forge.roles.all().toArray()).toHaveLength(1);
    expect(await forge.roles.permissions(3)).toHaveLength(1);
    expect(await forge.predefinedRoles.list()).toHaveLength(1);
    expect(await forge.permissions.list()).toHaveLength(1);
    const single = forgeAnswering(doc({ name: "x" }));
    expect(await single.forge.roles.get(3)).toMatchObject({ id: 7 });
    expect(await single.forge.roles.create({ name: "x" })).toMatchObject({ id: 7 });
    expect(await single.forge.roles.update(3, { name: "x" })).toMatchObject({ id: 7 });
    expect(await single.forge.predefinedRoles.get(1)).toMatchObject({ id: 7 });
    expect(await single.forge.permissions.get(1)).toMatchObject({ id: 7 });
  });

  it("returns providers, regions and sizes", async () => {
    const { forge } = forgeAnswering(list({ name: "x" }));
    expect(await forge.providers.list()).toHaveLength(1);
    expect(await forge.providers.all().toArray()).toHaveLength(1);
    expect(await forge.provider("hetzner").sizes()).toHaveLength(1);
    expect(await forge.provider("hetzner").regions()).toHaveLength(1);
    expect(await forge.provider("hetzner").region("fsn1").sizes()).toHaveLength(1);
    const single = forgeAnswering(doc({ name: "x" }));
    expect(await single.forge.provider("hetzner").get()).toMatchObject({ id: 7 });
    expect(await single.forge.provider("hetzner").size("cpx31")).toMatchObject({ id: 7 });
    expect(await single.forge.provider("hetzner").region("fsn1").get()).toMatchObject({ id: 7 });
    expect(await single.forge.provider("hetzner").region("fsn1").size("cpx31")).toMatchObject({
      id: 7,
    });
  });

  it("returns server credentials and networks with the ID of the provider", async () => {
    const { forge } = forgeAnswering(list({ name: "x" }, "vpc-1"));
    expect(await forge.serverCredentials.vpcs(8, "fsn1").list()).toEqual([
      { id: "vpc-1", name: "x" },
    ]);
    const credentials = forgeAnswering(list({ name: "x" }));
    expect(await credentials.forge.serverCredentials.list()).toHaveLength(1);
    expect(await credentials.forge.serverCredentials.all().toArray()).toHaveLength(1);
    const single = forgeAnswering(doc({ name: "x" }, "vpc-1"));
    expect(await single.forge.serverCredentials.vpcs(8, "fsn1").get("vpc-1")).toEqual({
      id: "vpc-1",
      name: "x",
    });
    expect(await single.forge.serverCredentials.vpcs(8, "fsn1").create("x")).toEqual({
      id: "vpc-1",
      name: "x",
    });
    expect(await single.forge.serverCredentials.get(8)).toMatchObject({ name: "x" });
  });

  it("returns recipes runs and Forge recipes", async () => {
    const { forge } = forgeAnswering(list({ status: "finished" }));
    expect(await forge.recipes.runs(3).list()).toHaveLength(1);
    expect(await forge.recipes.runs(3).all().toArray()).toHaveLength(1);
    expect(await forge.forgeRecipes.list()).toHaveLength(1);
    expect(await forge.forgeRecipes.all().toArray()).toHaveLength(1);
    const single = forgeAnswering(doc({ name: "x", status: "finished", output: "ok" }));
    expect(await single.forge.recipes.runs(3).get(5)).toMatchObject({ output: "ok" });
    expect(await single.forge.forgeRecipes.get(5)).toMatchObject({ id: 7 });
    expect(await single.forge.recipes.update(3, { name: "x" })).toMatchObject({ id: 7 });
  });
});

describe("writes with options", () => {
  it("imports redirect rules from a file and returns the number of imported rules", async () => {
    const { forge } = forgeAnswering({ imported: 2 });
    const file = new Blob(["from,to,type\n"], { type: "text/csv" });
    expect(await forge.server(1).site(2).redirectRules.import(file)).toBe(2);
  });

  it("returns 0 imported rules when Forge answers without a body", async () => {
    const forge = new Forge("token", "org", {
      fetch: async () => new Response(null, { status: 202 }),
    });
    expect(await forge.server(1).site(2).redirectRules.import("from,to,type\n")).toBe(0);
  });

  it("refuses to stop a service that the API cannot stop", async () => {
    const { forge } = forgeAnswering({});
    await expect(forge.server(1).services.stop("redis" as never)).rejects.toThrow(
      'Invalid service "redis"',
    );
  });

  it("sends the options of an environment update", async () => {
    const bodies: unknown[] = [];
    const forge = new Forge("token", "org", {
      fetch: createMockFetch((_url, init) => {
        bodies.push(JSON.parse(init?.body as string));
        return {};
      }),
    });
    await forge.server(1).site(2).env.update("A=1", { queues: true, encryptionKey: null });
    expect(bodies).toEqual([{ environment: "A=1", queues: true, encryption_key: null }]);
  });
});
