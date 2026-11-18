/**
 * The load balancer file of `forge load-balancer apply`: a JSON file that declares the site of
 * a load balancer and its nodes. Each node is an environment of the project: the site file
 * `<environment>/site.json`, next to the load balancer file, gives its server and domain.
 */

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { LOAD_BALANCER_METHODS } from "@studiometa/forge-api";
import * as v from "valibot";

import { ValidationError } from "../../../errors.ts";
import { type SiteFile, readSiteFile, serverRef } from "../../sites/apply/site-file.ts";

/** URL of the JSON Schema of the load balancer file, published with the package. */
export const LOAD_BALANCER_FILE_SCHEMA_URL =
  "https://unpkg.com/@studiometa/forge-cli/schemas/load-balancer.schema.json";

/** A server of the load balancer: an environment of the project and the port of its site. */
export const NodeSchema = v.strictObject({
  environment: v.pipe(
    v.string(),
    v.regex(/^(?!\.\.?$)[A-Za-z0-9._-]+$/, "environment must be the name of a folder"),
  ),
  port: v.optional(v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(65535)), 80),
  weight: v.optional(v.pipe(v.number(), v.integer(), v.minValue(1)), 1),
  backup: v.optional(v.boolean(), false),
  down: v.optional(v.boolean(), false),
});

export const LoadBalancerFileSchema = v.strictObject({
  $schema: v.optional(v.string()),
  server: serverRef,
  method: v.optional(v.picklist(LOAD_BALANCER_METHODS), "round_robin"),
  nodes: v.pipe(
    v.array(NodeSchema),
    v.minLength(1),
    v.rawCheck(({ dataset, addIssue }) => {
      if (!dataset.typed) return;
      const seen = new Set<string>();
      for (const [index, node] of dataset.value.entries()) {
        if (seen.has(node.environment)) {
          addIssue({ message: `nodes[${index}] declares environment ${node.environment} again` });
        }
        seen.add(node.environment);
      }
    }),
  ),
});

export type LoadBalancerFileData = v.InferOutput<typeof LoadBalancerFileSchema>;
export type NodeDeclaration = v.InferOutput<typeof NodeSchema>;

/** A load balancer file with the site file of each node. */
export interface LoadBalancerFile extends LoadBalancerFileData {
  /** The site of the load balancer: the domain, aliases and wildcards of the node site files. */
  domain: string;
  aliases: string[];
  wildcards: boolean;
  /** The `www` redirect of the node site files; undefined when they do not set it. */
  wwwRedirect?: SiteFile["wwwRedirect"];
  /** The site file of each node, in the order of `nodes`. */
  sites: Array<{ node: NodeDeclaration; path: string; file: SiteFile }>;
}

/**
 * Validate parsed JSON as a load balancer file. Throws a ValidationError that lists every issue.
 */
export function parseLoadBalancerFile(
  data: unknown,
  source = "load balancer file",
): LoadBalancerFileData {
  const result = v.safeParse(LoadBalancerFileSchema, data);
  if (!result.success) {
    const issues = result.issues.map(
      (issue) => `${v.getDotPath(issue) ?? "(root)"}: ${issue.message}`,
    );
    throw new ValidationError(`Invalid ${source}`, "file", issues);
  }
  return result.output;
}

function aliasKey(file: SiteFile): string {
  return [...new Set((file.aliases ?? []).map((alias) => alias.toLowerCase()))]
    .toSorted()
    .join(", ");
}

/**
 * Exit with a validation error when the site files of the nodes do not declare the same site:
 * the load balancer sends one domain to all of them.
 */
function assertSameSite(sites: LoadBalancerFile["sites"]): void {
  const checks: Array<[string, (file: SiteFile) => string]> = [
    ["domains", (file) => file.domain.toLowerCase()],
    ["aliases", aliasKey],
    ["wildcards", (file) => String(file.wildcards ?? false)],
    ["www redirects", (file) => file.wwwRedirect ?? "(not set)"],
  ];
  for (const [name, key] of checks) {
    if (new Set(sites.map(({ file }) => key(file))).size > 1) {
      const values = sites.map(({ node, file }) => `${node.environment} (${key(file) || "none"})`);
      throw new ValidationError(
        `The site files of the nodes declare different ${name}: ${values.join(", ")}`,
        "nodes",
        [
          "The nodes of a load balancer serve one site: use the same domain, aliases, wildcards and www redirect",
        ],
      );
    }
  }
}

/**
 * Read and validate a load balancer file from disk, with the site file of each node.
 */
export function readLoadBalancerFile(path: string): LoadBalancerFile {
  let content: string;
  try {
    content = readFileSync(path, "utf8");
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new ValidationError(`Cannot read load balancer file ${path}: ${reason}`, "file");
  }

  let data: unknown;
  try {
    data = JSON.parse(content);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new ValidationError(`Load balancer file ${path} is not valid JSON: ${reason}`, "file");
  }

  const file = parseLoadBalancerFile(data, `load balancer file ${path}`);
  const sites = file.nodes.map((node) => {
    const sitePath = resolve(dirname(path), node.environment, "site.json");
    return { node, path: sitePath, file: readSiteFile(sitePath) };
  });
  assertSameSite(sites);
  const [first] = sites;
  return {
    ...file,
    domain: first.file.domain,
    aliases: [...new Set(first.file.aliases ?? [])],
    wildcards: first.file.wildcards ?? false,
    ...(first.file.wwwRedirect ? { wwwRedirect: first.file.wwwRedirect } : {}),
    sites,
  };
}
