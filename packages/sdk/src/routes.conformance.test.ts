import { describe, expect, it } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

import { Forge } from "./forge.ts";
import { toUrlString } from "./test-utils.ts";

/**
 * Every SDK method that writes must call a route of the Forge OpenAPI spec, and must accept
 * the response that the spec gives for that route. Forge answers many writes with
 * `202 Accepted` and no body: a method that reads a document from that response fails after
 * Forge has made the change.
 *
 * The mock `fetch` answers each request as the spec says: no body when the spec has no
 * response content, a JSON:API document when it has one.
 */

const SPEC_PATH = path.resolve(import.meta.dirname, "../../../docs/forge-openapi-v2.json");
const RESOURCES_DIR = path.resolve(import.meta.dirname, "resources");

interface SpecOperation {
  responses?: Record<string, { content?: Record<string, unknown> }>;
}

const spec = JSON.parse(fs.readFileSync(SPEC_PATH, "utf-8")) as {
  paths: Record<string, Record<string, SpecOperation>>;
};

const ORG = "test-org";

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

/**
 * Whether the spec gives a body for the success response of an operation.
 */
function hasBody(operation: SpecOperation): boolean {
  return Object.entries(operation.responses ?? {}).some(
    ([status, response]) =>
      status.startsWith("2") && Object.keys(response.content ?? {}).length > 0,
  );
}

interface Call {
  method: string;
  pathname: string;
  specPath?: string;
}

function createForge(): { forge: Forge; calls: Call[] } {
  const calls: Call[] = [];

  const forge = new Forge("test-token", ORG, {
    fetch: async (url: string | URL | Request, init?: RequestInit) => {
      const method = init?.method ?? "GET";
      const pathname = new URL(toUrlString(url)).pathname.replace(/^.*?(?=\/orgs\/)/, "");
      const match = findOperation(method, pathname);
      calls.push({ method, pathname, specPath: match?.specPath });

      if (!match) {
        // Forge would answer 404. Answer without a body so that the test reports the route.
        return new Response(null, { status: 204 });
      }

      if (!hasBody(match.operation)) {
        // What Forge sends for an async write: a status without content.
        return new Response(null, { status: method === "DELETE" ? 204 : 202 });
      }

      return new Response(
        JSON.stringify({ data: { id: "1", type: "resource", attributes: { name: "test" } } }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    },
  });

  return { forge, calls };
}

type WriteCase = [name: string, run: (forge: Forge) => Promise<unknown>];

const server = (forge: Forge) => forge.server(1);
const site = (forge: Forge) => forge.server(1).site(2);

const WRITE_CASES: WriteCase[] = [
  // Organization
  ["servers.create", (f) => f.servers.create({ name: "web-1" } as never)],
  ["servers.delete", (f) => f.servers.delete(1)],
  ["servers.reboot", (f) => f.servers.reboot(1)],
  ["recipes.create", (f) => f.recipes.create({ name: "r", script: "ls" } as never)],
  ["recipes.delete", (f) => f.recipes.delete(3)],
  ["recipes.run", (f) => f.recipes.run(3, { servers: [1] })],
  ["storageProviders.create", (f) => f.storageProviders.create({ name: "s3" } as never)],
  ["storageProviders.delete", (f) => f.storageProviders.delete(3)],

  // Server
  ["server.reboot", (f) => server(f).reboot()],
  ["server.delete", (f) => server(f).delete()],
  ["backups.create", (f) => server(f).backups.create({} as never)],
  ["backups.delete", (f) => server(f).backups.delete(3)],
  ["daemons.create", (f) => server(f).daemons.create({ command: "x" } as never)],
  ["daemons.delete", (f) => server(f).daemons.delete(3)],
  ["daemons.restart", (f) => server(f).daemons.restart(3)],
  ["databases.create", (f) => server(f).databases.create({ name: "db" } as never)],
  ["databases.delete", (f) => server(f).databases.delete(3)],
  ["databaseUsers.create", (f) => server(f).databaseUsers.create({ name: "u" } as never)],
  ["databaseUsers.delete", (f) => server(f).databaseUsers.delete(3)],
  ["firewallRules.create", (f) => server(f).firewallRules.create({ name: "HTTP", port: 80 })],
  ["firewallRules.delete", (f) => server(f).firewallRules.delete(3)],
  ["monitors.create", (f) => server(f).monitors.create({ type: "disk" } as never)],
  ["monitors.delete", (f) => server(f).monitors.delete(3)],
  ["nginxTemplates.create", (f) => server(f).nginxTemplates.create({ name: "t" } as never)],
  ["nginxTemplates.update", (f) => server(f).nginxTemplates.update(3, { name: "t" })],
  ["nginxTemplates.delete", (f) => server(f).nginxTemplates.delete(3)],
  ["php.updateConfig", (f) => server(f).php.updateConfig(3, "fpm", "x")],
  ["php.setMaxUploadSize", (f) => server(f).php.setMaxUploadSize(64)],
  ["php.setMaxExecutionTime", (f) => server(f).php.setMaxExecutionTime(60)],
  ["php.enableOpcache", (f) => server(f).php.enableOpcache()],
  ["php.disableOpcache", (f) => server(f).php.disableOpcache()],
  ["scheduledJobs.create", (f) => server(f).scheduledJobs.create({ command: "x" } as never)],
  ["scheduledJobs.delete", (f) => server(f).scheduledJobs.delete(3)],
  ["services.restart", (f) => server(f).services.restart("nginx")],
  ["sshKeys.create", (f) => server(f).sshKeys.create({ name: "k", key: "ssh-ed25519 x" })],
  ["sshKeys.delete", (f) => server(f).sshKeys.delete(3)],
  ["sites.create", (f) => server(f).sites.create({ domain: "example.com" } as never)],
  ["sites.update", (f) => server(f).sites.update(2, { directory: "/public" } as never)],
  ["sites.delete", (f) => server(f).sites.delete(2)],

  // Site
  ["site.deploy", (f) => site(f).deploy()],
  ["site.delete", (f) => site(f).delete()],
  ["site.env.update", (f) => site(f).env.update("APP_ENV=production")],
  ["site.nginx.update", (f) => site(f).nginx.update("server {}")],
  ["certificates.create", (f) => site(f).certificates.create(3, { type: "letsencrypt" } as never)],
  ["certificates.delete", (f) => site(f).certificates.delete(3)],
  ["certificates.activate", (f) => site(f).certificates.activate(3)],
  ["commands.create", (f) => site(f).commands.create({ command: "php artisan migrate" })],
  ["deployments.updateScript", (f) => site(f).deployments.updateScript("git pull")],
  ["redirectRules.create", (f) => site(f).redirectRules.create({ from: "/a", to: "/b" } as never)],
  ["redirectRules.delete", (f) => site(f).redirectRules.delete(3)],
  ["securityRules.create", (f) => site(f).securityRules.create({ name: "s" } as never)],
  ["securityRules.delete", (f) => site(f).securityRules.delete(3)],
];

/**
 * Count the write calls in the resource sources, to make sure each one has a case above.
 */
function countWriteCalls(): number {
  return fs
    .readdirSync(RESOURCES_DIR)
    .filter((file) => file.endsWith(".ts") && !file.endsWith(".test.ts"))
    .reduce((count, file) => {
      const source = fs.readFileSync(path.join(RESOURCES_DIR, file), "utf-8");
      return count + (source.match(/this\.client\.(post|put|patch|delete)\b/g)?.length ?? 0);
    }, 0);
}

describe("SDK write routes conform to the OpenAPI spec", () => {
  it("has a case for each write call of the SDK", () => {
    expect(WRITE_CASES.length, "A write method was added or removed: update WRITE_CASES").toBe(
      countWriteCalls(),
    );
  });

  for (const [name, run] of WRITE_CASES) {
    it(name, async () => {
      const { forge, calls } = createForge();

      await run(forge);

      expect(calls).toHaveLength(1);
      expect(
        calls[0].specPath,
        `No spec route for ${calls[0].method} ${calls[0].pathname}`,
      ).toBeDefined();
    });
  }
});
