/**
 * Read the state of Forge for a load balancer file, and run a plan against Forge.
 */

import {
  createDomain,
  createLoadBalancerSite,
  getSite,
  listLoadBalancingNodes,
  listSites,
  updateLoadBalancingNodes,
} from "@studiometa/forge-core";

import type { CliExecutorContext } from "../../../context.ts";
import { ValidationError } from "../../../errors.ts";
import {
  type ApplyOptions as SiteApplyOptions,
  ApplyError,
  findSite,
  readDomains,
  resolveApplyServer,
  waitForInstalled,
} from "../../sites/apply/apply.ts";
import type { Site } from "../../sites/apply/plan.ts";
import type { LoadBalancerFile } from "./balancer-file.ts";
import { type Balancing, type Change, type Plan, type RemoteState, buildPlan } from "./plan.ts";

export interface ApplyOptions extends Pick<
  SiteApplyOptions,
  "sleep" | "pollIntervalMs" | "timeoutMs"
> {
  /** Called before each change. */
  onChange?: (change: Change) => void;
}

/**
 * The site of the load balancer named `domain` or one of the aliases, compared without case.
 * Its name can be any of them, e.g. the domain without `www`. Two matches are an error: a guess
 * could send the traffic of another site.
 */
export function findLoadBalancerSite(sites: Site[], names: string[]): Site | null {
  const wanted = new Set(names.map((name) => name.toLowerCase()));
  const matches = sites.filter((site) => wanted.has(site.name.toLowerCase()));
  if (matches.length > 1) {
    throw new ValidationError(
      `Several sites of the load balancer match the domain and aliases: ${matches.map((site) => site.name).join(", ")}`,
      "server",
      ["Keep one site for the domain and its aliases on the load balancer"],
    );
  }
  return matches[0] ?? null;
}

/**
 * The nodes of the file, with the server of each environment. Exit with a validation error,
 * before any change, when the site of an environment does not exist on its server.
 */
export async function resolveNodes(
  file: LoadBalancerFile,
  ctx: CliExecutorContext,
): Promise<Balancing[]> {
  const sitesByServer = new Map<string, Site[]>();
  const nodes: Balancing[] = [];
  for (const { node, path, file: siteFile } of file.sites) {
    const serverId = await resolveApplyServer(siteFile.server, ctx);
    let sites = sitesByServer.get(serverId);
    if (!sites) {
      sites = (await listSites({ server_id: serverId }, ctx)).data;
      sitesByServer.set(serverId, sites);
    }
    if (!findSite(sites, siteFile.domain)) {
      throw new ValidationError(
        `Site ${siteFile.domain} of environment ${node.environment} does not exist on server ${siteFile.server}`,
        "nodes",
        [
          `Create it first: forge sites apply --file ${path} (or the provision job of the environment)`,
        ],
      );
    }
    const { port, weight, backup, down } = node;
    nodes.push({ server_id: Number(serverId), port, weight, backup, down });
  }
  return nodes;
}

/**
 * Read from Forge the site of the load balancer, its nodes and its domains.
 */
export async function readRemoteState(
  file: LoadBalancerFile,
  serverId: string,
  target: Balancing[],
  ctx: CliExecutorContext,
): Promise<RemoteState> {
  const sites = (await listSites({ server_id: serverId }, ctx)).data;
  const site = findLoadBalancerSite(sites, [file.domain, ...file.aliases]);
  if (!site) return { serverId, site, nodes: [], domains: [], target };
  const params = { server_id: serverId, site_id: String(site.id) };
  const nodes = (await listLoadBalancingNodes(params, ctx)).data;
  const domains = (await readDomains(serverId, site, ctx)).map((domain) => domain.name);
  return { serverId, site, nodes, domains, target };
}

/**
 * Apply a load balancer file: create the site when it does not exist and wait until Forge
 * installs it, then read the state again and run the other changes. Returns the plan that ran
 * first.
 */
export async function applyLoadBalancerFile(
  file: LoadBalancerFile,
  serverId: string,
  ctx: CliExecutorContext,
  options: ApplyOptions = {},
): Promise<Plan> {
  const target = await resolveNodes(file, ctx);
  let state = await readRemoteState(file, serverId, target, ctx);
  const firstPlan = buildPlan(file, state);
  let plan = firstPlan;

  const create = plan.changes.find((change) => change.action === "create-load-balancer-site");
  if (create?.action === "create-load-balancer-site") {
    options.onChange?.(create);
    const created = await createLoadBalancerSite(
      {
        server_id: serverId,
        domain: create.domain,
        allow_wildcard_subdomains: create.wildcards,
        balancer_method: create.method,
        balancing: create.nodes,
      },
      ctx,
    );
    const siteId = String(created.data.id);
    await waitForInstalled(
      async () => (await getSite({ server_id: serverId, site_id: siteId }, ctx)).data,
      (site) =>
        new ApplyError(`Site ${site.name} is still ${site.status} on the load balancer`, [
          "Run forge load-balancer apply again once the site is installed",
        ]),
      options,
    );
    state = await readRemoteState(file, serverId, target, ctx);
    plan = buildPlan(file, state);
  }

  const site = state.site;
  if (!site) {
    throw new ApplyError(`Site ${file.domain} is not on the load balancer after its creation`);
  }
  const params = { server_id: serverId, site_id: String(site.id) };
  for (const change of plan.changes) {
    if (change.action === "update-load-balancer-nodes") {
      options.onChange?.(change);
      await updateLoadBalancingNodes(
        { ...params, balancer_method: change.method, balancing: change.to },
        ctx,
      );
    } else if (change.action === "add-alias") {
      options.onChange?.(change);
      await createDomain(
        {
          ...params,
          name: change.name,
          allow_wildcard_subdomains: false,
          www_redirect_type: "none",
        },
        ctx,
      );
    }
  }
  return firstPlan;
}
