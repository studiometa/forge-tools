/**
 * Fixtures for the tests of `forge load-balancer apply`.
 */

import type { LoadBalancerFile, NodeDeclaration } from "./balancer-file.ts";

function declaration(environment: string, overrides: Partial<NodeDeclaration> = {}) {
  return { environment, port: 80, weight: 1, backup: false, down: false, ...overrides };
}

/**
 * A load balancer file on lb-1 (server 300) with two nodes: production on web-1 (server 123)
 * and production-2 on server 124, both for www.example.com with the alias example.com.
 */
export function balancerFile(overrides: Partial<LoadBalancerFile> = {}): LoadBalancerFile {
  const site = { domain: "www.example.com", aliases: ["example.com"] };
  const nodes = [declaration("production"), declaration("production-2", { weight: 2 })];
  return {
    server: "lb-1",
    method: "round_robin",
    nodes,
    domain: site.domain,
    aliases: site.aliases,
    wildcards: false,
    sites: [
      { node: nodes[0], path: "/p/production/site.json", file: { ...site, server: "web-1" } },
      { node: nodes[1], path: "/p/production-2/site.json", file: { ...site, server: 124 } },
    ],
    ...overrides,
  };
}

/** The nodes of `balancerFile()` as Forge takes them. */
export const TARGET = [
  { server_id: 123, port: 80, weight: 1, backup: false, down: false },
  { server_id: 124, port: 80, weight: 2, backup: false, down: false },
];
