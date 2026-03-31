// ── Route registry for Forge v2 API ──────────────────
// Single source of truth for all API endpoint paths and methods.
// Used by executors via `request()` instead of manual URL construction.

import * as v from "valibot";

import type { ExecutorContext } from "./context.ts";

// ── Types ────────────────────────────────────────────

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RouteDefinition {
  method: HttpMethod;
  path: string;
}

export type RouteParams = Record<string, string | number>;

// ── Route definitions ────────────────────────────────

export const ROUTES = {
  servers: {
    list: { method: "GET", path: "/orgs/:org/servers" },
    get: { method: "GET", path: "/orgs/:org/servers/:server_id" },
    create: { method: "POST", path: "/orgs/:org/servers" },
    delete: { method: "DELETE", path: "/orgs/:org/servers/:server_id" },
    reboot: { method: "POST", path: "/orgs/:org/servers/:server_id/actions" },
  },
  sites: {
    list: { method: "GET", path: "/orgs/:org/servers/:server_id/sites" },
    get: { method: "GET", path: "/orgs/:org/sites/:site_id" },
    create: { method: "POST", path: "/orgs/:org/servers/:server_id/sites" },
    update: { method: "PUT", path: "/orgs/:org/servers/:server_id/sites/:site_id" },
    delete: { method: "DELETE", path: "/orgs/:org/servers/:server_id/sites/:site_id" },
  },
  databases: {
    list: { method: "GET", path: "/orgs/:org/servers/:server_id/database/schemas" },
    get: { method: "GET", path: "/orgs/:org/servers/:server_id/database/schemas/:id" },
    create: { method: "POST", path: "/orgs/:org/servers/:server_id/database/schemas" },
    delete: { method: "DELETE", path: "/orgs/:org/servers/:server_id/database/schemas/:id" },
  },
  databaseUsers: {
    list: { method: "GET", path: "/orgs/:org/servers/:server_id/database/users" },
    get: { method: "GET", path: "/orgs/:org/servers/:server_id/database/users/:id" },
    create: { method: "POST", path: "/orgs/:org/servers/:server_id/database/users" },
    update: { method: "PUT", path: "/orgs/:org/servers/:server_id/database/users/:id" },
    delete: { method: "DELETE", path: "/orgs/:org/servers/:server_id/database/users/:id" },
  },
  daemons: {
    list: { method: "GET", path: "/orgs/:org/servers/:server_id/background-processes" },
    get: { method: "GET", path: "/orgs/:org/servers/:server_id/background-processes/:id" },
    create: { method: "POST", path: "/orgs/:org/servers/:server_id/background-processes" },
    update: { method: "PUT", path: "/orgs/:org/servers/:server_id/background-processes/:id" },
    delete: { method: "DELETE", path: "/orgs/:org/servers/:server_id/background-processes/:id" },
    action: {
      method: "POST",
      path: "/orgs/:org/servers/:server_id/background-processes/:id/actions",
    },
    log: { method: "GET", path: "/orgs/:org/servers/:server_id/background-processes/:id/log" },
  },
  deployments: {
    list: { method: "GET", path: "/orgs/:org/servers/:server_id/sites/:site_id/deployments" },
    get: { method: "GET", path: "/orgs/:org/servers/:server_id/sites/:site_id/deployments/:id" },
    create: { method: "POST", path: "/orgs/:org/servers/:server_id/sites/:site_id/deployments" },
    getLog: {
      method: "GET",
      path: "/orgs/:org/servers/:server_id/sites/:site_id/deployments/:id/log",
    },
    getScript: {
      method: "GET",
      path: "/orgs/:org/servers/:server_id/sites/:site_id/deployments/script",
    },
    updateScript: {
      method: "PUT",
      path: "/orgs/:org/servers/:server_id/sites/:site_id/deployments/script",
    },
    getStatus: {
      method: "GET",
      path: "/orgs/:org/servers/:server_id/sites/:site_id/deployments/status",
    },
  },
  certificates: {
    get: {
      method: "GET",
      path: "/orgs/:org/servers/:server_id/sites/:site_id/domains/:domain_id/certificate",
    },
    create: {
      method: "POST",
      path: "/orgs/:org/servers/:server_id/sites/:site_id/domains/:domain_id/certificate",
    },
    delete: {
      method: "DELETE",
      path: "/orgs/:org/servers/:server_id/sites/:site_id/domains/:domain_id/certificate",
    },
    activate: {
      method: "POST",
      path: "/orgs/:org/servers/:server_id/sites/:site_id/domains/:domain_id/certificate/actions",
    },
  },
  env: {
    get: { method: "GET", path: "/orgs/:org/servers/:server_id/sites/:site_id/environment" },
    update: { method: "PUT", path: "/orgs/:org/servers/:server_id/sites/:site_id/environment" },
  },
  nginx: {
    get: { method: "GET", path: "/orgs/:org/servers/:server_id/sites/:site_id/nginx" },
    update: { method: "PUT", path: "/orgs/:org/servers/:server_id/sites/:site_id/nginx" },
  },
  nginxTemplates: {
    list: { method: "GET", path: "/orgs/:org/servers/:server_id/nginx/templates" },
    get: { method: "GET", path: "/orgs/:org/servers/:server_id/nginx/templates/:id" },
    create: { method: "POST", path: "/orgs/:org/servers/:server_id/nginx/templates" },
    update: { method: "PUT", path: "/orgs/:org/servers/:server_id/nginx/templates/:id" },
    delete: { method: "DELETE", path: "/orgs/:org/servers/:server_id/nginx/templates/:id" },
  },
  firewallRules: {
    list: { method: "GET", path: "/orgs/:org/servers/:server_id/firewall-rules" },
    get: { method: "GET", path: "/orgs/:org/servers/:server_id/firewall-rules/:id" },
    create: { method: "POST", path: "/orgs/:org/servers/:server_id/firewall-rules" },
    delete: { method: "DELETE", path: "/orgs/:org/servers/:server_id/firewall-rules/:id" },
  },
  sshKeys: {
    list: { method: "GET", path: "/orgs/:org/servers/:server_id/ssh-keys" },
    get: { method: "GET", path: "/orgs/:org/servers/:server_id/ssh-keys/:id" },
    create: { method: "POST", path: "/orgs/:org/servers/:server_id/ssh-keys" },
    delete: { method: "DELETE", path: "/orgs/:org/servers/:server_id/ssh-keys/:id" },
  },
  securityRules: {
    list: { method: "GET", path: "/orgs/:org/servers/:server_id/sites/:site_id/security-rules" },
    get: { method: "GET", path: "/orgs/:org/servers/:server_id/sites/:site_id/security-rules/:id" },
    create: { method: "POST", path: "/orgs/:org/servers/:server_id/sites/:site_id/security-rules" },
    update: {
      method: "PUT",
      path: "/orgs/:org/servers/:server_id/sites/:site_id/security-rules/:id",
    },
    delete: {
      method: "DELETE",
      path: "/orgs/:org/servers/:server_id/sites/:site_id/security-rules/:id",
    },
  },
  redirectRules: {
    list: { method: "GET", path: "/orgs/:org/servers/:server_id/sites/:site_id/redirect-rules" },
    get: { method: "GET", path: "/orgs/:org/servers/:server_id/sites/:site_id/redirect-rules/:id" },
    create: { method: "POST", path: "/orgs/:org/servers/:server_id/sites/:site_id/redirect-rules" },
    delete: {
      method: "DELETE",
      path: "/orgs/:org/servers/:server_id/sites/:site_id/redirect-rules/:id",
    },
  },
  monitors: {
    list: { method: "GET", path: "/orgs/:org/servers/:server_id/monitors" },
    get: { method: "GET", path: "/orgs/:org/servers/:server_id/monitors/:id" },
    create: { method: "POST", path: "/orgs/:org/servers/:server_id/monitors" },
    delete: { method: "DELETE", path: "/orgs/:org/servers/:server_id/monitors/:id" },
  },
  recipes: {
    list: { method: "GET", path: "/orgs/:org/recipes" },
    get: { method: "GET", path: "/orgs/:org/recipes/:id" },
    create: { method: "POST", path: "/orgs/:org/recipes" },
    update: { method: "PUT", path: "/orgs/:org/recipes/:id" },
    delete: { method: "DELETE", path: "/orgs/:org/recipes/:id" },
    run: { method: "POST", path: "/orgs/:org/recipes/:id/runs" },
  },
  backups: {
    list: { method: "GET", path: "/orgs/:org/servers/:server_id/database/backups" },
    get: { method: "GET", path: "/orgs/:org/servers/:server_id/database/backups/:id" },
    create: { method: "POST", path: "/orgs/:org/servers/:server_id/database/backups" },
    update: { method: "PUT", path: "/orgs/:org/servers/:server_id/database/backups/:id" },
    delete: { method: "DELETE", path: "/orgs/:org/servers/:server_id/database/backups/:id" },
  },
  commands: {
    list: { method: "GET", path: "/orgs/:org/servers/:server_id/sites/:site_id/commands" },
    get: { method: "GET", path: "/orgs/:org/servers/:server_id/sites/:site_id/commands/:id" },
    create: { method: "POST", path: "/orgs/:org/servers/:server_id/sites/:site_id/commands" },
    delete: { method: "DELETE", path: "/orgs/:org/servers/:server_id/sites/:site_id/commands/:id" },
    getOutput: {
      method: "GET",
      path: "/orgs/:org/servers/:server_id/sites/:site_id/commands/:id/output",
    },
  },
  scheduledJobs: {
    list: { method: "GET", path: "/orgs/:org/servers/:server_id/scheduled-jobs" },
    get: { method: "GET", path: "/orgs/:org/servers/:server_id/scheduled-jobs/:id" },
    create: { method: "POST", path: "/orgs/:org/servers/:server_id/scheduled-jobs" },
    delete: { method: "DELETE", path: "/orgs/:org/servers/:server_id/scheduled-jobs/:id" },
    getOutput: { method: "GET", path: "/orgs/:org/servers/:server_id/scheduled-jobs/:id/output" },
  },
  user: {
    get: { method: "GET", path: "/user" },
  },
} as const satisfies Record<string, Record<string, RouteDefinition>>;

// ── Flatten helper ───────────────────────────────────

export interface FlatRoute {
  key: string;
  route: RouteDefinition;
}

/**
 * Flatten the nested ROUTES object into a flat array for iteration.
 */
export function flattenRoutes(routes: typeof ROUTES): FlatRoute[] {
  return Object.entries(routes).flatMap(([resource, actions]) =>
    Object.entries(actions).map(([action, route]) => ({
      key: `${resource}.${action}`,
      route,
    })),
  );
}

// ── URL builder ──────────────────────────────────────

/**
 * Build a URL from a route definition, replacing `:param` placeholders.
 *
 * Auto-injects `:org` from `ctx.organizationSlug`.
 * Throws on missing required params.
 */
export function buildUrl(
  route: RouteDefinition,
  ctx: ExecutorContext,
  params: RouteParams = {},
  query?: Record<string, string>,
): string {
  const allParams: RouteParams = {
    ...(ctx.organizationSlug ? { org: ctx.organizationSlug } : {}),
    ...params,
  };
  let url = route.path;
  const missing: string[] = [];

  url = url.replaceAll(/:(\w+)/g, (_, key: string) => {
    const value = allParams[key];
    if (value === undefined) {
      missing.push(key);
      return `:${key}`;
    }
    return String(value);
  });

  if (missing.length > 0) {
    throw new Error(`Missing route params: ${missing.join(", ")}`);
  }

  if (query) {
    const qs = new URLSearchParams(query).toString();
    if (qs) url += `?${qs}`;
  }

  return url;
}

// ── Request helper ───────────────────────────────────

export interface RequestOptions<S extends v.GenericSchema = v.GenericSchema> {
  body?: unknown;
  schema?: S;
  query?: Record<string, string>;
}

/**
 * Make an HTTP request using a route definition.
 *
 * When a Valibot schema is provided, the return type is inferred from it.
 * Without a schema, the caller must provide a generic type parameter.
 */
export async function request<S extends v.GenericSchema>(
  route: RouteDefinition,
  ctx: ExecutorContext,
  params: RouteParams,
  options: RequestOptions<S> & { schema: S },
): Promise<v.InferOutput<S>>;
export async function request<T = void>(
  route: RouteDefinition,
  ctx: ExecutorContext,
  params?: RouteParams,
  options?: RequestOptions,
): Promise<T>;
export async function request(
  route: RouteDefinition,
  ctx: ExecutorContext,
  params: RouteParams = {},
  options?: RequestOptions,
): Promise<unknown> {
  const url = buildUrl(route, ctx, params, options?.query);
  const client = ctx.client;
  let response: unknown;

  switch (route.method) {
    case "GET":
      response = await client.get(url);
      break;
    case "POST":
      response = await client.post(url, options?.body);
      break;
    case "PUT":
      response = await client.put(url, options?.body);
      break;
    case "PATCH":
      response = await client.patch(url, options?.body);
      break;
    case "DELETE":
      response = await client.delete(url);
      break;
  }

  if (options?.schema) {
    return v.parse(options.schema, response);
  }

  return response;
}
