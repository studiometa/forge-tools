import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("node:fs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:fs")>();
  return { ...actual, readFileSync: vi.fn() };
});

import { readFileSync } from "node:fs";

import { createTestContext } from "../../../context.ts";
import { sitesApply } from "./handler.ts";
import { daemon, fakeForge, site } from "./test-fixtures.ts";

const A = "/home/forge/a.example.com";

function siteFile(data: unknown): void {
  vi.mocked(readFileSync).mockReturnValue(JSON.stringify(data));
}

function context(format: "human" | "json", options: Record<string, unknown>) {
  const forge = fakeForge({
    sites: [site(456, "a.example.com"), site(457, "a.example.com-staging")],
    daemons: [
      daemon(1, `php ${A}/artisan queue:work`, `${A}/`),
      daemon(2, "php artisan queue:work", "/home/forge/a.example.com-staging/"),
    ],
    env: "APP_ENV=secret-value\n",
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

describe("sitesApply", () => {
  let exitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    exitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    process.exitCode = undefined;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.exitCode = undefined;
  });

  it("needs --file", async () => {
    const { ctx } = context("json", {});

    await sitesApply(ctx).catch(() => {});

    expect(exitSpy).toHaveBeenCalledWith(3);
  });

  it("exits 3 on an invalid site file", async () => {
    siteFile({ server: 123 });
    const { ctx } = context("json", { file: "site.json", check: true });

    await sitesApply(ctx);

    expect(exitSpy).toHaveBeenCalledWith(3);
  });

  it("exits 3 on an unknown variable in the Nginx file, before any call", async () => {
    vi.mocked(readFileSync).mockImplementation((path) =>
      String(path).endsWith("site.json")
        ? JSON.stringify({ server: 123, domain: "a.example.com", nginx: "nginx.conf" })
        : "root {{ WEBROOT }};",
    );
    const { ctx, forge } = context("json", { file: "site.json", check: true });

    await sitesApply(ctx);

    expect(exitSpy).toHaveBeenCalledWith(3);
    expect(forge.calls).toEqual([]);
  });

  it("prints the Nginx diff with --check and exits 1", async () => {
    vi.mocked(readFileSync).mockImplementation((path) =>
      String(path).endsWith("site.json")
        ? JSON.stringify({ server: 123, domain: "a.example.com", nginx: "nginx.conf" })
        : "root {{ PATH }};\n",
    );
    const { ctx, forge } = context("json", { file: "site.json", check: true });

    await sitesApply(ctx);

    expect(process.exitCode).toBe(1);
    expect(JSON.parse(String(vi.mocked(console.log).mock.calls[0][0]))).toEqual({
      inSync: false,
      changes: [
        {
          action: "update-nginx",
          diff: "--- remote\n+++ local\n@@ -0,0 +1,1 @@\n+root /home/forge/a.example.com/public;",
        },
      ],
      warnings: [],
    });
    expect(forge.calls.filter(([method]) => method !== "GET")).toEqual([]);
  });

  it("exits 0 with --check when Forge matches", async () => {
    siteFile({
      server: 123,
      domain: "a.example.com",
      workers: [{ command: "php artisan queue:work" }],
    });
    const { ctx, forge } = context("human", { file: "site.json", check: true });

    await sitesApply(ctx);

    expect(process.exitCode).toBeUndefined();
    expect(output()).toContain("Site a.example.com is in sync with Forge.");
    expect(forge.calls.filter(([method]) => method !== "GET")).toEqual([]);
  });

  it("prints the plan and exits 1 with --check when Forge differs, without changes", async () => {
    siteFile({
      server: 123,
      domain: "a.example.com",
      env: { APP_ENV: "production", NEW_KEY: "new-value" },
      workers: [],
    });
    const { ctx, forge } = context("human", { file: "site.json", check: true });

    await sitesApply(ctx);

    expect(process.exitCode).toBe(1);
    const text = output();
    expect(text).toContain("+ add .env keys: NEW_KEY");
    expect(text).toContain(
      `- delete worker 1: php ${A}/artisan queue:work (directory: ${A}/, processes: 1)`,
    );
    expect(text).toContain(".env key APP_ENV has another value on Forge");
    expect(text).toContain("Site a.example.com differs from Forge.");
    expect(text).not.toContain("secret-value");
    expect(text).not.toContain("new-value");
    expect(text).not.toContain("staging");
    expect(forge.calls.filter(([method]) => method !== "GET")).toEqual([]);
  });

  it("prints JSON with --check", async () => {
    siteFile({ server: 123, domain: "a.example.com", workers: [] });
    const { ctx } = context("json", { file: "site.json", check: true });

    await sitesApply(ctx);

    expect(JSON.parse(vi.mocked(console.log).mock.calls[0][0] as string)).toEqual({
      inSync: false,
      changes: [
        {
          action: "delete-worker",
          id: 1,
          command: `php ${A}/artisan queue:work`,
          directory: `${A}/`,
          processes: 1,
        },
      ],
      warnings: [],
    });
    expect(process.exitCode).toBe(1);
  });

  it("exits 3 with --check when a missing site has no type", async () => {
    siteFile({ server: 123, domain: "new.example.com" });
    const { ctx } = context("json", { file: "site.json", check: true });

    await sitesApply(ctx);

    expect(exitSpy).toHaveBeenCalledWith(3);
  });

  it("applies the changes and prints each one", async () => {
    siteFile({ server: 123, domain: "a.example.com", workers: [] });
    const { ctx, forge } = context("human", { file: "site.json" });

    await sitesApply(ctx);

    expect(forge.calls.filter(([method]) => method !== "GET")).toEqual([
      ["DELETE", "/orgs/test-org/servers/123/background-processes/1"],
    ]);
    const text = output();
    expect(text).toContain(`- delete worker 1: php ${A}/artisan queue:work`);
    expect(text).toContain("Site a.example.com applied: 1 change(s).");
    expect(process.exitCode).toBeUndefined();
  });

  it("applies with JSON output and nothing to do", async () => {
    siteFile({ server: 123, domain: "a.example.com" });
    const { ctx } = context("json", { file: "site.json" });

    await sitesApply(ctx);

    expect(JSON.parse(vi.mocked(console.log).mock.calls[0][0] as string)).toEqual({
      changes: [],
      warnings: [],
    });
  });

  it("says in sync when apply has nothing to do", async () => {
    siteFile({ server: 123, domain: "a.example.com", aliases: ["a.example.com"] });
    const { ctx } = context("human", { file: "site.json" });

    await sitesApply(ctx);

    expect(output()).toContain("Site a.example.com is in sync with Forge.");
  });
});
