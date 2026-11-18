import { resolve } from "node:path";

import * as v from "valibot";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("node:fs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:fs")>();
  return { ...actual, readFileSync: vi.fn() };
});

import { readFileSync } from "node:fs";

import {
  LOAD_BALANCER_FILE_SCHEMA_URL,
  LoadBalancerFileSchema,
  NodeSchema,
  parseLoadBalancerFile,
  readLoadBalancerFile,
} from "./balancer-file.ts";

/** Mock the files on disk: the load balancer file and the site file of each environment. */
function files(content: Record<string, unknown>): void {
  vi.mocked(readFileSync).mockImplementation(((path: string) => {
    const relative = resolve(path).replace(`${resolve("config/forge")}/`, "");
    if (!(relative in content)) throw new Error(`ENOENT: ${relative}`);
    const value = content[relative];
    return typeof value === "string" ? value : JSON.stringify(value);
  }) as never);
}

const balancer = {
  server: "lb-1",
  nodes: [{ environment: "production" }, { environment: "production-2", weight: 2, backup: true }],
};

function issues(data: unknown): string[] {
  try {
    parseLoadBalancerFile(data);
    return [];
  } catch (error) {
    return (error as { hints: string[] }).hints;
  }
}

describe("parseLoadBalancerFile", () => {
  it("applies the defaults", () => {
    expect(parseLoadBalancerFile(balancer)).toEqual({
      server: "lb-1",
      method: "round_robin",
      nodes: [
        { environment: "production", port: 80, weight: 1, backup: false, down: false },
        { environment: "production-2", port: 80, weight: 2, backup: true, down: false },
      ],
    });
  });

  it("refuses unknown keys, no node, duplicate environments and invalid values", () => {
    expect(issues({ ...balancer, loadBalancer: {} })).toHaveLength(1);
    expect(issues({ ...balancer, nodes: [{ environment: "production", host: "x" }] })).toHaveLength(
      1,
    );
    expect(issues({ ...balancer, nodes: [] })).toHaveLength(1);
    expect(
      issues({
        ...balancer,
        nodes: [{ environment: "production" }, { environment: "production" }],
      }),
    ).toEqual(["nodes: nodes[1] declares environment production again"]);
    expect(issues({ ...balancer, method: "random" })).toHaveLength(1);
    expect(issues({ ...balancer, nodes: [{ environment: ".." }] })).toHaveLength(1);
    expect(issues({ ...balancer, nodes: [{ environment: "a/b" }] })).toHaveLength(1);
    expect(issues({ ...balancer, nodes: [{ environment: "a", port: 0, weight: 0 }] })).toHaveLength(
      2,
    );
  });
});

describe("readLoadBalancerFile", () => {
  const path = "config/forge/load-balancer.json";

  beforeEach(() => {
    vi.mocked(readFileSync).mockReset();
  });

  it("reads the site file of each node", () => {
    files({
      "load-balancer.json": balancer,
      "production/site.json": {
        server: "web-1",
        domain: "www.example.com",
        aliases: ["example.com", "example.com"],
      },
      "production-2/site.json": {
        server: "web-10",
        domain: "WWW.example.com",
        aliases: ["Example.com"],
        wildcards: false,
      },
    });
    const file = readLoadBalancerFile(path);
    expect(file.domain).toBe("www.example.com");
    expect(file.aliases).toEqual(["example.com"]);
    expect(file.wildcards).toBe(false);
    expect(file.sites.map((site) => [site.node.environment, site.path, site.file.server])).toEqual([
      ["production", resolve("config/forge/production/site.json"), "web-1"],
      ["production-2", resolve("config/forge/production-2/site.json"), "web-10"],
    ]);
  });

  it("refuses site files that declare another site", () => {
    const site = { server: "web-1", domain: "www.example.com" };
    files({
      "load-balancer.json": balancer,
      "production/site.json": site,
      "production-2/site.json": { ...site, domain: "other.example.com" },
    });
    expect(() => readLoadBalancerFile(path)).toThrow(
      "The site files of the nodes declare different domains: production (www.example.com), production-2 (other.example.com)",
    );
    files({
      "load-balancer.json": balancer,
      "production/site.json": site,
      "production-2/site.json": { ...site, aliases: ["example.com"] },
    });
    expect(() => readLoadBalancerFile(path)).toThrow(
      "different aliases: production (none), production-2 (example.com)",
    );
    files({
      "load-balancer.json": balancer,
      "production/site.json": site,
      "production-2/site.json": { ...site, wildcards: true },
    });
    expect(() => readLoadBalancerFile(path)).toThrow(
      "different wildcards: production (false), production-2 (true)",
    );
  });

  it("refuses a missing site file", () => {
    files({
      "load-balancer.json": balancer,
      "production/site.json": { server: "web-1", domain: "www.example.com" },
    });
    expect(() => readLoadBalancerFile(path)).toThrow(
      `Cannot read site file ${resolve("config/forge/production-2/site.json")}`,
    );
  });

  it("refuses a missing file, invalid JSON and an invalid file", () => {
    files({});
    expect(() => readLoadBalancerFile(path)).toThrow(`Cannot read load balancer file ${path}`);
    files({ "load-balancer.json": "{" });
    expect(() => readLoadBalancerFile(path)).toThrow(
      `Load balancer file ${path} is not valid JSON`,
    );
    files({ "load-balancer.json": {} });
    expect(() => readLoadBalancerFile(path)).toThrow(`Invalid load balancer file ${path}`);
  });

  it("reports errors that are not Error objects", () => {
    vi.mocked(readFileSync).mockImplementation(() => {
      // oxlint-disable-next-line no-throw-literal -- a value that is not an Error
      throw "denied";
    });
    expect(() => readLoadBalancerFile(path)).toThrow("denied");
  });
});

const actualFs = await vi.importActual<typeof import("node:fs")>("node:fs");

describe("load-balancer.schema.json", () => {
  const schema = JSON.parse(
    actualFs.readFileSync(
      resolve(import.meta.dirname, "../../../../schemas/load-balancer.schema.json"),
      "utf8",
    ),
  );

  it("is published at the URL of $schema", () => {
    expect(schema.$id).toBe(LOAD_BALANCER_FILE_SCHEMA_URL);
  });

  it("has the keys and enums of the valibot schema", () => {
    expect(Object.keys(schema.properties).toSorted()).toEqual(
      Object.keys(LoadBalancerFileSchema.entries).toSorted(),
    );
    expect(Object.keys(schema.properties.nodes.items.properties).toSorted()).toEqual(
      Object.keys(NodeSchema.entries).toSorted(),
    );
    expect(schema.properties.method.enum).toEqual(
      LoadBalancerFileSchema.entries.method.wrapped.options,
    );
    const pattern = new RegExp(schema.properties.nodes.items.properties.environment.pattern);
    for (const name of ["production", "a.b_c-1", ".", "..", "a/b"]) {
      expect(pattern.test(name)).toBe(v.is(NodeSchema.entries.environment, name));
    }
  });
});
