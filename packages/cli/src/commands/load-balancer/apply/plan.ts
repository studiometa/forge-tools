/**
 * Compare a load balancer file with the state of Forge and list the changes that `apply` makes.
 * Pure functions: no API call here.
 */

import type { LoadBalancingNodeAttributes } from "@studiometa/forge-api";

import type { Domain, Site } from "../../sites/apply/plan.ts";
import type { SiteFile } from "../../sites/apply/site-file.ts";
import type { LoadBalancerFile } from "./balancer-file.ts";

export type LoadBalancingNode = LoadBalancingNodeAttributes & { id: number };

/** A node as Forge takes it: a server ID, a port, a weight and a state. */
export interface Balancing {
  server_id: number;
  port: number;
  weight: number;
  backup: boolean;
  down: boolean;
}

/** What `apply` reads from Forge. */
export interface RemoteState {
  /** ID of the load balancer. */
  serverId: string;
  /** The site of the load balancer, or null when it does not exist yet. */
  site: Site | null;
  /** The nodes of the site; empty when the site does not exist. */
  nodes: LoadBalancingNode[];
  /** Names of the domains of the site; empty when the site does not exist. */
  domains: string[];
  /** The primary domain of the site; null when the site does not exist or Forge lists none. */
  primaryDomain: Domain | null;
  /** The nodes of the file, with the server ID of each environment. */
  target: Balancing[];
}

export type Change =
  | {
      action: "create-load-balancer-site";
      domain: string;
      method: LoadBalancerFile["method"];
      wildcards: boolean;
      nodes: Balancing[];
    }
  | {
      action: "update-load-balancer-nodes";
      site: string;
      method: LoadBalancerFile["method"];
      from: Balancing[];
      to: Balancing[];
    }
  | { action: "add-alias"; name: string }
  | {
      action: "update-www-redirect";
      /** ID of the primary domain. */
      id: number;
      domain: string;
      from: string;
      to: NonNullable<SiteFile["wwwRedirect"]>;
    };

export interface PlanOptions {
  /** Replace the nodes and set the method even when the nodes match. */
  force?: boolean;
}

export interface Plan {
  changes: Change[];
}

function nodeKey(node: Balancing): string {
  return [node.server_id, node.port, node.weight, node.backup, node.down].join(":");
}

/** True when both lists have the same nodes, in any order. */
export function sameNodes(a: Balancing[], b: Balancing[]): boolean {
  const keys = (nodes: Balancing[]) => nodes.map(nodeKey).toSorted().join(",");
  return a.length === b.length && keys(a) === keys(b);
}

function toBalancing({ server_id, port, weight, backup, down }: LoadBalancingNode): Balancing {
  return { server_id, port, weight, backup, down };
}

/**
 * Compare the load balancer file with the state of Forge. The plan creates the site when it
 * is missing, replaces its nodes when they differ and adds the missing aliases. It never deletes
 * the site or an alias. Forge does not report the method of a site: the plan sets it with the
 * nodes, and a different method alone is not a change: `force` sets it.
 */
export function buildPlan(
  file: LoadBalancerFile,
  state: RemoteState,
  options: PlanOptions = {},
): Plan {
  const changes: Change[] = [];

  if (!state.site) {
    changes.push({
      action: "create-load-balancer-site",
      domain: file.domain,
      method: file.method,
      wildcards: file.wildcards,
      nodes: state.target,
    });
  } else {
    const from = state.nodes.map(toBalancing);
    if (options.force || !sameNodes(from, state.target)) {
      changes.push({
        action: "update-load-balancer-nodes",
        site: state.site.name,
        method: file.method,
        from,
        to: state.target,
      });
    }
  }

  // A new site has the domain as its primary domain. An existing one can be named after an alias.
  const existing = state.site ? state.domains : [file.domain];
  for (const name of new Set([file.domain, ...file.aliases])) {
    if (!existing.some((domain) => domain.toLowerCase() === name.toLowerCase())) {
      changes.push({ action: "add-alias", name });
    }
  }

  // A new site gets its `www` redirect once it exists: the API creates it without one.
  const primary = state.primaryDomain;
  if (file.wwwRedirect && primary && primary.www_redirect_type !== file.wwwRedirect) {
    changes.push({
      action: "update-www-redirect",
      id: primary.id,
      domain: primary.name,
      from: primary.www_redirect_type,
      to: file.wwwRedirect,
    });
  }

  return { changes };
}

/** `server 123:80`, then the weight when it is not 1, and the state. */
export function describeNode(node: Balancing): string {
  return [
    `server ${node.server_id}:${node.port}`,
    ...(node.weight === 1 ? [] : [`weight ${node.weight}`]),
    ...(node.backup ? ["backup"] : []),
    ...(node.down ? ["down"] : []),
  ].join(" ");
}

function describeNodes(nodes: Balancing[]): string {
  return nodes.length > 0 ? nodes.map(describeNode).join(", ") : "(none)";
}

/**
 * One line per change, for human output.
 */
export function describeChange(change: Change): string {
  switch (change.action) {
    case "create-load-balancer-site":
      return `+ create load balancer site ${change.domain} (method: ${change.method}${change.wildcards ? ", wildcards" : ""}): ${describeNodes(change.nodes)}`;
    case "update-load-balancer-nodes":
      return `~ update load balancer nodes of ${change.site} (method: ${change.method}): ${describeNodes(change.from)} → ${describeNodes(change.to)}`;
    case "add-alias":
      return `+ add alias ${change.name}`;
    case "update-www-redirect":
      return `~ update www redirect of ${change.domain}: ${change.from} → ${change.to}`;
  }
}
