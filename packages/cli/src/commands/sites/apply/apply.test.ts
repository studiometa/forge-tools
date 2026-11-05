import { describe, expect, it, vi } from "vitest";

import { ValidationError } from "../../../errors.ts";
import {
  ApplyError,
  applySiteFile,
  assertCanCreateSite,
  findSite,
  formatEnvValue,
  generatePassword,
  readRemoteState,
  resolveApplyServer,
  setEnvValues,
} from "./apply.ts";
import type { Change } from "./plan.ts";
import type { SiteFile } from "./site-file.ts";
import { daemon, fakeForge, job, site } from "./test-fixtures.ts";

const A = "/home/forge/a.example.com";
const sibling = site(457, "a.example.com-staging");

describe("resolveApplyServer", () => {
  it("keeps a numeric ID without a call", async () => {
    const { ctx, calls } = fakeForge();
    expect(await resolveApplyServer(123, ctx)).toBe("123");
    expect(calls).toEqual([]);
  });

  it("needs an exact name, even when exact matching is off", async () => {
    const { ctx } = fakeForge();
    expect(await resolveApplyServer("web-1", ctx)).toBe("123");
    await expect(resolveApplyServer("web", ctx)).rejects.toThrow(ValidationError);
  });
});

describe("findSite", () => {
  it("matches the whole domain only", () => {
    const sites = [site(456, "a.example.com"), sibling];
    expect(findSite(sites, "A.example.com")?.id).toBe(456);
    expect(findSite(sites, "a.example")).toBeNull();
  });
});

describe("assertCanCreateSite", () => {
  it("needs a type to create a site", () => {
    expect(() =>
      assertCanCreateSite({ server: 1, domain: "a.example.com" }, { sites: [], site: null }),
    ).toThrow(ValidationError);
    expect(() =>
      assertCanCreateSite(
        { server: 1, domain: "a.example.com", type: "php" },
        { sites: [], site: null },
      ),
    ).not.toThrow();
  });
});

describe("readRemoteState", () => {
  it("reads only what the file manages", async () => {
    const { ctx, calls } = fakeForge({ sites: [site(456, "a.example.com")] });
    const state = await readRemoteState({ server: 123, domain: "a.example.com" }, "123", ctx);

    expect(state.site?.id).toBe(456);
    expect(calls).toEqual([["GET", "/orgs/org/servers/123/sites"]]);
  });

  it("reads the site lists of Forge for ownership", async () => {
    const { ctx } = fakeForge({
      sites: [site(456, "a.example.com")],
      daemons: [daemon(1, "php artisan x", A), daemon(2, "php y", null)],
      siteDaemonIds: [2],
      jobs: [job(10, "php artisan schedule:run"), job(11, "composer self-update")],
      siteJobIds: [10],
    });
    const state = await readRemoteState(
      { server: 123, domain: "a.example.com", workers: [], schedule: [] },
      "123",
      ctx,
    );

    expect(state.daemons?.map((d) => d.id)).toEqual([1, 2]);
    expect([...state.siteDaemonIds!]).toEqual([2]);
    expect(state.jobs?.map((j) => j.id)).toEqual([10, 10, 11]);
    expect([...state.siteJobIds!]).toEqual([10]);
  });

  it("reads no site list when the site does not exist", async () => {
    const { ctx, calls } = fakeForge();
    const state = await readRemoteState(
      { server: 123, domain: "a.example.com", env: {}, workers: [], schedule: [] },
      "123",
      ctx,
    );

    expect(state.env).toBeNull();
    expect(state.siteDaemonIds?.size).toBe(0);
    expect(state.siteJobIds?.size).toBe(0);
    expect(calls.map(([, url]) => url)).not.toContain(expect.stringContaining("filter"));
  });
});

describe("generatePassword", () => {
  it("gives 32 letters and digits, different each time", () => {
    const first = generatePassword();
    expect(first).toMatch(/^[A-Za-z0-9]{32}$/);
    expect(generatePassword()).not.toBe(first);
  });
});

describe("formatEnvValue", () => {
  it("quotes only when needed", () => {
    expect(formatEnvValue("production")).toBe("production");
    expect(formatEnvValue("https://example.com/a")).toBe("https://example.com/a");
    expect(formatEnvValue("")).toBe("");
    expect(formatEnvValue("a b $c")).toBe("'a b $c'");
    expect(formatEnvValue(`it's "x"\\`)).toBe(String.raw`"it's \"x\"\\"`);
    expect(formatEnvValue("a\nb")).toBe(String.raw`"a\nb"`);
  });
});

describe("setEnvValues", () => {
  it("replaces existing lines and appends the others", () => {
    const content = "APP_ENV=local\n# comment\nexport DB_PASSWORD=old\nDB_HOST=127.0.0.1";
    expect(
      setEnvValues(
        content,
        new Map([
          ["DB_PASSWORD", "new"],
          ["APP_NAME", "My app"],
        ]),
      ),
    ).toBe("APP_ENV=local\n# comment\nDB_PASSWORD=new\nDB_HOST=127.0.0.1\nAPP_NAME='My app'\n");
    expect(setEnvValues("", new Map([["A", "1"]]))).toBe("A=1\n");
  });
});

describe("applySiteFile", () => {
  it("changes nothing when the site matches", async () => {
    const { ctx, calls } = fakeForge({
      sites: [site(456, "a.example.com"), sibling],
      daemons: [daemon(1, `php ${A}/artisan queue:work 'database'`, `${A}/`)],
      jobs: [job(10, `php ${A}/artisan schedule:run`)],
      siteJobIds: [10],
    });
    const plan = await applySiteFile(
      {
        server: 123,
        domain: "a.example.com",
        workers: [{ command: "php artisan queue:work database", processes: 1 }],
        schedule: [{ command: "php artisan schedule:run", frequency: "minutely" }],
      },
      "123",
      ctx,
    );

    expect(plan.changes).toEqual([]);
    expect(calls.filter(([method]) => method !== "GET")).toEqual([]);
  });

  it("creates first, then deletes only what belongs to the site", async () => {
    const { ctx, calls } = fakeForge({
      sites: [site(456, "a.example.com"), sibling],
      daemons: [
        daemon(1, "php artisan queue:work --queue=old", A),
        daemon(2, "php artisan queue:work", "/home/forge/a.example.com-staging/"),
        daemon(3, "php artisan horizon", A, { user: "root" }),
      ],
      jobs: [
        job(10, `php ${A}/artisan old:run`),
        job(11, `php ${A}/artisan legacy:run`),
        job(12, "/usr/local/bin/composer self-update", { user: "root" }),
        job(13, "php /home/forge/a.example.com-staging/artisan schedule:run"),
      ],
      siteJobIds: [10],
    });
    const changes: Change[] = [];
    await applySiteFile(
      {
        server: 123,
        domain: "a.example.com",
        workers: [{ command: "php artisan queue:work --queue=new", processes: 2 }],
        schedule: [{ command: "php artisan schedule:run", frequency: "minutely" }],
      },
      "123",
      ctx,
      { onChange: (change) => changes.push(change) },
    );

    expect(calls.filter(([method]) => method !== "GET")).toEqual([
      [
        "POST",
        "/orgs/org/servers/123/background-processes",
        {
          site_id: 456,
          name: "php artisan queue:work --queue=new",
          command: "php artisan queue:work --queue=new",
          user: "forge",
          directory: A,
          processes: 2,
        },
      ],
      [
        "POST",
        "/orgs/org/servers/123/sites/456/scheduled-jobs",
        { command: `php ${A}/artisan schedule:run`, user: "forge", frequency: "minutely" },
      ],
      ["DELETE", "/orgs/org/servers/123/background-processes/1"],
      ["DELETE", "/orgs/org/servers/123/sites/456/scheduled-jobs/10"],
      ["DELETE", "/orgs/org/servers/123/scheduled-jobs/11"],
    ]);
    expect(changes.map((change) => change.action)).toEqual([
      "create-worker",
      "create-job",
      "delete-worker",
      "delete-job",
      "delete-job",
    ]);
  });

  it("updates the site, adds aliases and .env keys without overwriting", async () => {
    const { ctx, calls, state } = fakeForge({
      sites: [site(456, "a.example.com")],
      env: "APP_ENV=staging\n",
    });
    await applySiteFile(
      {
        server: 123,
        domain: "a.example.com",
        php: "php84",
        webDirectory: "/web",
        repository: {
          provider: "custom",
          url: "https://git.example.com/group/a.example.com.git",
          branch: "prod",
        },
        aliases: ["example.com"],
        env: { APP_ENV: "production", APP_DEBUG: false },
      },
      "123",
      ctx,
    );

    expect(calls.filter(([method]) => method !== "GET")).toEqual([
      [
        "PUT",
        "/orgs/org/servers/123/sites/456",
        { php_version: "php84", directory: "/web", repository_branch: "prod" },
      ],
      [
        "POST",
        "/orgs/org/servers/123/sites/456/domains",
        { name: "example.com", allow_wildcard_subdomains: false, www_redirect_type: "none" },
      ],
      [
        "PUT",
        "/orgs/org/servers/123/sites/456/environment",
        { environment: "APP_ENV=staging\nAPP_DEBUG=false\n" },
      ],
    ]);
    expect(state.env).not.toContain("production");
  });

  it("creates the database and user, and writes the password into the .env only", async () => {
    const { ctx, calls, state } = fakeForge({
      sites: [site(456, "a.example.com")],
      env: "DB_PASSWORD=\n",
    });
    const plan = await applySiteFile(
      { server: 123, domain: "a.example.com", database: { name: "example", user: "example_user" } },
      "123",
      ctx,
      { generatePassword: () => "s3cr3t" },
    );

    expect(calls.filter(([method]) => method === "POST")).toEqual([
      ["POST", "/orgs/org/servers/123/database/schemas", { name: "example" }],
      [
        "POST",
        "/orgs/org/servers/123/database/users",
        { name: "example_user", password: "s3cr3t", database_ids: [70] },
      ],
    ]);
    expect(state.env).toBe("DB_PASSWORD=s3cr3t\nDB_DATABASE=example\nDB_USERNAME=example_user\n");
    expect(JSON.stringify(plan)).not.toContain("s3cr3t");
  });

  it("creates a missing site, waits until it is installed, then applies the rest", async () => {
    const sleep = vi.fn(async () => {});
    const { ctx, calls, state } = fakeForge({
      sites: [sibling],
      daemons: [daemon(2, "php artisan queue:work", "/home/forge/a.example.com-staging")],
      newSiteStatuses: ["installing", "installing", "installed"],
    });
    const file: SiteFile = {
      server: 123,
      domain: "a.example.com",
      type: "php",
      php: "php83",
      webDirectory: "/public",
      repository: {
        provider: "custom",
        url: "https://git.example.com/group/a.git",
        branch: "main",
      },
      database: { name: "example", user: "example" },
      env: { APP_ENV: "production" },
      workers: [{ command: "php artisan queue:work", processes: 1 }],
    };

    const plan = await applySiteFile(file, "123", ctx, {
      sleep,
      pollIntervalMs: 10,
      generatePassword: () => "pw",
    });

    expect(plan.changes[0]).toMatchObject({ action: "create-site" });
    expect(sleep).toHaveBeenCalledTimes(2);
    const writes = calls.filter(([method]) => method !== "GET");
    expect(writes.map(([method, url]) => `${method} ${url}`)).toEqual([
      "POST /orgs/org/servers/123/database/schemas",
      "POST /orgs/org/servers/123/database/users",
      "POST /orgs/org/servers/123/sites",
      "PUT /orgs/org/servers/123/sites/999/environment",
      "POST /orgs/org/servers/123/background-processes",
    ]);
    expect(writes[2][2]).toEqual({
      type: "php",
      name: "a.example.com",
      php_version: "php83",
      web_directory: "/public",
      source_control_provider: "custom",
      repository: "https://git.example.com/group/a.git",
      branch: "main",
      database_id: 70,
      database_user_id: "71",
    });
    expect(state.env).toBe(
      "DB_DATABASE=example\nDB_USERNAME=example\nDB_PASSWORD=pw\nAPP_ENV=production\n",
    );
  });

  it("stops when a new site is not installed in time", async () => {
    const { ctx } = fakeForge({ newSiteStatuses: ["installing", "installing", "installing"] });

    await expect(
      applySiteFile({ server: 123, domain: "a.example.com", type: "php" }, "123", ctx, {
        sleep: async () => {},
        pollIntervalMs: 10,
        timeoutMs: 20,
      }),
    ).rejects.toThrow(ApplyError);
  });

  it("refuses to create a site without a type", async () => {
    const { ctx, calls } = fakeForge();

    await expect(
      applySiteFile({ server: 123, domain: "a.example.com" }, "123", ctx),
    ).rejects.toThrow(ValidationError);
    expect(calls.filter(([method]) => method !== "GET")).toEqual([]);
  });
});
