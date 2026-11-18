import { resolve } from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("node:fs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:fs")>();
  return { ...actual, readFileSync: vi.fn() };
});

import { readFileSync } from "node:fs";

import { createTestContext } from "../../../context.ts";
import { fakeForge, node, site } from "../../sites/apply/test-fixtures.ts";
import type { FakeForge } from "../../sites/apply/test-fixtures.ts";
import { loadBalancerApply } from "./handler.ts";

const SITE = { domain: "www.example.com", aliases: ["example.com"] };

function files(balancer: unknown): void {
  const content: Record<string, unknown> = {
    "load-balancer.json": balancer,
    "production/site.json": { ...SITE, server: "web-1" },
    "production-2/site.json": { ...SITE, server: 124 },
  };
  vi.mocked(readFileSync).mockImplementation(((path: string) => {
    const relative = resolve(path).replace(`${resolve(".")}/`, "");
    if (!(relative in content)) throw new Error(`ENOENT: ${relative}`);
    return JSON.stringify(content[relative]);
  }) as never);
}

const balancer = {
  server: "lb-1",
  nodes: [{ environment: "production" }, { environment: "production-2", weight: 2 }],
};

/** The site of the load balancer as the file declares it. */
const inSync: Partial<FakeForge> = {
  balancerSites: [site(600, "www.example.com")],
  balancerDomains: { 600: ["example.com"] },
  nodes: { 600: [node(123), node(124, { weight: 2 })] },
};

function context(
  format: "human" | "json",
  options: Record<string, unknown>,
  initial: Partial<FakeForge> = {},
) {
  const forge = fakeForge({
    sites: [site(456, "www.example.com")],
    otherSites: [site(457, "www.example.com")],
    ...initial,
  });
  const ctx = createTestContext({
    mockClient: forge.ctx.client,
    options: { format, "no-color": true, ...options } as never,
  });
  return { ctx, forge };
}

function output(): string {
  return [...vi.mocked(console.log).mock.calls, ...vi.mocked(console.error).mock.calls]
    .map((call) => call.join(" "))
    .join("\n");
}

function writes(forge: ReturnType<typeof fakeForge>) {
  return forge.calls.filter(([method]) => method !== "GET");
}

describe("loadBalancerApply", () => {
  let exitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    exitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    process.exitCode = undefined;
    files(balancer);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.exitCode = undefined;
  });

  it("needs --file", async () => {
    const { ctx } = context("json", {});

    await loadBalancerApply(ctx).catch(() => {});

    expect(exitSpy).toHaveBeenCalledWith(3);
  });

  it("exits 3 on an invalid file", async () => {
    files({ server: "lb-1", nodes: [], loadBalancer: {} });
    const { ctx } = context("json", { file: "load-balancer.json", check: true });

    await loadBalancerApply(ctx);

    expect(exitSpy).toHaveBeenCalledWith(3);
  });

  it("exits 3 before any change when the site of a node does not exist", async () => {
    const { ctx, forge } = context("json", { file: "load-balancer.json" }, { otherSites: [] });

    await loadBalancerApply(ctx);

    expect(exitSpy).toHaveBeenCalledWith(3);
    expect(writes(forge)).toEqual([]);
  });

  it("prints the plan with --check and exits 1 when Forge differs", async () => {
    const { ctx, forge } = context("human", { file: "load-balancer.json", check: true });

    await loadBalancerApply(ctx);

    expect(process.exitCode).toBe(1);
    const text = output();
    expect(text).toContain(
      "+ create load balancer site www.example.com (method: round_robin): server 123:80, server 124:80 weight 2",
    );
    expect(text).toContain("+ add alias example.com");
    expect(text).toContain("Load balancer site www.example.com differs from Forge.");
    expect(writes(forge)).toEqual([]);
  });

  it("prints JSON with --check and exits 0 when Forge matches", async () => {
    const { ctx } = context("json", { file: "load-balancer.json", check: true }, inSync);

    await loadBalancerApply(ctx);

    expect(process.exitCode).toBeUndefined();
    expect(JSON.parse(String(vi.mocked(console.log).mock.calls[0][0]))).toEqual({
      inSync: true,
      changes: [],
    });
  });

  it("says in sync with --check in human output", async () => {
    const { ctx } = context("human", { file: "load-balancer.json", check: true }, inSync);

    await loadBalancerApply(ctx);

    expect(output()).toContain("Load balancer site www.example.com is in sync with Forge.");
  });

  it("applies the changes and prints each one", async () => {
    const { ctx, forge } = context(
      "human",
      { file: "load-balancer.json" },
      { ...inSync, nodes: { 600: [node(123)] } },
    );

    await loadBalancerApply(ctx);

    expect(writes(forge).map(([method, url]) => `${method} ${url}`)).toEqual([
      "PUT /orgs/test-org/servers/300/sites/600/load-balancing-nodes",
    ]);
    const text = output();
    expect(text).toContain(
      "~ update load balancer nodes of www.example.com (method: round_robin): server 123:80 → server 123:80, server 124:80 weight 2",
    );
    expect(text).toContain("Load balancer site www.example.com applied: 1 change(s).");
  });

  it("applies with JSON output and nothing to do", async () => {
    const { ctx } = context("json", { file: "load-balancer.json" }, inSync);

    await loadBalancerApply(ctx);

    expect(JSON.parse(String(vi.mocked(console.log).mock.calls[0][0]))).toEqual({ changes: [] });
  });

  it("says in sync when apply has nothing to do", async () => {
    const { ctx } = context("human", { file: "load-balancer.json" }, inSync);

    await loadBalancerApply(ctx);

    expect(output()).toContain("Load balancer site www.example.com is in sync with Forge.");
  });
});
