/**
 * Fixtures of Forge resources for the tests of `forge sites apply`.
 */

import { vi } from "vitest";

import type { CliExecutorContext } from "../../../context.ts";
import type { Daemon, LoadBalancingNode, ScheduledJob, Site } from "./plan.ts";

export function site(id: number, name: string, overrides: Partial<Site> = {}): Site {
  return {
    id,
    name,
    // The Forge API returns null, even for a site with aliases: see `FakeForge.domains`.
    aliases: null,
    root_directory: `/home/forge/${name}`,
    web_directory: `/home/forge/${name}/public`,
    wildcards: false,
    status: "installed",
    repository: {
      provider: "Custom Git",
      url: `https://git.example.com/group/${name}.git`,
      branch: "main",
      status: "installed",
    },
    quick_deploy: false,
    deployment_status: null,
    deployment_url: "https://forge.laravel.com/deploy",
    deployment_script: null,
    php_version: "PHP 8.3",
    app_type: "Custom",
    url: `https://${name}`,
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
    ...overrides,
  };
}

export function daemon(
  id: number,
  command: string,
  directory: string | null,
  overrides: Partial<Daemon> = {},
): Daemon {
  return {
    id,
    command,
    directory,
    user: "forge",
    processes: 1,
    status: "installed",
    created_at: "2024-01-01T00:00:00Z",
    ...overrides,
  };
}

export function job(
  id: number,
  command: string,
  overrides: Partial<ScheduledJob> = {},
): ScheduledJob {
  return {
    id,
    name: null,
    command,
    user: "forge",
    frequency: "Minutely",
    cron: "* * * * *",
    next_run_time: "2024-01-01T00:00:00Z",
    status: "installed",
    created_at: null,
    updated_at: null,
    ...overrides,
  };
}

type Call = [method: string, url: string, body?: unknown];

function resource(type: string, item: { id: number }) {
  const { id, ...attributes } = item;
  return { id: String(id), type, attributes };
}

function list(type: string, items: Array<{ id: number }>) {
  return {
    data: items.map((item) => resource(type, item)),
    links: {},
    meta: { per_page: 30, next_cursor: null, prev_cursor: null },
  };
}

function doc(type: string, item: { id: number }) {
  return { data: resource(type, item) };
}

function server(id: number, name: string) {
  return {
    id,
    credential_id: null,
    name,
    type: "app",
    ubuntu_version: "24.04",
    ssh_port: 22,
    provider: "custom",
    identifier: null,
    size: "",
    region: "",
    php_version: null,
    php_cli_version: null,
    opcache_status: null,
    database_type: null,
    db_status: null,
    redis_status: null,
    ip_address: null,
    private_ip_address: null,
    revoked: false,
    created_at: "",
    updated_at: "",
    connection_status: null,
    timezone: "UTC",
    local_public_key: null,
    is_ready: true,
  };
}

/** Attributes of server 123, for the `SERVER_*` Nginx variables. */
export function webServer() {
  return { ...server(123, "web-1"), ip_address: "203.0.113.10", private_ip_address: "10.0.0.10" };
}

/** A domain of a site, as the domains route of Forge returns it. */
function domain(id: number, name: string, type: "primary" | "alias") {
  return {
    id,
    name,
    type,
    status: "enabled",
    www_redirect_type: "none",
    allow_wildcard_subdomains: false,
    created_at: null,
    updated_at: null,
  };
}

/** Route on any organization: the CLI test context uses its own. */
function route(url: string): string {
  return decodeURIComponent(url).replace(/^\/orgs\/[^/]+/, "/orgs/org");
}

/** A node of a site on the load balancer, with the default weight. */
export function node(
  serverId: number,
  overrides: Partial<LoadBalancingNode> = {},
): LoadBalancingNode {
  return {
    id: serverId,
    server_id: serverId,
    port: 80,
    weight: 1,
    backup: false,
    down: false,
    ...overrides,
  };
}

export interface FakeForge {
  sites: Site[];
  /** Sites of the load balancer, server 300. */
  balancerSites: Site[];
  /** Nodes of each site of the load balancer, by site ID. */
  nodes: Record<number, LoadBalancingNode[]>;
  /** Aliases of each site of server 123, by site ID. The name of the site is its primary domain. */
  domains: Record<number, string[]>;
  daemons: Daemon[];
  siteDaemonIds: number[];
  jobs: ScheduledJob[];
  siteJobIds: number[];
  databases: Array<{ id: number; name: string }>;
  users: Array<{ id: number; name: string }>;
  env: string;
  /** Nginx configuration of every site. */
  nginx: string;
  /** Statuses a new site goes through, one per read. */
  newSiteStatuses: string[];
  /** Statuses a new database goes through, one per read. */
  newDatabaseStatuses: string[];
  /** Statuses a new database user goes through, one per read. */
  newUserStatuses: string[];
}

/**
 * A fake Forge API client, enough for `apply`. It records every call.
 */
export function fakeForge(initial: Partial<FakeForge> = {}) {
  const state: FakeForge = {
    sites: [],
    balancerSites: [],
    nodes: {},
    domains: {},
    daemons: [],
    siteDaemonIds: [],
    jobs: [],
    siteJobIds: [],
    databases: [],
    users: [],
    env: "",
    nginx: "",
    newSiteStatuses: ["installed"],
    newDatabaseStatuses: ["installed"],
    newUserStatuses: ["installed"],
    ...initial,
  };
  const calls: Call[] = [];
  const stamp = { status: "installed", created_at: "", updated_at: "" };

  const client = {
    get: vi.fn(async (url: string) => {
      calls.push(["GET", url]);
      const [path, query = ""] = route(url).split("?");
      let match: RegExpExecArray | null;
      if (path === "/orgs/org/servers") {
        // Server attributes keep their id.
        const servers = [
          server(123, "web-1"),
          server(124, "web-10"),
          { ...server(300, "lb-1"), type: "loadbalancer" },
        ];
        return {
          ...list("servers", []),
          data: servers.map((item) => ({ id: String(item.id), type: "servers", attributes: item })),
        };
      }
      if (path === "/orgs/org/servers/123") {
        const attributes = webServer();
        return { data: { id: "123", type: "servers", attributes } };
      }
      if (path === "/orgs/org/servers/123/sites") return list("sites", state.sites);
      if (path === "/orgs/org/servers/300/sites") return list("sites", state.balancerSites);
      if ((match = /^\/orgs\/org\/servers\/300\/sites\/(\d+)\/load-balancing-nodes$/.exec(path))) {
        return list("loadBalancingNodes", state.nodes[Number(match[1])] ?? []);
      }
      if ((match = /^\/orgs\/org\/servers\/123\/sites\/(\d+)\/domains$/.exec(path))) {
        const id = Number(match[1]);
        const found = state.sites.find((s) => s.id === id)!;
        return list("domainRecords", [
          domain(id, found.name, "primary"),
          ...(state.domains[id] ?? []).map((name, index) =>
            domain(id * 100 + index, name, "alias"),
          ),
        ]);
      }
      if ((match = /^\/orgs\/org\/servers\/123\/sites\/(\d+)\/nginx$/.exec(path))) {
        return doc("nginxConfigs", { id: Number(match[1]), content: state.nginx } as never);
      }
      if ((match = /^\/orgs\/org\/sites\/(\d+)$/.exec(path))) {
        const found = state.sites.find((s) => s.id === Number(match![1]))!;
        const status = state.newSiteStatuses.shift() ?? "installed";
        found.status = status;
        return doc("sites", found);
      }
      if ((match = /^\/orgs\/org\/servers\/123\/database\/schemas\/(\d+)$/.exec(path))) {
        const found = state.databases.find((d) => d.id === Number(match![1]))!;
        const database = {
          ...stamp,
          ...found,
          status: state.newDatabaseStatuses.shift() ?? "installed",
        };
        return doc("databases", database);
      }
      if ((match = /^\/orgs\/org\/servers\/123\/database\/users\/(\d+)$/.exec(path))) {
        const found = state.users.find((u) => u.id === Number(match![1]))!;
        const user = { ...stamp, ...found, status: state.newUserStatuses.shift() ?? "installed" };
        return doc("users", user);
      }
      if (path === "/orgs/org/servers/123/database/schemas") {
        return list(
          "databases",
          state.databases.map((d) => ({ ...stamp, ...d })),
        );
      }
      if (path === "/orgs/org/servers/123/database/users") {
        return list(
          "users",
          state.users.map((u) => ({ ...stamp, ...u })),
        );
      }
      if (/^\/orgs\/org\/servers\/123\/sites\/\d+\/environment$/.test(path)) {
        return doc("environment", { id: 1, content: state.env } as never);
      }
      if (path === "/orgs/org/servers/123/background-processes") {
        const items = query.includes("filter[site_id]")
          ? state.daemons.filter((d) => state.siteDaemonIds.includes(d.id))
          : state.daemons;
        return list("backgroundProcesses", items);
      }
      if (path === "/orgs/org/servers/123/scheduled-jobs") return list("jobs", state.jobs);
      if (/^\/orgs\/org\/servers\/123\/sites\/\d+\/scheduled-jobs$/.test(path)) {
        return list(
          "jobs",
          state.jobs.filter((j) => state.siteJobIds.includes(j.id)),
        );
      }
      throw new Error(`Unexpected GET ${url}`);
    }),
    post: vi.fn(async (raw: string, body: Record<string, unknown>) => {
      calls.push(["POST", raw, body]);
      const url = route(raw);
      if (url === "/orgs/org/servers/123/sites") {
        const created = site(999, String(body.name), { status: "installing" });
        state.sites.push(created);
        return doc("sites", created);
      }
      if (url === "/orgs/org/servers/123/database/schemas") {
        const created = { id: 70, name: String(body.name) };
        state.databases.push(created);
        return doc("databases", { ...stamp, ...created });
      }
      if (url === "/orgs/org/servers/123/database/users") {
        const created = { id: 71, name: String(body.name) };
        state.users.push(created);
        return doc("users", { ...stamp, ...created });
      }
      const domains = /^\/orgs\/org\/servers\/123\/sites\/(\d+)\/domains$/.exec(url);
      if (domains) {
        const id = Number(domains[1]);
        state.domains[id] = [...(state.domains[id] ?? []), String(body.name)];
        const created = { ...domain(80, String(body.name), "alias"), status: "pending" };
        return doc("domainRecords", created);
      }
      if (url === "/orgs/org/servers/123/background-processes") {
        return doc("backgroundProcesses", daemon(90, String(body.command), String(body.directory)));
      }
      if (url.endsWith("/scheduled-jobs")) {
        return doc("jobs", job(91, String(body.command)));
      }
      throw new Error(`Unexpected POST ${url}`);
    }),
    put: vi.fn(async (raw: string, body: Record<string, unknown>) => {
      calls.push(["PUT", raw, body]);
      const url = route(raw);
      if (url.endsWith("/environment")) {
        state.env = String(body.environment);
        return null;
      }
      if (url.endsWith("/nginx")) {
        state.nginx = String(body.config);
        return null;
      }
      const balancing = /^\/orgs\/org\/servers\/300\/sites\/(\d+)\/load-balancing-nodes$/.exec(url);
      if (balancing) {
        const nodes = body.balancing as Array<{ server_id: number; port: number; weight: number }>;
        state.nodes[Number(balancing[1])] = nodes.map((item) => node(item.server_id, item));
        return null;
      }
      return doc("sites", { ...state.sites[0] });
    }),
    delete: vi.fn(async (url: string) => {
      calls.push(["DELETE", url]);
    }),
    patch: vi.fn(),
  };

  const ctx = {
    client,
    organizationSlug: "org",
    exactMatch: false,
  } as unknown as CliExecutorContext;
  return { ctx, calls, state, client };
}
