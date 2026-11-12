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
import { daemon, fakeForge, job, node, site } from "./test-fixtures.ts";

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
  it("reads and renders the Nginx file of an existing site", async () => {
    const { ctx } = fakeForge({ sites: [site(456, "a.example.com")], nginx: "root /old;" });
    const state = await readRemoteState(
      { server: 123, domain: "a.example.com", nginxTemplate: "root {{ PATH }};" },
      "123",
      ctx,
    );

    expect(state.nginx).toEqual({
      remote: "root /old;",
      rendered: "root /home/forge/a.example.com/public;",
    });
  });

  it("reads no Nginx configuration when the site does not exist", async () => {
    const { ctx } = fakeForge();
    const state = await readRemoteState(
      { server: 123, domain: "a.example.com", nginxTemplate: "root {{ PATH }};" },
      "123",
      ctx,
    );

    expect(state.nginx).toBeNull();
  });

  it("reads the domains of the site for the aliases", async () => {
    const { ctx } = fakeForge({
      sites: [site(456, "www.example.com", { aliases: null })],
      domains: { 456: ["example.com"] },
    });
    const state = await readRemoteState(
      { server: 123, domain: "www.example.com", aliases: ["example.com"] },
      "123",
      ctx,
    );

    expect(state.domains).toEqual(["www.example.com", "example.com"]);
  });

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

  it("adds no alias that the domains of the site have, although the site has null aliases", async () => {
    const { ctx, calls } = fakeForge({
      sites: [site(3494248, "www.luxfilmfest.lu", { aliases: null })],
      domains: { 3494248: ["luxfilmfest.staging.ikko.fr"] },
    });
    const plan = await applySiteFile(
      { server: 123, domain: "www.luxfilmfest.lu", aliases: ["luxfilmfest.staging.ikko.fr"] },
      "123",
      ctx,
    );

    expect(plan.changes).toEqual([]);
    expect(calls.filter(([method]) => method !== "GET")).toEqual([]);
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
      domain_mode: "custom",
      www_redirect_type: "none",
      allow_wildcard_subdomains: false,
      php_version: "php83",
      web_directory: "/public",
      source_control_provider: "custom",
      repository: "https://git.example.com/group/a.git",
      branch: "main",
      database_id: 70,
      database_user_id: "71",
    });
    expect(state.env).toBe(
      "APP_ENV=production\nDB_DATABASE=example\nDB_USERNAME=example\nDB_PASSWORD=pw\n",
    );
  });

  it("replaces the .env that Forge copies from .env.example on a new site", async () => {
    const { ctx, calls, state } = fakeForge();
    // Forge copies .env.example into .env when it creates the site from the repository.
    state.env =
      "DB_HOST=db\nWP_HOME=https://localhost\nAWS_ACCESS_KEY_ID=local\nDB_PASSWORD=local\n";
    const changes: Change[] = [];

    const plan = await applySiteFile(
      {
        server: 123,
        domain: "a.example.com",
        type: "php",
        database: { name: "example", user: "example" },
        env: { DB_HOST: "127.0.0.1", WP_HOME: "https://a.example.com" },
      },
      "123",
      ctx,
      {
        sleep: async () => {},
        pollIntervalMs: 10,
        generatePassword: () => "pw",
        onChange: (change) => changes.push(change),
      },
    );

    expect(plan.changes).toContainEqual({
      action: "add-env",
      keys: ["DB_HOST", "WP_HOME"],
      generated: ["DB_DATABASE", "DB_USERNAME", "DB_PASSWORD"],
      password: "DB_PASSWORD",
      replace: true,
    });
    expect(changes).toContainEqual(expect.objectContaining({ action: "add-env", replace: true }));
    expect(state.env).toBe(
      "DB_HOST=127.0.0.1\nWP_HOME=https://a.example.com\nDB_DATABASE=example\nDB_USERNAME=example\nDB_PASSWORD=pw\n",
    );
    expect(calls.filter(([method]) => method === "PUT").map(([, url]) => url)).toEqual([
      "/orgs/org/servers/123/sites/999/environment",
    ]);
  });

  it("never replaces a value of the .env of an existing site", async () => {
    const { ctx, state } = fakeForge({
      sites: [site(456, "a.example.com")],
      env: "DB_HOST=db\nWP_HOME=https://localhost\n",
    });

    const plan = await applySiteFile(
      {
        server: 123,
        domain: "a.example.com",
        env: { DB_HOST: "127.0.0.1", WP_HOME: "https://localhost", APP_KEY: "key" },
      },
      "123",
      ctx,
    );

    expect(plan.changes).toEqual([{ action: "add-env", keys: ["APP_KEY"], generated: [] }]);
    expect(plan.warnings).toEqual([
      ".env key DB_HOST has another value on Forge: apply does not overwrite it.",
    ]);
    expect(state.env).toBe("DB_HOST=db\nWP_HOME=https://localhost\nAPP_KEY=key\n");
  });

  it("waits until the new database and its user are installed before the next creation", async () => {
    const { ctx, calls } = fakeForge({
      newDatabaseStatuses: ["installing", "installed"],
      newUserStatuses: ["installing", "installed"],
    });
    const file: SiteFile = {
      server: 123,
      domain: "a.example.com",
      type: "php",
      database: { name: "example", user: "example" },
    };

    await applySiteFile(file, "123", ctx, {
      sleep: async () => {},
      pollIntervalMs: 10,
      generatePassword: () => "pw",
    });

    const requests = calls
      .filter(([method, url]) => method === "POST" || /\/database\/\w+\/\d+$/.test(url))
      .map(([method, url]) => `${method} ${url}`);
    expect(requests).toEqual([
      "POST /orgs/org/servers/123/database/schemas",
      "GET /orgs/org/servers/123/database/schemas/70",
      "GET /orgs/org/servers/123/database/schemas/70",
      "POST /orgs/org/servers/123/database/users",
      "GET /orgs/org/servers/123/database/users/71",
      "GET /orgs/org/servers/123/database/users/71",
      "POST /orgs/org/servers/123/sites",
    ]);
  });

  it("stops before the user when the new database is not installed in time", async () => {
    const { ctx, calls } = fakeForge({
      newDatabaseStatuses: ["installing", "installing", "installing"],
    });

    await expect(
      applySiteFile(
        { server: 123, domain: "a.example.com", type: "php", database: { name: "example" } },
        "123",
        ctx,
        { sleep: async () => {}, pollIntervalMs: 10, timeoutMs: 20 },
      ),
    ).rejects.toThrow("Database example is installing on Forge, not installed");
    expect(calls.filter(([method]) => method === "POST").map(([, url]) => url)).toEqual([
      "/orgs/org/servers/123/database/schemas",
    ]);
  });

  it("stops before the site when the new database user fails, and says its password is lost", async () => {
    const { ctx, calls } = fakeForge({ newUserStatuses: ["installing", "failed"] });

    const error = await applySiteFile(
      {
        server: 123,
        domain: "a.example.com",
        type: "php",
        database: { name: "example", user: "example" },
      },
      "123",
      ctx,
      { sleep: async () => {}, pollIntervalMs: 10, generatePassword: () => "pw" },
    ).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApplyError);
    expect((error as ApplyError).message).toBe(
      "Database user example is failed on Forge, not installed",
    );
    expect((error as ApplyError).hints).toEqual([
      "The database user example exists on Forge, but its password was not saved",
      "Delete the database user example on Forge before you run forge sites apply again",
    ]);
    expect(calls.filter(([method]) => method === "POST").map(([, url]) => url)).toEqual([
      "/orgs/org/servers/123/database/schemas",
      "/orgs/org/servers/123/database/users",
    ]);
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

  it("waits with a real timer by default", async () => {
    const { ctx } = fakeForge({ newSiteStatuses: ["installing", "installed"] });

    await applySiteFile({ server: 123, domain: "a.example.com", type: "php" }, "123", ctx, {
      pollIntervalMs: 1,
    });
  });

  it("stops when the new site is not listed after its creation", async () => {
    const forge = fakeForge();
    const post = forge.client.post.getMockImplementation()!;
    forge.client.post.mockImplementation(async (url: string, body: Record<string, unknown>) => {
      const created = await post(url, body);
      forge.state.sites.length = 0;
      forge.state.sites.push(site(999, "other.example.com"));
      return created;
    });

    await expect(
      applySiteFile({ server: 123, domain: "a.example.com", type: "php" }, "123", forge.ctx),
    ).rejects.toThrow("Site a.example.com is not on server 123 after its creation");
  });

  it("refuses to create a site without a type", async () => {
    const { ctx, calls } = fakeForge();

    await expect(
      applySiteFile({ server: 123, domain: "a.example.com" }, "123", ctx),
    ).rejects.toThrow(ValidationError);
    expect(calls.filter(([method]) => method !== "GET")).toEqual([]);
  });
});

describe("applySiteFile with an Nginx file", () => {
  const template = "include forge-conf/{{ SITE_ID }}/server/*;\nroot {{ PATH }};\n";

  it("renders the file for a new site and writes it once the site exists", async () => {
    const { ctx, calls, state } = fakeForge({ newSiteStatuses: ["installing", "installed"] });
    const changes: Change[] = [];
    const plan = await applySiteFile(
      { server: 123, domain: "a.example.com", type: "php", nginxTemplate: template },
      "123",
      ctx,
      { sleep: async () => {}, pollIntervalMs: 1, onChange: (change) => changes.push(change) },
    );

    expect(plan.changes).toEqual([
      expect.objectContaining({ action: "create-site" }),
      { action: "update-nginx", diff: null },
    ]);
    const writes = calls.filter(([method]) => method !== "GET").map(([m, url]) => `${m} ${url}`);
    expect(writes).toEqual([
      "POST /orgs/org/servers/123/sites",
      "PUT /orgs/org/servers/123/sites/999/nginx",
    ]);
    expect(state.nginx).toBe(
      "include forge-conf/999/server/*;\nroot /home/forge/a.example.com/public;\n",
    );
    expect(changes.at(-1)).toMatchObject({
      action: "update-nginx",
      diff: expect.stringContaining("+root"),
    });
  });

  it("writes the rendered file when Forge differs", async () => {
    const { ctx, calls, state } = fakeForge({
      sites: [site(456, "a.example.com")],
      nginx: "include forge-conf/456/server/*;\nroot /home/forge/a.example.com/web;\n",
    });
    const plan = await applySiteFile(
      { server: 123, domain: "a.example.com", nginxTemplate: template },
      "123",
      ctx,
    );

    expect(plan.changes).toEqual([
      {
        action: "update-nginx",
        diff: expect.stringContaining("+root /home/forge/a.example.com/public;"),
      },
    ]);
    expect(calls.filter(([method]) => method !== "GET")).toEqual([
      [
        "PUT",
        "/orgs/org/servers/123/sites/456/nginx",
        { config: "include forge-conf/456/server/*;\nroot /home/forge/a.example.com/public;\n" },
      ],
    ]);
    expect(state.nginx).toContain("/public;");
  });

  it("changes nothing when Forge matches the rendered file", async () => {
    const { ctx, calls } = fakeForge({
      sites: [site(456, "a.example.com")],
      nginx: "include forge-conf/456/server/*;\nroot /home/forge/a.example.com/public;",
    });
    const plan = await applySiteFile(
      { server: 123, domain: "a.example.com", nginxTemplate: template },
      "123",
      ctx,
    );

    expect(plan.changes).toEqual([]);
    expect(calls.filter(([method]) => method !== "GET")).toEqual([]);
    expect(calls.map(([, url]) => url)).not.toContain("/orgs/org/servers/123");
  });

  it("reads the server only for the SERVER_ variables", async () => {
    const { ctx, state } = fakeForge({ sites: [site(456, "a.example.com")] });
    await applySiteFile(
      {
        server: 123,
        domain: "a.example.com",
        nginxTemplate: "allow {{ SERVER_PRIVATE_IP }};\nset_real_ip_from {{ SERVER_PUBLIC_IP }};",
      },
      "123",
      ctx,
    );

    expect(state.nginx).toBe("allow 10.0.0.10;\nset_real_ip_from 203.0.113.10;");
  });

  it("renders again after a change of the site", async () => {
    const forge = fakeForge({
      sites: [site(456, "a.example.com")],
      nginx: "include forge-conf/456/server/*;\nroot /home/forge/a.example.com/public;\n",
    });
    const put = forge.client.put.getMockImplementation()!;
    forge.client.put.mockImplementation(async (url: string, body: Record<string, unknown>) => {
      if (url.endsWith("/sites/456")) {
        forge.state.sites[0] = {
          ...forge.state.sites[0],
          web_directory: "/home/forge/a.example.com/web",
        };
      }
      return put(url, body);
    });

    await applySiteFile(
      { server: 123, domain: "a.example.com", webDirectory: "/web", nginxTemplate: template },
      "123",
      forge.ctx,
    );

    const writes = forge.calls.filter(([method]) => method !== "GET");
    expect(writes.map(([m, url]) => `${m} ${url}`)).toEqual([
      "PUT /orgs/org/servers/123/sites/456",
      "PUT /orgs/org/servers/123/sites/456/nginx",
    ]);
    expect(forge.state.nginx).toContain("root /home/forge/a.example.com/web;");
  });

  it("renders the domains from the domains route, not from the null aliases of the site", async () => {
    const { ctx, calls, state } = fakeForge({
      sites: [site(456, "www.example.com", { aliases: null })],
      domains: { 456: ["example.com"] },
      nginx: "server_name www.example.com example.com;",
    });
    const plan = await applySiteFile(
      {
        server: 123,
        domain: "www.example.com",
        aliases: ["Example.com"],
        nginxTemplate: "server_name {{ DOMAINS }};",
      },
      "123",
      ctx,
    );

    expect(plan.changes).toEqual([]);
    expect(calls.filter(([method]) => method !== "GET")).toEqual([]);
    expect(calls.filter(([, url]) => url.endsWith("/domains"))).toEqual([
      ["GET", "/orgs/org/servers/123/sites/456/domains"],
    ]);
    expect(state.nginx).toBe("server_name www.example.com example.com;");
  });

  it("renders again with the domains after a new alias", async () => {
    const { ctx, calls, state } = fakeForge({
      sites: [site(456, "www.example.com")],
      nginx: "server_name www.example.com;",
    });
    const plan = await applySiteFile(
      {
        server: 123,
        domain: "www.example.com",
        aliases: ["example.com"],
        nginxTemplate: "server_name {{ DOMAINS }};",
      },
      "123",
      ctx,
    );

    expect(plan.changes).toEqual([{ action: "add-alias", name: "example.com" }]);
    expect(calls.filter(([method]) => method !== "GET").map(([m, url]) => `${m} ${url}`)).toEqual([
      "POST /orgs/org/servers/123/sites/456/domains",
      "PUT /orgs/org/servers/123/sites/456/nginx",
    ]);
    expect(calls.map(([, url]) => url)).not.toContain("/orgs/org/sites/456");
    expect(state.nginx).toBe("server_name www.example.com example.com;");
  });

  it("does not read the site again when nothing changes", async () => {
    const { ctx, calls } = fakeForge({ sites: [site(456, "a.example.com")] });
    await applySiteFile(
      { server: 123, domain: "a.example.com", aliases: ["a.example.com"], nginxTemplate: "" },
      "123",
      ctx,
    );

    expect(calls.map(([, url]) => url)).not.toContain("/orgs/org/sites/456");
  });
});

describe("applySiteFile with database .env keys", () => {
  it("writes the generated values into the keys of the file", async () => {
    const { ctx, state } = fakeForge({ sites: [site(456, "a.example.com")] });
    const plan = await applySiteFile(
      {
        server: 123,
        domain: "a.example.com",
        database: {
          name: "example",
          user: "example_user",
          env: { name: "DB_NAME", user: "DB_USER", password: "DB_PASS" },
        },
      },
      "123",
      ctx,
      { generatePassword: () => "s3cr3t" },
    );

    expect(state.env).toBe("DB_NAME=example\nDB_USER=example_user\nDB_PASS=s3cr3t\n");
    expect(JSON.stringify(plan)).not.toContain("s3cr3t");
  });
});

describe("applySiteFile repository hint", () => {
  it("points to the public key of the server when a site with a repository is not installed", async () => {
    const { ctx } = fakeForge({ newSiteStatuses: ["installing", "installing"] });
    const file: SiteFile = {
      server: 123,
      domain: "a.example.com",
      type: "php",
      repository: { provider: "custom", url: "git@git.example.com:group/a.git" },
    };

    const error = await applySiteFile(file, "123", ctx, {
      sleep: async () => {},
      pollIntervalMs: 10,
      timeoutMs: 10,
    }).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApplyError);
    expect((error as ApplyError).hints).toContain(
      "Check that the git host accepts the key of the server: forge servers public-key 123",
    );
  });
});

describe("fakeForge", () => {
  it("rejects a route it does not know", async () => {
    const { client } = fakeForge();
    await expect(client.get("/orgs/org/unknown")).rejects.toThrow("Unexpected GET");
    await expect(client.post("/orgs/org/unknown", {})).rejects.toThrow("Unexpected POST");
  });
});

describe("applySiteFile with a load balancer", () => {
  const file: SiteFile = {
    server: 123,
    domain: "www.example.com",
    aliases: ["example.com"],
    loadBalancer: { server: "lb-1", port: 80 },
  };

  it("finds the site of the load balancer by an alias and moves its node to the server", async () => {
    const { ctx, calls, state } = fakeForge({
      sites: [site(456, "www.example.com")],
      domains: { 456: ["example.com"] },
      balancerSites: [site(600, "example.com"), site(601, "other.example.com")],
      nodes: { 600: [node(124)], 601: [node(124)] },
    });
    const changes: Change[] = [];

    const plan = await applySiteFile(file, "123", ctx, { onChange: (c) => changes.push(c) });

    expect(plan.changes).toEqual([
      {
        action: "update-load-balancer",
        site: "example.com",
        from: [{ server_id: 124, port: 80 }],
        to: { server_id: 123, port: 80 },
      },
    ]);
    expect(changes.map((c) => c.action)).toEqual(["update-load-balancer"]);
    expect(calls.filter(([method]) => method !== "GET")).toEqual([
      [
        "PUT",
        "/orgs/org/servers/300/sites/600/load-balancing-nodes",
        { balancer_method: "round_robin", balancing: [{ server_id: 123, port: 80, weight: 1 }] },
      ],
    ]);
    expect(state.nodes[601]).toEqual([node(124)]);
  });

  it("changes nothing when the node is the server", async () => {
    const { ctx, calls } = fakeForge({
      sites: [site(456, "www.example.com")],
      domains: { 456: ["example.com"] },
      balancerSites: [site(600, "www.example.com")],
      nodes: { 600: [node(123)] },
    });
    expect((await applySiteFile(file, "123", ctx)).changes).toEqual([]);
    expect(calls.filter(([method]) => method !== "GET")).toEqual([]);
  });

  it("sets the node after the creation of a new site", async () => {
    const { ctx, calls } = fakeForge({
      balancerSites: [site(600, "example.com")],
      nodes: { 600: [node(124)] },
    });
    await applySiteFile({ ...file, type: "php" }, "123", ctx);
    const writes = calls.filter(([method]) => method !== "GET").map(([m, url]) => `${m} ${url}`);
    expect(writes[0]).toBe("POST /orgs/org/servers/123/sites");
    expect(writes.at(-1)).toBe("PUT /orgs/org/servers/300/sites/600/load-balancing-nodes");
  });

  it("stops before any change when the load balancer has no site", async () => {
    const { ctx, calls } = fakeForge({ balancerSites: [site(601, "other.example.com")] });
    await expect(applySiteFile({ ...file, type: "php" }, "123", ctx)).rejects.toThrow(
      "The load balancer lb-1 has no site for www.example.com",
    );
    expect(calls.filter(([method]) => method !== "GET")).toEqual([]);
  });

  it("stops when several sites of the load balancer match", async () => {
    const { ctx } = fakeForge({
      sites: [site(456, "www.example.com")],
      balancerSites: [site(600, "example.com"), site(602, "www.example.com")],
    });
    await expect(readRemoteState(file, "123", ctx)).rejects.toThrow(
      "Several sites of the load balancer match the site file: example.com, www.example.com",
    );
  });
});
