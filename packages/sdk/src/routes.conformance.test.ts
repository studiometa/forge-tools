import { describe, expect, it } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

import { Forge } from "./forge.ts";
import { toUrlString } from "./test-utils.ts";

/**
 * The SDK covers the Forge OpenAPI spec:
 *
 * - every operation of the spec is called by an SDK method, unless SKIPPED gives the reason;
 * - every SDK method calls a route of the spec, with the query parameters, the request body and
 *   the response that the spec gives for it.
 *
 * The mock `fetch` answers each request as the spec says: no body when the spec has no response
 * content (Forge answers many writes with `202 Accepted` and no body), CSV for a CSV export, a
 * JSON:API document otherwise.
 */

interface SpecSchema {
  $ref?: string;
  type?: string | string[];
  format?: string;
  enum?: unknown[];
  anyOf?: SpecSchema[];
  oneOf?: SpecSchema[];
  allOf?: SpecSchema[];
  properties?: Record<string, SpecSchema>;
  required?: string[];
  items?: SpecSchema;
}

interface SpecParameter {
  name: string;
  in: string;
  schema?: SpecSchema;
}

interface SpecOperation {
  parameters?: SpecParameter[];
  requestBody?: { required?: boolean; content: Record<string, { schema: SpecSchema }> };
  responses?: Record<string, { content?: Record<string, { schema: SpecSchema }> }>;
}

const SPEC_PATH = path.resolve(import.meta.dirname, "../../../docs/forge-openapi-v2.json");

const spec = JSON.parse(fs.readFileSync(SPEC_PATH, "utf-8")) as {
  paths: Record<string, Record<string, SpecOperation>>;
  components: { schemas: Record<string, SpecSchema> };
};

const ORG = "test-org";

/**
 * Spec operations that the SDK does not call, on purpose. Keys are `METHOD path`.
 */
const SKIPPED: Record<string, string> = {
  // Same answer as `GET .../certificates/active`, which `certificates.active()` calls.
  "GET /orgs/{organization}/servers/{server}/sites/{site}/domains/{domainRecord}/certificate":
    "alias of certificates/active",
  // Same answer as `GET /user`, which `forge.user()` calls.
  "GET /me": "alias of /user",
  // The sites of every organization of the user: the SDK is scoped to one organization, and
  // `forge.sites` calls `GET /orgs/{organization}/sites`.
  "GET /sites": "not scoped to the organization of the SDK",
};

function deref(schema: SpecSchema): SpecSchema {
  let current = schema;
  while (current.$ref) {
    const { $ref, ...rest } = current;
    current = { ...spec.components.schemas[$ref.split("/").pop()!], ...rest };
  }
  if (current.allOf) {
    const parts = current.allOf.map(deref);
    return {
      type: "object",
      properties: Object.assign({}, ...parts.map((part) => part.properties)),
      required: parts.flatMap((part) => part.required ?? []),
    };
  }
  return current;
}

/**
 * Check a value against a spec schema: types, enum values, required and unknown properties.
 */
function validate(schema: SpecSchema, value: unknown, at: string): string[] {
  const current = deref(schema);
  const alternatives = current.anyOf ?? current.oneOf;
  if (alternatives) {
    const results = alternatives.map((alternative) => validate(alternative, value, at));
    return results.some((problems) => problems.length === 0) ? [] : results[0];
  }

  const types = Array.isArray(current.type) ? current.type : current.type ? [current.type] : [];
  if (value === null) {
    return types.includes("null") || current.enum?.includes(null) ? [] : [`${at}: null`];
  }
  if (current.enum && !current.enum.includes(value))
    return [`${at}: ${JSON.stringify(value)} not in enum`];
  if (current.format === "binary") return value instanceof Blob ? [] : [`${at}: not a file`];

  const type = types.find((candidate) => candidate !== "null");
  switch (type) {
    case "string":
      return typeof value === "string" ? [] : [`${at}: not a string`];
    case "integer":
      return Number.isInteger(value) ? [] : [`${at}: not an integer`];
    case "number":
      return typeof value === "number" ? [] : [`${at}: not a number`];
    case "boolean":
      return typeof value === "boolean" ? [] : [`${at}: not a boolean`];
    case "array":
      return Array.isArray(value)
        ? value.flatMap((item, index) => validate(current.items ?? {}, item, `${at}[${index}]`))
        : [`${at}: not an array`];
    case "object": {
      if (typeof value !== "object" || Array.isArray(value)) return [`${at}: not an object`];
      if (!current.properties) return [];
      const object = value as Record<string, unknown>;
      return [
        ...(current.required ?? [])
          .filter((key) => !(key in object))
          .map((key) => `${at}.${key}: missing`),
        ...Object.entries(object).flatMap(([key, item]) =>
          current.properties![key]
            ? validate(current.properties![key], item, `${at}.${key}`)
            : [`${at}.${key}: not in the spec`],
        ),
      ];
    }
    default:
      return [];
  }
}

/** Check the query parameters of a request against the spec operation. */
function validateQuery(operation: SpecOperation, query: URLSearchParams): string[] {
  const parameters = new Map(
    (operation.parameters ?? []).filter((p) => p.in === "query").map((p) => [p.name, p]),
  );
  return [...query.entries()].flatMap(([name, value]) => {
    const parameter = parameters.get(name);
    if (!parameter) return [`query ${name}: not in the spec`];
    const schema = deref(parameter.schema ?? {});
    if (schema.type === "array") {
      return value
        .split(",")
        .flatMap((item) => validate(schema.items ?? {}, item, `query ${name}`));
    }
    if (schema.type === "integer" || schema.type === "boolean") {
      return validate(schema, JSON.parse(value), `query ${name}`);
    }
    return validate(schema, value, `query ${name}`);
  });
}

/** Check the body of a request against the spec operation. */
function validateBody(operation: SpecOperation, body: BodyInit | null | undefined): string[] {
  const request = operation.requestBody;
  if (!request) return body === undefined ? [] : ["body: the spec has no request body"];
  if (body === undefined) return request.required ? ["body: missing"] : [];
  if (body instanceof FormData) {
    const schema = request.content["multipart/form-data"]?.schema;
    if (!schema) return ["body: the spec takes no form"];
    return validate(schema, Object.fromEntries(body.entries()), "body");
  }
  const schema = request.content["application/json"]?.schema;
  if (!schema) return ["body: the spec takes no JSON"];
  return validate(schema, JSON.parse(body as string), "body");
}

/**
 * Find the spec operation for a request. A literal segment of the spec must be equal to the
 * request segment, a `{param}` segment matches any value. When several paths match, the one
 * with the most literal segments wins (`deployments/script` before `deployments/{deployment}`).
 */
function findOperation(
  method: string,
  pathname: string,
): { specPath: string; operation: SpecOperation } | undefined {
  const segments = pathname.split("/").filter(Boolean);
  let best: { specPath: string; operation: SpecOperation; literals: number } | undefined;

  for (const [specPath, operations] of Object.entries(spec.paths)) {
    const operation = operations[method.toLowerCase()];
    if (!operation) continue;

    const specSegments = specPath.split("/").filter(Boolean);
    if (specSegments.length !== segments.length) continue;

    let literals = 0;
    const matches = specSegments.every((segment, index) => {
      if (segment.startsWith("{")) return true;
      literals += 1;
      return segment === segments[index];
    });

    if (matches && (!best || literals > best.literals)) {
      best = { specPath, operation, literals };
    }
  }

  return best;
}

/** The response that Forge sends for an operation, as the spec gives it. */
function specResponse(method: string, operation: SpecOperation): Response {
  const [status, response] = Object.entries(operation.responses ?? {}).find(([code]) =>
    code.startsWith("2"),
  )!;
  const [contentType, content] = Object.entries(response.content ?? {})[0] ?? [];
  if (!contentType) return new Response(null, { status: method === "DELETE" ? 204 : 202 });
  if (contentType === "text/csv") {
    return new Response("from,to,type\n", { status: 200, headers: { "content-type": "text/csv" } });
  }
  const resource = { id: "1", type: "resource", attributes: { name: "test", content: "" } };
  const data = deref(content.schema).properties?.data;
  const body = !data
    ? { imported: 1 }
    : deref(data).type === "array"
      ? { data: [resource], links: {}, meta: { per_page: 30, next_cursor: null } }
      : { data: resource };
  return new Response(JSON.stringify(body), {
    status: Number(status),
    headers: { "content-type": "application/vnd.api+json" },
  });
}

interface Call {
  method: string;
  pathname: string;
  operation?: string;
  problems: string[];
}

function createForge(): { forge: Forge; calls: Call[] } {
  const calls: Call[] = [];

  const forge = new Forge("test-token", ORG, {
    fetch: async (url: string | URL | Request, init?: RequestInit) => {
      const method = init?.method ?? "GET";
      const parsed = new URL(toUrlString(url));
      const pathname = parsed.pathname.replace(/^\/api/, "");
      const match = findOperation(method, pathname);

      if (!match) {
        calls.push({ method, pathname, problems: [`no spec route for ${method} ${pathname}`] });
        // Forge would answer 404. Answer without a body so that the test reports the route.
        return new Response(null, { status: 204 });
      }

      calls.push({
        method,
        pathname,
        operation: `${method} ${match.specPath}`,
        problems: [
          ...validateQuery(match.operation, parsed.searchParams),
          ...validateBody(match.operation, init?.body),
        ],
      });
      return specResponse(method, match.operation);
    },
  });

  return { forge, calls };
}

type Case = [name: string, run: (forge: Forge) => Promise<unknown>];

const server = (forge: Forge) => forge.server(1);
const site = (forge: Forge) => forge.server(1).site(2);
const team = (forge: Forge) => forge.team(4);

/** Each SDK method that calls the API, with arguments that the spec accepts. */
const CASES: Case[] = [
  // Organization
  ["user", (f) => f.user()],
  ["organizations.list", (f) => f.organizations.list({ pageSize: 10 })],
  ["organizations.all", (f) => f.organizations.all().toArray()],
  ["organizations.get", (f) => f.organizations.get()],
  ["sites.list", (f) => f.sites.list({ filter: { name: "example" }, include: ["server"] })],
  ["sites.all", (f) => f.sites.all().toArray()],
  ["sites.get", (f) => f.sites.get(2)],
  ["events.list", (f) => f.events.list({ filter: { ran_as: "forge" }, sort: ["-created_at"] })],
  ["events.all", (f) => f.events.all({ include: ["site"] }).toArray()],
  [
    "servers.list",
    (f) =>
      f.servers.list({ cursor: "abc", filter: { name: "web", region: "fsn1" }, sort: ["name"] }),
  ],
  ["servers.all", (f) => f.servers.all().toArray()],
  ["servers.get", (f) => f.servers.get(1)],
  [
    "servers.create",
    (f) =>
      f.servers.create({ name: "web-1", provider: "custom", type: "app", ubuntu_version: "24.04" }),
  ],
  ["servers.update", (f) => f.servers.update(1, { name: "web-2" })],
  ["servers.delete", (f) => f.servers.delete(1, { preserveAtProvider: true })],
  ["servers.reboot", (f) => f.servers.reboot(1)],
  ["servers.archives.list", (f) => f.servers.archives.list({ sort: ["-created_at"] })],
  ["servers.archives.all", (f) => f.servers.archives.all().toArray()],
  ["servers.archives.archive", (f) => f.servers.archives.archive(1)],
  ["servers.archives.unarchive", (f) => f.servers.archives.unarchive(1)],
  ["recipes.list", (f) => f.recipes.list()],
  ["recipes.all", (f) => f.recipes.all().toArray()],
  ["recipes.get", (f) => f.recipes.get(3)],
  ["recipes.create", (f) => f.recipes.create({ name: "r", user: "root", script: "ls" })],
  ["recipes.update", (f) => f.recipes.update(3, { script: "ls -la" })],
  ["recipes.delete", (f) => f.recipes.delete(3)],
  ["recipes.run", (f) => f.recipes.run(3, { servers: [1], email: true })],
  ["recipes.runs.list", (f) => f.recipes.runs(3).list()],
  ["recipes.runs.all", (f) => f.recipes.runs(3).all().toArray()],
  ["recipes.runs.get", (f) => f.recipes.runs(3).get(5)],
  ["forgeRecipes.list", (f) => f.forgeRecipes.list()],
  ["forgeRecipes.all", (f) => f.forgeRecipes.all().toArray()],
  ["forgeRecipes.get", (f) => f.forgeRecipes.get(3)],
  ["forgeRecipes.run", (f) => f.forgeRecipes.run(3, { servers: [1] })],
  ["storageProviders.list", (f) => f.storageProviders.list({ filter: { provider: "s3" } })],
  ["storageProviders.all", (f) => f.storageProviders.all().toArray()],
  ["storageProviders.get", (f) => f.storageProviders.get(3)],
  [
    "storageProviders.create",
    (f) =>
      f.storageProviders.create({
        name: "s3",
        provider: "s3",
        region: "eu-west-1",
        bucket: "b",
        access_key: "k",
        secret_key: "s",
      }),
  ],
  [
    "storageProviders.update",
    (f) => f.storageProviders.update(3, { name: "s3", provider: "s3", assume_role: false }),
  ],
  ["storageProviders.delete", (f) => f.storageProviders.delete(3)],
  ["teams.list", (f) => f.teams.list()],
  ["teams.all", (f) => f.teams.all().toArray()],
  ["teams.get", (f) => f.teams.get(4)],
  ["teams.create", (f) => f.teams.create({ name: "Developers", invites: [{ email: "a@b.c" }] })],
  ["teams.update", (f) => f.teams.update(4, { name: "Developers" })],
  ["teams.delete", (f) => f.teams.delete(4)],
  ["team.servers.list", (f) => team(f).servers.list()],
  ["team.servers.all", (f) => team(f).servers.all().toArray()],
  ["team.servers.add", (f) => team(f).servers.add(1)],
  ["team.servers.remove", (f) => team(f).servers.remove(1)],
  ["team.members.list", (f) => team(f).members.list()],
  ["team.members.all", (f) => team(f).members.all().toArray()],
  ["team.members.get", (f) => team(f).members.get(5)],
  ["team.members.update", (f) => team(f).members.update(5, 3)],
  ["team.members.remove", (f) => team(f).members.remove(5)],
  ["team.invites.list", (f) => team(f).invites.list({ include: ["role"] })],
  ["team.invites.all", (f) => team(f).invites.all().toArray()],
  ["team.invites.get", (f) => team(f).invites.get(5)],
  ["team.invites.create", (f) => team(f).invites.create({ email: "a@b.c", role_id: 3 })],
  ["team.invites.delete", (f) => team(f).invites.delete(5)],
  ["team.recipes.list", (f) => team(f).recipes.list()],
  ["team.recipes.all", (f) => team(f).recipes.all().toArray()],
  ["team.recipes.add", (f) => team(f).recipes.add(3)],
  ["team.recipes.remove", (f) => team(f).recipes.remove(3)],
  ["team.serverCredentials.list", (f) => team(f).serverCredentials.list()],
  ["team.serverCredentials.all", (f) => team(f).serverCredentials.all().toArray()],
  ["team.serverCredentials.add", (f) => team(f).serverCredentials.add(8)],
  ["team.serverCredentials.remove", (f) => team(f).serverCredentials.remove(8)],
  ["roles.list", (f) => f.roles.list({ filter: { name: "dev" }, include: ["permissions"] })],
  ["roles.all", (f) => f.roles.all().toArray()],
  ["roles.get", (f) => f.roles.get(3)],
  [
    "roles.create",
    (f) => f.roles.create({ name: "Deployer", permissions: ["site:manage-deploys"] }),
  ],
  ["roles.update", (f) => f.roles.update(3, { name: "Deployer", description: "Deploys" })],
  ["roles.delete", (f) => f.roles.delete(3)],
  ["roles.permissions", (f) => f.roles.permissions(3, { filter: { name: "site" } })],
  ["predefinedRoles.list", (f) => f.predefinedRoles.list()],
  ["predefinedRoles.get", (f) => f.predefinedRoles.get(1)],
  ["permissions.list", (f) => f.permissions.list()],
  ["permissions.get", (f) => f.permissions.get(1)],
  ["providers.list", (f) => f.providers.list()],
  ["providers.all", (f) => f.providers.all().toArray()],
  ["provider.get", (f) => f.provider("hetzner").get()],
  ["provider.sizes", (f) => f.provider("hetzner").sizes()],
  ["provider.size", (f) => f.provider("hetzner").size("cpx31")],
  ["provider.regions", (f) => f.provider("hetzner").regions()],
  ["provider.region.get", (f) => f.provider("hetzner").region("fsn1").get()],
  ["provider.region.sizes", (f) => f.provider("hetzner").region("fsn1").sizes()],
  ["provider.region.size", (f) => f.provider("hetzner").region("fsn1").size("cpx31")],
  ["serverCredentials.list", (f) => f.serverCredentials.list()],
  ["serverCredentials.all", (f) => f.serverCredentials.all().toArray()],
  ["serverCredentials.get", (f) => f.serverCredentials.get(8)],
  ["serverCredentials.vpcs.list", (f) => f.serverCredentials.vpcs(8, "fsn1").list()],
  ["serverCredentials.vpcs.get", (f) => f.serverCredentials.vpcs(8, "fsn1").get("vpc-1")],
  ["serverCredentials.vpcs.create", (f) => f.serverCredentials.vpcs(8, "fsn1").create("prod")],

  // Server
  ["server.get", (f) => server(f).get()],
  ["server.update", (f) => server(f).update({ name: "web-2" })],
  ["server.reboot", (f) => server(f).reboot()],
  ["server.action", (f) => server(f).action("power-cycle")],
  ["server.delete", (f) => server(f).delete()],
  ["server.events.list", (f) => server(f).events.list({ filter: { initiated_by: "1" } })],
  ["server.events.all", (f) => server(f).events.all().toArray()],
  ["server.events.get", (f) => server(f).events.get(5)],
  ["server.events.output", (f) => server(f).events.output(5)],
  ["server.deployments.list", (f) => server(f).deployments.list({ include: ["site"] })],
  ["server.deployments.all", (f) => server(f).deployments.all().toArray()],
  ["server.network.list", (f) => server(f).network.list()],
  ["server.network.update", (f) => server(f).network.update([2, 3])],
  ["server.key.get", (f) => server(f).key.get()],
  ["server.key.regenerate", (f) => server(f).key.regenerate()],
  ["server.logs.get", (f) => server(f).logs.get("nginx_error")],
  ["server.logs.clear", (f) => server(f).logs.clear("nginx_error")],
  [
    "backups.list",
    (f) => server(f).backups.list({ filter: { status: "installed" }, sort: ["name"] }),
  ],
  ["backups.all", (f) => server(f).backups.all().toArray()],
  ["backups.get", (f) => server(f).backups.get(3)],
  [
    "backups.create",
    (f) =>
      server(f).backups.create({
        storage_provider_id: 1,
        frequency: "daily",
        retention: 7,
        database_ids: [1],
        time: "02:00",
      } as never),
  ],
  [
    "backups.update",
    (f) =>
      server(f).backups.update(3, {
        storage_provider_id: 1,
        frequency: "daily",
        retention: 7,
        database_ids: [1],
        time: "02:00",
      } as never),
  ],
  ["backups.delete", (f) => server(f).backups.delete(3)],
  [
    "backups.instances.list",
    (f) =>
      server(f)
        .backups.instances(3)
        .list({ filter: { status: "success" } }),
  ],
  ["backups.instances.all", (f) => server(f).backups.instances(3).all().toArray()],
  ["backups.instances.get", (f) => server(f).backups.instances(3).get(4)],
  ["backups.instances.create", (f) => server(f).backups.instances(3).create()],
  ["backups.instances.delete", (f) => server(f).backups.instances(3).delete(4)],
  ["backups.instances.restore", (f) => server(f).backups.instances(3).restore(4, 5)],
  ["daemons.list", (f) => server(f).daemons.list({ filter: { user: "forge" }, sort: ["-user"] })],
  ["daemons.all", (f) => server(f).daemons.all().toArray()],
  ["daemons.get", (f) => server(f).daemons.get(3)],
  ["daemons.log", (f) => server(f).daemons.log(3)],
  [
    "daemons.create",
    (f) =>
      server(f).daemons.create({
        name: "queue",
        command: "php artisan queue:work",
        user: "forge",
        processes: 1,
      }),
  ],
  ["daemons.update", (f) => server(f).daemons.update(3, { name: "queue" })],
  ["daemons.delete", (f) => server(f).daemons.delete(3)],
  ["daemons.restart", (f) => server(f).daemons.restart(3)],
  ["daemons.action", (f) => server(f).daemons.action(3, "empty-log")],
  ["databases.list", (f) => server(f).databases.list({ filter: { name: "app" } })],
  ["databases.all", (f) => server(f).databases.all().toArray()],
  ["databases.get", (f) => server(f).databases.get(3)],
  ["databases.create", (f) => server(f).databases.create({ name: "app" })],
  ["databases.delete", (f) => server(f).databases.delete(3)],
  ["databases.synchronize", (f) => server(f).databases.synchronize()],
  ["databases.updatePassword", (f) => server(f).databases.updatePassword("secret")],
  ["databaseUsers.list", (f) => server(f).databaseUsers.list()],
  ["databaseUsers.all", (f) => server(f).databaseUsers.all().toArray()],
  ["databaseUsers.get", (f) => server(f).databaseUsers.get(3)],
  ["databaseUsers.create", (f) => server(f).databaseUsers.create({ name: "u", password: "p" })],
  ["databaseUsers.update", (f) => server(f).databaseUsers.update(3, { database_ids: [1] })],
  ["databaseUsers.delete", (f) => server(f).databaseUsers.delete(3)],
  ["firewallRules.list", (f) => server(f).firewallRules.list({ filter: { port: "80" } })],
  ["firewallRules.all", (f) => server(f).firewallRules.all().toArray()],
  ["firewallRules.get", (f) => server(f).firewallRules.get(3)],
  [
    "firewallRules.create",
    (f) => server(f).firewallRules.create({ name: "HTTP", port: "80", type: "allow" }),
  ],
  ["firewallRules.delete", (f) => server(f).firewallRules.delete(3)],
  ["monitors.list", (f) => server(f).monitors.list({ sort: ["state"] })],
  ["monitors.all", (f) => server(f).monitors.all().toArray()],
  ["monitors.get", (f) => server(f).monitors.get(3)],
  [
    "monitors.create",
    (f) =>
      server(f).monitors.create({
        type: "disk",
        operator: "gte",
        threshold: 80,
        minutes: 5,
        notify: "a@b.c",
      } as never),
  ],
  ["monitors.delete", (f) => server(f).monitors.delete(3)],
  ["nginxTemplates.list", (f) => server(f).nginxTemplates.list()],
  ["nginxTemplates.all", (f) => server(f).nginxTemplates.all().toArray()],
  ["nginxTemplates.get", (f) => server(f).nginxTemplates.get(3)],
  [
    "nginxTemplates.create",
    (f) => server(f).nginxTemplates.create({ name: "t", content: "server {}" }),
  ],
  [
    "nginxTemplates.update",
    (f) => server(f).nginxTemplates.update(3, { name: "t", content: "server {}" }),
  ],
  ["nginxTemplates.delete", (f) => server(f).nginxTemplates.delete(3)],
  ["php.list", (f) => server(f).php.list({ filter: { version: "php84" } })],
  ["php.get", (f) => server(f).php.get(3)],
  ["php.install", (f) => server(f).php.install({ version: "php84", site_default: true })],
  ["php.upgrade", (f) => server(f).php.upgrade(3)],
  ["php.uninstall", (f) => server(f).php.uninstall(3)],
  ["php.cliVersion", (f) => server(f).php.cliVersion()],
  ["php.setCliVersion", (f) => server(f).php.setCliVersion("8.4")],
  ["php.siteVersion", (f) => server(f).php.siteVersion()],
  ["php.setSiteVersion", (f) => server(f).php.setSiteVersion("8.4")],
  ["php.config.cli", (f) => server(f).php.config(3, "cli")],
  ["php.config.fpm", (f) => server(f).php.config(3, "fpm")],
  ["php.config.pool", (f) => server(f).php.config(3, "pool", { user: "forge" })],
  ["php.updateConfig.cli", (f) => server(f).php.updateConfig(3, "cli", "x")],
  ["php.updateConfig.fpm", (f) => server(f).php.updateConfig(3, "fpm", "x")],
  ["php.updateConfig.pool", (f) => server(f).php.updateConfig(3, "pool", "x", { user: "forge" })],
  ["php.maxUploadSize", (f) => server(f).php.maxUploadSize()],
  ["php.setMaxUploadSize", (f) => server(f).php.setMaxUploadSize(64)],
  ["php.maxExecutionTime", (f) => server(f).php.maxExecutionTime()],
  ["php.setMaxExecutionTime", (f) => server(f).php.setMaxExecutionTime(60)],
  ["php.opcache", (f) => server(f).php.opcache()],
  ["php.enableOpcache", (f) => server(f).php.enableOpcache()],
  ["php.disableOpcache", (f) => server(f).php.disableOpcache()],
  ["scheduledJobs.list", (f) => server(f).scheduledJobs.list({ filter: { user: "forge" } })],
  ["scheduledJobs.all", (f) => server(f).scheduledJobs.all().toArray()],
  ["scheduledJobs.get", (f) => server(f).scheduledJobs.get(3)],
  [
    "scheduledJobs.create",
    (f) =>
      server(f).scheduledJobs.create({
        command: "ls",
        user: "forge",
        frequency: "minutely",
      } as never),
  ],
  ["scheduledJobs.delete", (f) => server(f).scheduledJobs.delete(3)],
  ["scheduledJobs.output", (f) => server(f).scheduledJobs.output(3)],
  ["services.list", (f) => server(f).services.list()],
  ["services.restart.nginx", (f) => server(f).services.restart("nginx")],
  ["services.restart.postgres", (f) => server(f).services.restart("postgres")],
  ["services.restart.redis", (f) => server(f).services.restart("redis")],
  ["services.restart.mysql", (f) => server(f).services.restart("mysql")],
  ["services.restart.php", (f) => server(f).services.restart("php", { version: "php84" })],
  ["services.restart.supervisor", (f) => server(f).services.restart("supervisor")],
  ["services.stop", (f) => server(f).services.stop("nginx")],
  ["services.reloadPhp", (f) => server(f).services.reloadPhp("php84")],
  ["sshKeys.list", (f) => server(f).sshKeys.list({ filter: { user: "forge" } })],
  ["sshKeys.all", (f) => server(f).sshKeys.all().toArray()],
  ["sshKeys.get", (f) => server(f).sshKeys.get(3)],
  ["sshKeys.create", (f) => server(f).sshKeys.create({ name: "k", key: "ssh-ed25519 x" })],
  ["sshKeys.delete", (f) => server(f).sshKeys.delete(3)],
  ["sites.server.list", (f) => server(f).sites.list({ sort: ["-created_at"] })],
  ["sites.server.all", (f) => server(f).sites.all().toArray()],
  ["sites.server.get", (f) => server(f).sites.get(2)],
  ["sites.server.create", (f) => server(f).sites.create({ type: "php", name: "example.com" })],
  [
    "sites.server.createLoadBalancer",
    (f) =>
      server(f).sites.createLoadBalancer({ domain: "example.com", balancing: [{ server_id: 3 }] }),
  ],
  ["sites.server.update", (f) => server(f).sites.update(2, { directory: "/public" })],
  ["sites.server.delete", (f) => server(f).sites.delete(2)],

  // Site
  ["site.get", (f) => site(f).get()],
  ["site.deploy", (f) => site(f).deploy()],
  ["site.delete", (f) => site(f).delete()],
  [
    "site.updateGit",
    (f) =>
      site(f).updateGit({ source_control_provider: "github", repository: "a/b", branch: "main" }),
  ],
  ["site.env.get", (f) => site(f).env.get()],
  ["site.env.update", (f) => site(f).env.update("APP_ENV=production", { cache: true })],
  ["site.nginx.get", (f) => site(f).nginx.get()],
  ["site.nginx.update", (f) => site(f).nginx.update("server {}")],
  ["certificates.listForSite", (f) => site(f).certificates.list()],
  ["certificates.list", (f) => site(f).certificates.list(3)],
  ["certificates.active", (f) => site(f).certificates.active(3)],
  ["certificates.get", (f) => site(f).certificates.get(3, 4)],
  [
    "certificates.create",
    (f) => site(f).certificates.create(3, { type: "letsencrypt", enable: false }),
  ],
  ["certificates.delete", (f) => site(f).certificates.delete(3, 4)],
  ["certificates.activate", (f) => site(f).certificates.activate(3, 4)],
  ["certificates.deactivate", (f) => site(f).certificates.deactivate(3, 4)],
  ["commands.list", (f) => site(f).commands.list({ filter: { status: "finished" } })],
  ["commands.all", (f) => site(f).commands.all().toArray()],
  ["commands.get", (f) => site(f).commands.get(3)],
  ["commands.create", (f) => site(f).commands.create({ command: "php artisan migrate" })],
  ["commands.delete", (f) => site(f).commands.delete(3)],
  ["commands.output", (f) => site(f).commands.output(3)],
  ["deployments.list", (f) => site(f).deployments.list({ filter: { commit_hash: "abc" } })],
  ["deployments.all", (f) => site(f).deployments.all().toArray()],
  ["deployments.get", (f) => site(f).deployments.get(3)],
  ["deployments.output", (f) => site(f).deployments.output(3)],
  ["deployments.script", (f) => site(f).deployments.script()],
  [
    "deployments.updateScript",
    (f) => site(f).deployments.updateScript("git pull", { autoSource: true }),
  ],
  ["deployments.status", (f) => site(f).deployments.status()],
  ["deployments.resetStatus", (f) => site(f).deployments.resetStatus()],
  ["deployments.deployHook", (f) => site(f).deployments.deployHook()],
  ["deployments.regenerateDeployHook", (f) => site(f).deployments.regenerateDeployHook()],
  ["deployments.enablePushToDeploy", (f) => site(f).deployments.enablePushToDeploy()],
  ["deployments.disablePushToDeploy", (f) => site(f).deployments.disablePushToDeploy()],
  ["domains.list", (f) => site(f).domains.list({ filter: { type: "alias" }, sort: ["name"] })],
  ["domains.all", (f) => site(f).domains.all().toArray()],
  ["domains.get", (f) => site(f).domains.get(3)],
  [
    "domains.create",
    (f) =>
      site(f).domains.create({
        name: "www.example.com",
        allow_wildcard_subdomains: false,
        www_redirect_type: "none",
      }),
  ],
  ["domains.update", (f) => site(f).domains.update(3, { www_redirect_type: "to-www" })],
  ["domains.delete", (f) => site(f).domains.delete(3)],
  ["domains.configurations", (f) => site(f).domains.configurations(3)],
  ["domains.action", (f) => site(f).domains.action(3, { action: "mark-as-primary" })],
  ["domains.nginx", (f) => site(f).domains.nginx(3)],
  ["domains.updateNginx", (f) => site(f).domains.updateNginx(3, "server {}")],
  ["healthcheck.get", (f) => site(f).healthcheck.get()],
  ["healthcheck.update", (f) => site(f).healthcheck.update("https://example.com/up")],
  ["logs.get", (f) => site(f).logs.get("nginx-access")],
  ["logs.get.error", (f) => site(f).logs.get("nginx-error")],
  ["logs.get.application", (f) => site(f).logs.get("application")],
  ["logs.clear", (f) => site(f).logs.clear("nginx-access")],
  ["logs.clear.error", (f) => site(f).logs.clear("nginx-error")],
  ["logs.clear.application", (f) => site(f).logs.clear("application")],
  ["deployKey.get", (f) => site(f).deployKey.get()],
  ["deployKey.create", (f) => site(f).deployKey.create()],
  ["deployKey.delete", (f) => site(f).deployKey.delete()],
  ["loadBalancing.list", (f) => site(f).loadBalancing.list({ sort: ["id"] })],
  [
    "loadBalancing.update",
    (f) =>
      site(f).loadBalancing.update({
        balancer_method: "round_robin",
        balancing: [{ server_id: 3, weight: 1 }],
      }),
  ],
  ["composerCredentials.list", (f) => site(f).composerCredentials.list()],
  ["composerCredentials.get", (f) => site(f).composerCredentials.get("repo.example.com")],
  [
    "composerCredentials.create",
    (f) => site(f).composerCredentials.create({ repository: "r", username: "u", password: "p" }),
  ],
  [
    "composerCredentials.update",
    (f) =>
      site(f).composerCredentials.update("r", { repository: "r", username: "u", password: "p" }),
  ],
  ["composerCredentials.delete", (f) => site(f).composerCredentials.delete("r")],
  ["npmCredentials.list", (f) => site(f).npmCredentials.list()],
  ["npmCredentials.get", (f) => site(f).npmCredentials.get("npm.example.com")],
  [
    "npmCredentials.create",
    (f) => site(f).npmCredentials.create({ registry: "r", token: "t", scopes: ["@a"] }),
  ],
  [
    "npmCredentials.update",
    (f) => site(f).npmCredentials.update("r", { registry: "r", token: "t" }),
  ],
  ["npmCredentials.delete", (f) => site(f).npmCredentials.delete("r")],
  ["heartbeats.list", (f) => site(f).heartbeats.list()],
  ["heartbeats.all", (f) => site(f).heartbeats.all().toArray()],
  ["heartbeats.get", (f) => site(f).heartbeats.get(3)],
  [
    "heartbeats.create",
    (f) => site(f).heartbeats.create({ name: "h", grace_period: 5, frequency: 1440 }),
  ],
  [
    "heartbeats.update",
    (f) =>
      site(f).heartbeats.update(3, {
        name: "h",
        grace_period: 5,
        frequency: -1,
        custom_frequency: "0 * * * *",
      }),
  ],
  ["heartbeats.delete", (f) => site(f).heartbeats.delete(3)],
  ["integrations.horizon.get", (f) => site(f).integrations.horizon.get()],
  ["integrations.horizon.enable", (f) => site(f).integrations.horizon.enable()],
  ["integrations.horizon.disable", (f) => site(f).integrations.horizon.disable()],
  ["integrations.octane.get", (f) => site(f).integrations.octane.get()],
  [
    "integrations.octane.enable",
    (f) => site(f).integrations.octane.enable({ port: "8000", server: "swoole" }),
  ],
  ["integrations.octane.disable", (f) => site(f).integrations.octane.disable()],
  ["integrations.reverb.get", (f) => site(f).integrations.reverb.get()],
  [
    "integrations.reverb.enable",
    (f) =>
      site(f).integrations.reverb.enable({
        host: "ws.example.com",
        port: "8080",
        connections: 1000,
      }),
  ],
  ["integrations.reverb.disable", (f) => site(f).integrations.reverb.disable()],
  ["integrations.inertia.get", (f) => site(f).integrations.inertia.get()],
  ["integrations.inertia.enable", (f) => site(f).integrations.inertia.enable()],
  ["integrations.pulse.get", (f) => site(f).integrations.pulse.get()],
  ["integrations.pulse.enable", (f) => site(f).integrations.pulse.enable()],
  ["integrations.pulse.disable", (f) => site(f).integrations.pulse.disable()],
  ["integrations.maintenance.get", (f) => site(f).integrations.maintenance.get()],
  [
    "integrations.maintenance.enable",
    (f) => site(f).integrations.maintenance.enable({ status: 503 }),
  ],
  ["integrations.maintenance.disable", (f) => site(f).integrations.maintenance.disable()],
  ["integrations.scheduler.get", (f) => site(f).integrations.scheduler.get()],
  ["integrations.scheduler.enable", (f) => site(f).integrations.scheduler.enable()],
  ["integrations.scheduler.disable", (f) => site(f).integrations.scheduler.disable()],
  ["webhooks.list", (f) => site(f).webhooks.list({ sort: ["-created_at"] })],
  ["webhooks.all", (f) => site(f).webhooks.all().toArray()],
  ["webhooks.get", (f) => site(f).webhooks.get(3)],
  ["webhooks.create", (f) => site(f).webhooks.create("https://example.com/hook")],
  ["webhooks.delete", (f) => site(f).webhooks.delete(3)],
  ["redirectRules.list", (f) => site(f).redirectRules.list({ filter: { from: "/a" } })],
  ["redirectRules.all", (f) => site(f).redirectRules.all().toArray()],
  ["redirectRules.get", (f) => site(f).redirectRules.get(3)],
  [
    "redirectRules.create",
    (f) => site(f).redirectRules.create({ from: "/a", to: "/b", type: "redirect" } as never),
  ],
  ["redirectRules.delete", (f) => site(f).redirectRules.delete(3)],
  ["redirectRules.export", (f) => site(f).redirectRules.export()],
  [
    "redirectRules.import",
    (f) => site(f).redirectRules.import("from,to,type\n/a,/b,redirect\n", "replace"),
  ],
  ["redirectRules.reorder", (f) => site(f).redirectRules.reorder([3, 1, 2])],
  ["securityRules.list", (f) => site(f).securityRules.list({ filter: { path: "/admin" } })],
  ["securityRules.all", (f) => site(f).securityRules.all().toArray()],
  ["securityRules.get", (f) => site(f).securityRules.get(3)],
  [
    "securityRules.create",
    (f) =>
      site(f).securityRules.create({
        name: "s",
        credentials: [{ username: "u", password: "p" }],
      } as never),
  ],
  [
    "securityRules.update",
    (f) =>
      site(f).securityRules.update(3, {
        name: "s",
        credentials: [{ username: "u", password: "p" }],
      }),
  ],
  ["securityRules.delete", (f) => site(f).securityRules.delete(3)],
  ["site.scheduledJobs.list", (f) => site(f).scheduledJobs.list()],
  ["site.scheduledJobs.all", (f) => site(f).scheduledJobs.all().toArray()],
  ["site.scheduledJobs.get", (f) => site(f).scheduledJobs.get(3)],
  [
    "site.scheduledJobs.create",
    (f) =>
      site(f).scheduledJobs.create({
        command: "ls",
        user: "forge",
        frequency: "minutely",
      } as never),
  ],
  ["site.scheduledJobs.delete", (f) => site(f).scheduledJobs.delete(3)],
  ["site.scheduledJobs.output", (f) => site(f).scheduledJobs.output(3)],
];

describe("SDK routes conform to the OpenAPI spec", () => {
  const covered = new Set<string>();

  for (const [name, run] of CASES) {
    it(name, async () => {
      const { forge, calls } = createForge();

      await run(forge);

      expect(calls.length).toBeGreaterThan(0);
      for (const call of calls) {
        expect(call.problems, `${call.method} ${call.pathname}`).toEqual([]);
        covered.add(call.operation!);
      }
    });
  }

  it("calls every operation of the spec, except the skipped ones", () => {
    const operations = Object.entries(spec.paths).flatMap(([specPath, operations]) =>
      Object.keys(operations).map((method) => `${method.toUpperCase()} ${specPath}`),
    );
    const missing = operations.filter((op) => !covered.has(op) && !(op in SKIPPED));
    const skippedButCalled = Object.keys(SKIPPED).filter((op) => covered.has(op));
    const unknownSkips = Object.keys(SKIPPED).filter((op) => !operations.includes(op));

    expect(
      missing,
      "Spec operations without an SDK method: add one, or a reason in SKIPPED",
    ).toEqual([]);
    expect(
      skippedButCalled,
      "Skipped operations that the SDK calls: remove them from SKIPPED",
    ).toEqual([]);
    expect(unknownSkips, "Skipped operations that the spec no longer has").toEqual([]);
  });
});
