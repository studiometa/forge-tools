import { describe, expect, it } from "vitest";

import {
  type Change,
  type LoadBalancingNode,
  type RemoteState,
  buildPlan,
  describeChange,
  formatPlan,
  normalizePhp,
  siteRoots,
} from "./plan.ts";
import type { SiteFile } from "./site-file.ts";
import { daemon, job, node, site } from "./test-fixtures.ts";

const A = "/home/forge/a.example.com";
const STAGING = "/home/forge/a.example.com-staging";

const sites = [
  site(456, "a.example.com"),
  site(457, "a.example.com-staging"),
  site(458, "a.example.com.old"),
  site(459, "b.example.com"),
];

/** A shared server: the site, two siblings with the same prefix, another site, server jobs. */
function sharedServer(overrides: Partial<RemoteState> = {}): RemoteState {
  return {
    sites,
    site: sites[0],
    daemons: [
      daemon(
        1,
        `php8.3 ${A}/artisan queue:work 'database' --sleep=10 --daemon --timeout=120 --queue='default'`,
        `${A}/`,
        { processes: 4 },
      ),
      daemon(2, "php artisan queue:work database --queue=mail", A),
      daemon(3, `php8.3 ${STAGING}/artisan queue:work`, `${STAGING}/`),
      daemon(4, "php artisan queue:work", "/home/forge/a.example.com.old"),
      daemon(5, "php artisan horizon", "/home/forge/b.example.com/"),
      daemon(6, "litestream replicate", null, { user: "root" }),
      daemon(7, `php ${A}/artisan reverb:start`, null),
    ],
    siteDaemonIds: new Set([1, 2]),
    jobs: [
      job(10, `php8.3 ${A}/artisan schedule:run`),
      job(11, `php8.3 ${STAGING}/artisan schedule:run`),
      job(12, "/usr/local/bin/composer self-update", {
        user: "root",
        frequency: "Custom",
        cron: "8 9 * * *",
      }),
      job(13, ". /root/.env.restic; restic backup /home/forge/*", {
        user: "root",
        frequency: "Custom",
        cron: "0 1 * * *",
      }),
      job(10, `php8.3 ${A}/artisan schedule:run`),
    ],
    siteJobIds: new Set([10]),
    ...overrides,
  };
}

const file: SiteFile = {
  server: "web-1",
  domain: "a.example.com",
  workers: [
    {
      command:
        "php8.3 artisan queue:work database --sleep=10  --daemon --timeout=120 --queue=default",
      processes: 4,
    },
    { command: "php artisan queue:work 'database' --queue=mail", processes: 1 },
  ],
  schedule: [{ command: "php8.3 artisan schedule:run", frequency: "minutely" }],
};

function actions(changes: Change[]): string[] {
  return changes.map((change) =>
    "id" in change ? `${change.action} ${change.id}` : change.action,
  );
}

describe("buildPlan", () => {
  it("finds no change when the file matches Forge, whatever the spelling", () => {
    const plan = buildPlan(file, sharedServer());

    expect(plan.changes).toEqual([]);
    expect(plan.warnings).toEqual([
      `Kept daemon 7 (php ${A}/artisan reverb:start): not declared, but its owner is not certain.`,
    ]);
  });

  it("compares nothing that the file does not declare", () => {
    const plan = buildPlan({ server: "web-1", domain: "a.example.com" }, sharedServer());

    expect(plan).toEqual({ changes: [], warnings: [] });
  });

  it("deletes nothing when workers and schedule are absent", () => {
    const plan = buildPlan(
      { server: "web-1", domain: "a.example.com", php: "php83" },
      sharedServer(),
    );

    expect(plan.changes).toEqual([]);
  });

  it("deletes only the workers and jobs of the site with []", () => {
    const plan = buildPlan(
      { server: "web-1", domain: "a.example.com", workers: [], schedule: [] },
      sharedServer(),
    );

    expect(actions(plan.changes)).toEqual(["delete-worker 1", "delete-worker 2", "delete-job 10"]);
    expect(plan.changes[0]).toEqual({
      action: "delete-worker",
      id: 1,
      command: `php8.3 ${A}/artisan queue:work 'database' --sleep=10 --daemon --timeout=120 --queue='default'`,
      directory: `${A}/`,
      processes: 4,
    });
    expect(plan.changes[2]).toMatchObject({ action: "delete-job", id: 10, onSite: true });
  });

  it("never touches siblings with a shared prefix, other sites or root jobs", () => {
    const plan = buildPlan(
      { server: "web-1", domain: "a.example.com", workers: [], schedule: [] },
      sharedServer(),
    );
    const ids = plan.changes.flatMap((change) => ("id" in change ? [change.id] : []));

    for (const id of [3, 4, 5, 6, 7, 11, 12, 13]) {
      expect(ids).not.toContain(id);
    }
  });

  it("owns a job of the server by its site path, but never a job of root", () => {
    const state = sharedServer({
      siteJobIds: new Set(),
      jobs: [
        job(20, `php ${A}/artisan schedule:run`),
        job(21, `php ${A}/artisan backup:run`, { user: "root" }),
        job(22, `cp ${A}/x /home/forge/b.example.com/x`),
      ],
    });
    const plan = buildPlan({ server: "web-1", domain: "a.example.com", schedule: [] }, state);

    expect(actions(plan.changes)).toEqual(["delete-job 20"]);
    expect(plan.changes[0]).toMatchObject({ onSite: false });
    expect(plan.warnings).toEqual([
      `Kept scheduled job 21 (php ${A}/artisan backup:run): not declared, but it runs as root.`,
      `Kept scheduled job 22 (cp ${A}/x /home/forge/b.example.com/x): not declared, but its owner is not certain.`,
    ]);
  });

  it("never deletes a daemon of root in the site", () => {
    const state = sharedServer({
      daemons: [daemon(30, "php artisan x", A, { user: "root" })],
    });
    const plan = buildPlan({ server: "web-1", domain: "a.example.com", workers: [] }, state);

    expect(plan.changes).toEqual([]);
    expect(plan.warnings).toEqual([
      "Kept daemon 30 (php artisan x): not declared, but it runs as root.",
    ]);
  });

  it("matches a daemon without directory to a worker in the site root", () => {
    const state = sharedServer({ daemons: [daemon(7, `php ${A}/artisan reverb:start`, null)] });

    expect(
      buildPlan(
        {
          server: "web-1",
          domain: "a.example.com",
          workers: [{ command: "php artisan reverb:start", processes: 1 }],
        },
        state,
      ),
    ).toEqual({ changes: [], warnings: [] });
    expect(
      buildPlan(
        {
          server: "web-1",
          domain: "a.example.com",
          workers: [{ command: `php ${A}/artisan reverb:start`, processes: 1, directory: A }],
        },
        sharedServer({
          daemons: [daemon(7, `php ${A}/artisan reverb:start`, null)],
          siteDaemonIds: new Set([7]),
        }),
      ).changes,
    ).toEqual([]);
  });

  it("never matches a relative artisan of a daemon without directory", () => {
    const plan = buildPlan(
      {
        server: "web-1",
        domain: "a.example.com",
        workers: [{ command: "php artisan horizon", processes: 1 }],
      },
      sharedServer({ daemons: [daemon(8, "php artisan horizon", null)] }),
    );

    expect(actions(plan.changes)).toEqual(["create-worker"]);
  });

  it("matches an ambiguous daemon but never deletes it", () => {
    const plan = buildPlan(
      { server: "web-1", domain: "a.example.com", workers: [] },
      sharedServer({
        daemons: [daemon(7, `php ${A}/artisan reverb:start`, null)],
        siteDaemonIds: new Set(),
      }),
    );

    expect(plan.changes).toEqual([]);
    expect(plan.warnings).toHaveLength(1);
  });

  it("owns a daemon without directory when Forge associates it with the site", () => {
    const plan = buildPlan(
      { server: "web-1", domain: "a.example.com", workers: [] },
      sharedServer({
        daemons: [daemon(7, `php ${A}/artisan reverb:start`, null)],
        siteDaemonIds: new Set([7]),
      }),
    );

    expect(actions(plan.changes)).toEqual(["delete-worker 7"]);
  });

  it("replaces a changed worker: creates the new one and deletes the old one", () => {
    const plan = buildPlan(
      {
        ...file,
        workers: [
          { command: "php8.3 artisan queue:work database --queue=default", processes: 4 },
          { command: "php artisan queue:work database --queue=mail", processes: 2 },
        ],
        schedule: undefined,
      },
      sharedServer(),
    );

    expect(actions(plan.changes)).toEqual([
      "create-worker",
      "create-worker",
      "delete-worker 1",
      "delete-worker 2",
    ]);
    expect(plan.changes[1]).toEqual({
      action: "create-worker",
      command: "php artisan queue:work database --queue=mail",
      directory: A,
      processes: 2,
    });
  });

  it("resolves a worker directory relative to the site root", () => {
    const plan = buildPlan(
      {
        server: "web-1",
        domain: "a.example.com",
        workers: [{ command: "php artisan horizon", processes: 1, directory: "current/" }],
      },
      sharedServer({ daemons: [daemon(40, "php artisan horizon", `${A}/current/`)] }),
    );

    expect(plan.changes).toEqual([]);
  });

  it("expands a relative artisan in a new scheduled job", () => {
    const plan = buildPlan(
      {
        server: "web-1",
        domain: "a.example.com",
        schedule: [
          { command: "php artisan inspire", frequency: "hourly" },
          { command: "php artisan backup:run", frequency: "custom", cron: "0 3 * * *" },
        ],
      },
      sharedServer({ jobs: [], siteJobIds: new Set() }),
    );

    expect(plan.changes).toEqual([
      { action: "create-job", command: `php ${A}/artisan inspire`, frequency: "hourly" },
      {
        action: "create-job",
        command: `php ${A}/artisan backup:run`,
        frequency: "custom",
        cron: "0 3 * * *",
      },
    ]);
  });

  it("compares the cron of custom jobs only", () => {
    const state = sharedServer({
      jobs: [job(50, `php ${A}/artisan backup:run`, { frequency: "Custom", cron: "0 4 * * *" })],
      siteJobIds: new Set([50]),
    });
    const plan = buildPlan(
      {
        server: "web-1",
        domain: "a.example.com",
        schedule: [{ command: "php artisan backup:run", frequency: "custom", cron: "0 3 * * *" }],
      },
      state,
    );

    expect(actions(plan.changes)).toEqual(["create-job", "delete-job 50"]);
  });

  it("updates the PHP version, the web directory and the branch", () => {
    const plan = buildPlan(
      {
        server: "web-1",
        domain: "a.example.com",
        php: "php84",
        webDirectory: "/web",
        repository: {
          provider: "custom",
          url: "https://git.example.com/group/a.example.com",
          branch: "prod",
        },
      },
      sharedServer(),
    );

    expect(plan.changes).toEqual([
      {
        action: "update-site",
        changes: [
          { field: "php_version", from: "PHP 8.3", to: "php84" },
          { field: "web_directory", from: `${A}/public`, to: "/web" },
          { field: "branch", from: "main", to: "prod" },
        ],
      },
    ]);
    expect(plan.warnings).toEqual([]);
  });

  it("finds no site change when the values match", () => {
    const plan = buildPlan(
      {
        server: "web-1",
        domain: "A.EXAMPLE.COM",
        php: "php83",
        webDirectory: "/public/",
        repository: {
          provider: "custom",
          url: "https://git.example.com/group/a.example.com.git",
          branch: "main",
        },
      },
      sharedServer(),
    );

    expect(plan).toEqual({ changes: [], warnings: [] });
  });

  it("warns about a different repository or type, which apply does not change", () => {
    const plan = buildPlan(
      {
        server: "web-1",
        domain: "a.example.com",
        type: "laravel",
        repository: { provider: "custom", url: "https://git.example.com/group/other.git" },
      },
      sharedServer({ site: site(456, "a.example.com", { repository: null }) }),
    );
    expect(plan.warnings).toEqual([
      "Site type differs on Forge (Custom): apply does not change the type of a site.",
    ]);

    const other = buildPlan(
      {
        server: "web-1",
        domain: "a.example.com",
        repository: { provider: "custom", url: "https://git.example.com/group/other.git" },
      },
      sharedServer(),
    );
    expect(other.warnings).toEqual([
      "Repository differs on Forge (https://git.example.com/group/a.example.com.git): apply does not change the repository of a site.",
    ]);
  });

  it("adds missing aliases and never removes one", () => {
    const plan = buildPlan(
      {
        server: "web-1",
        domain: "a.example.com",
        aliases: ["example.com", "A.example.com", "www.example.com", "example.com"],
      },
      sharedServer({
        site: site(456, "a.example.com", { aliases: ["WWW.example.com", "old.example.com"] }),
      }),
    );

    expect(plan.changes).toEqual([{ action: "add-alias", name: "example.com" }]);
  });

  it("adds missing .env keys and reports different values by name only", () => {
    const plan = buildPlan(
      {
        server: "web-1",
        domain: "a.example.com",
        env: { APP_ENV: "production", APP_DEBUG: false, CACHE_STORE: "redis", QUEUE: "database" },
      },
      sharedServer({ env: 'APP_ENV=staging\nAPP_DEBUG=false\nQUEUE="database"\n' }),
    );

    expect(plan.changes).toEqual([{ action: "add-env", keys: ["CACHE_STORE"], generated: [] }]);
    expect(plan.warnings).toEqual([
      ".env key APP_ENV has another value on Forge: apply does not overwrite it.",
    ]);
    expect(formatPlan(plan)).not.toContain("staging");
    expect(formatPlan(plan)).not.toContain("production");
  });

  it("creates a missing database and user, with generated .env values", () => {
    const plan = buildPlan(
      {
        server: "web-1",
        domain: "a.example.com",
        database: { name: "example", user: "example" },
        env: { DB_PASSWORD: "ignored", APP_ENV: "production" },
      },
      sharedServer({ databases: [], databaseUsers: [], env: "APP_ENV=production\n" }),
    );

    expect(plan.changes).toEqual([
      { action: "create-database", name: "example" },
      { action: "create-database-user", name: "example", database: "example" },
      {
        action: "add-env",
        keys: [],
        generated: ["DB_DATABASE", "DB_USERNAME", "DB_PASSWORD"],
        password: "DB_PASSWORD",
      },
    ]);
    expect(formatPlan(plan)).toContain("DB_PASSWORD=<generated>");
  });

  it("does not touch an existing database user", () => {
    const user = { id: 2, name: "example", status: "installed", created_at: "", updated_at: "" };
    const db = { id: 1, name: "example", status: "installed", created_at: "", updated_at: "" };

    expect(
      buildPlan(
        {
          server: "web-1",
          domain: "a.example.com",
          database: { name: "example", user: "example" },
        },
        sharedServer({ databases: [db], databaseUsers: [user], env: "" }),
      ),
    ).toEqual({ changes: [], warnings: [] });

    const plan = buildPlan(
      { server: "web-1", domain: "a.example.com", database: { name: "other", user: "example" } },
      sharedServer({ databases: [db], databaseUsers: [user], env: "" }),
    );
    expect(plan.changes).toEqual([{ action: "create-database", name: "other" }]);
    expect(plan.warnings).toEqual([
      "Database user example exists: apply does not give it access to the new database other.",
    ]);
  });

  it("plans a new site with everything to create and nothing to delete", () => {
    const plan = buildPlan(
      {
        server: "web-1",
        domain: "new.example.com",
        type: "php",
        php: "php83",
        aliases: ["example.org"],
        repository: {
          provider: "custom",
          url: "https://git.example.com/group/new.git",
          branch: "main",
        },
        env: { APP_ENV: "production" },
        workers: [{ command: "php artisan queue:work", processes: 1 }],
        schedule: [{ command: "php artisan schedule:run", frequency: "minutely" }],
      },
      { sites, site: null, env: null, daemons: [daemon(1, "php artisan queue:work", A)], jobs: [] },
    );

    expect(plan.changes).toEqual([
      {
        action: "create-site",
        name: "new.example.com",
        settings: {
          type: "php",
          php_version: "php83",
          web_directory: undefined,
          source_control_provider: "custom",
          repository: "https://git.example.com/group/new.git",
          branch: "main",
        },
      },
      { action: "add-alias", name: "example.org" },
      { action: "add-env", keys: ["APP_ENV"], generated: [] },
      {
        action: "create-worker",
        command: "php artisan queue:work",
        directory: "/home/forge/new.example.com",
        processes: 1,
      },
      {
        action: "create-job",
        command: "php /home/forge/new.example.com/artisan schedule:run",
        frequency: "minutely",
      },
    ]);
  });

  it("uses the root directory of a zero-downtime site", () => {
    const zdt = site(460, "z.example.com", {
      root_directory: "/home/forge/z.example.com/current",
      web_directory: "/home/forge/z.example.com/current/public",
    });
    const plan = buildPlan(
      {
        server: "web-1",
        domain: "z.example.com",
        webDirectory: "/public",
        workers: [{ command: "php artisan queue:work", processes: 1 }],
      },
      {
        sites: [...sites, zdt],
        site: zdt,
        daemons: [daemon(60, "php artisan queue:work", "/home/forge/z.example.com/current/")],
        siteDaemonIds: new Set(),
      },
    );

    expect(plan).toEqual({ changes: [], warnings: [] });
  });
});

describe("relative directories from Forge", () => {
  it("reads a relative web directory against the site root", () => {
    const relative = site(456, "a.example.com", { root_directory: "/", web_directory: "/public" });
    const state = { sites: [relative], site: relative };

    expect(
      buildPlan({ server: "web-1", domain: "a.example.com", webDirectory: "/public" }, state),
    ).toEqual({ changes: [], warnings: [] });
    expect(
      buildPlan({ server: "web-1", domain: "a.example.com", webDirectory: "/web" }, state).changes,
    ).toEqual([
      { action: "update-site", changes: [{ field: "web_directory", from: "/public", to: "/web" }] },
    ]);
  });

  it("never turns a relative root directory into the root of the server", () => {
    expect(siteRoots([site(1, "a.example.com", { root_directory: "/" })])).toEqual([
      { id: 1, roots: ["/home/forge/a.example.com"] },
    ]);
    expect(siteRoots([site(2, "b.example.com", { root_directory: "/current" })])).toEqual([
      { id: 2, roots: ["/home/forge/b.example.com", "/home/forge/b.example.com/current"] },
    ]);
  });
});

describe("siteRoots", () => {
  it("gives the site folder and the root directory", () => {
    expect(
      siteRoots([
        site(1, "z.example.com", { root_directory: "/home/forge/z.example.com/current" }),
      ]),
    ).toEqual([
      { id: 1, roots: ["/home/forge/z.example.com", "/home/forge/z.example.com/current"] },
    ]);
    expect(siteRoots([site(2, "y.example.com", { root_directory: null, user: "y" })])).toEqual([
      { id: 2, roots: ["/home/y/y.example.com"] },
    ]);
  });
});

describe("normalizePhp", () => {
  it("compares Forge and file spellings", () => {
    expect(normalizePhp("PHP 8.3")).toBe("php83");
    expect(normalizePhp("php83")).toBe("php83");
    expect(normalizePhp(null)).toBeNull();
  });
});

describe("describeChange", () => {
  it("prints every change on one line, with full command and id for deletions", () => {
    const lines = [
      describeChange({ action: "create-site", name: "a.example.com", settings: {} }),
      describeChange({
        action: "create-site",
        name: "a.example.com",
        settings: { type: "php", php_version: "php83", branch: undefined },
      }),
      describeChange({
        action: "update-site",
        changes: [{ field: "branch", from: null, to: "main" }],
      }),
      describeChange({ action: "add-alias", name: "example.com" }),
      describeChange({ action: "create-database", name: "example" }),
      describeChange({ action: "create-database-user", name: "example", database: "example" }),
      describeChange({
        action: "add-env",
        keys: ["APP_ENV"],
        generated: ["DB_USERNAME", "DB_PASSWORD"],
        password: "DB_PASSWORD",
      }),
      describeChange({
        action: "create-worker",
        command: "php artisan queue:work",
        directory: A,
        processes: 2,
      }),
      describeChange({
        action: "delete-worker",
        id: 1,
        command: "php artisan queue:work",
        directory: null,
        processes: 1,
      }),
      describeChange({
        action: "create-job",
        command: "php x",
        frequency: "custom",
        cron: "0 3 * * *",
      }),
      describeChange({
        action: "delete-job",
        id: 10,
        command: `php ${A}/artisan schedule:run`,
        frequency: "Minutely",
        cron: "* * * * *",
        onSite: true,
      }),
    ];

    expect(lines).toEqual([
      "+ create site a.example.com",
      "+ create site a.example.com (type: php, php_version: php83)",
      "~ update site: branch (none) → main",
      "+ add alias example.com",
      "+ create database example",
      "+ create database user example for example (password: <generated>)",
      "+ add .env keys: APP_ENV, DB_USERNAME, DB_PASSWORD=<generated>",
      `+ create worker: php artisan queue:work (directory: ${A}, processes: 2)`,
      "- delete worker 1: php artisan queue:work (directory: (none), processes: 1)",
      "+ create scheduled job: php x (custom 0 3 * * *)",
      `- delete scheduled job 10: php ${A}/artisan schedule:run (minutely * * * * *)`,
    ]);
  });
});

describe("buildPlan with database .env keys", () => {
  it("writes the generated values into the keys of the file", () => {
    const plan = buildPlan(
      {
        server: "web-1",
        domain: "a.example.com",
        database: {
          name: "example",
          user: "example",
          env: { name: "DB_NAME", user: "DB_USER", password: "DB_PASS" },
        },
        env: { DB_PASS: "ignored" },
      },
      sharedServer({ databases: [], databaseUsers: [], env: "" }),
    );

    expect(plan.changes.at(-1)).toEqual({
      action: "add-env",
      keys: [],
      generated: ["DB_NAME", "DB_USER", "DB_PASS"],
      password: "DB_PASS",
    });
    expect(formatPlan(plan)).toContain("+ add .env keys: DB_NAME, DB_USER, DB_PASS=<generated>");
  });

  it("keeps the Laravel names for the keys that the file does not map", () => {
    const plan = buildPlan(
      {
        server: "web-1",
        domain: "a.example.com",
        database: { name: "example", user: "example", env: { password: "DB_PASS" } },
      },
      sharedServer({ databases: [], databaseUsers: [], env: "" }),
    );

    expect(plan.changes.at(-1)).toMatchObject({
      generated: ["DB_DATABASE", "DB_USERNAME", "DB_PASS"],
      password: "DB_PASS",
    });
  });
});

describe("buildPlan with an Nginx file", () => {
  const file: SiteFile = { server: "web-1", domain: "a.example.com", nginxTemplate: "x" };

  it("writes the file once a new site exists", () => {
    const plan = buildPlan({ ...file, type: "php" }, { sites: [], site: null, nginx: null });
    expect(plan.changes).toEqual([
      expect.objectContaining({ action: "create-site" }),
      { action: "update-nginx", diff: null },
    ]);
    expect(formatPlan(plan)).toContain(
      "~ write Nginx configuration (rendered once the site exists)",
    );
  });

  it("changes nothing when the rendered file matches, after normalization", () => {
    const plan = buildPlan(
      file,
      sharedServer({ nginx: { remote: "root /a;\r\n", rendered: "root /a;" } }),
    );
    expect(plan.changes).toEqual([]);
  });

  it("shows the diff from Forge to the rendered file", () => {
    const plan = buildPlan(
      file,
      sharedServer({ nginx: { remote: "root /a;\nindex x;\n", rendered: "root /b;\nindex x;\n" } }),
    );
    expect(plan.changes).toEqual([
      {
        action: "update-nginx",
        diff: "--- remote\n+++ local\n@@ -1,2 +1,2 @@\n-root /a;\n+root /b;\n index x;",
      },
    ]);
    expect(formatPlan(plan)).toBe(
      "~ update Nginx configuration:\n--- remote\n+++ local\n@@ -1,2 +1,2 @@\n-root /a;\n+root /b;\n index x;",
    );
  });

  it("does not read Nginx when the file has no Nginx file", () => {
    const plan = buildPlan(
      { server: "web-1", domain: "a.example.com" },
      sharedServer({ nginx: { remote: "a", rendered: "b" } }),
    );
    expect(plan.changes).toEqual([]);
  });
});

describe("buildPlan with a load balancer", () => {
  const balanced: SiteFile = {
    server: 123,
    domain: "www.example.com",
    loadBalancer: { server: "lb-1", port: 80 },
  };
  const balancerSite = site(600, "example.com");

  function withNodes(nodes: LoadBalancingNode[]): RemoteState {
    return {
      sites: [site(456, "www.example.com")],
      site: site(456, "www.example.com"),
      loadBalancer: { serverId: "300", site: balancerSite, nodes, target: 123 },
    };
  }

  it("changes nothing when the one node is the server of the file", () => {
    expect(buildPlan(balanced, withNodes([node(123)])).changes).toEqual([]);
  });

  it("replaces other nodes with the server of the file", () => {
    expect(buildPlan(balanced, withNodes([node(124), node(123)])).changes).toEqual([
      {
        action: "update-load-balancer",
        site: "example.com",
        from: [
          { server_id: 124, port: 80 },
          { server_id: 123, port: 80 },
        ],
        to: { server_id: 123, port: 80 },
      },
    ]);
  });

  it("updates a node with another port, weight or state", () => {
    for (const nodes of [
      [node(123, { port: 8080 })],
      [node(123, { weight: 2 })],
      [node(123, { backup: true })],
      [node(123, { down: true })],
      [],
    ]) {
      expect(actions(buildPlan(balanced, withNodes(nodes)).changes)).toEqual([
        "update-load-balancer",
      ]);
    }
  });

  it("plans nothing without the key, or before the site of the load balancer exists", () => {
    const { loadBalancer: _, ...plain } = balanced;
    expect(buildPlan(plain, withNodes([node(124)])).changes).toEqual([]);
    expect(
      buildPlan(balanced, {
        ...withNodes([]),
        loadBalancer: { serverId: "300", site: null, nodes: [], target: 123 },
      }).changes,
    ).toEqual([]);
  });

  it("describes the nodes before and after", () => {
    expect(
      describeChange({
        action: "update-load-balancer",
        site: "example.com",
        from: [{ server_id: 124, port: 80 }],
        to: { server_id: 123, port: 80 },
      }),
    ).toBe("~ update load balancer site example.com: server 124:80 → server 123:80");
    expect(
      describeChange({
        action: "update-load-balancer",
        site: "example.com",
        from: [],
        to: { server_id: 123, port: 80 },
      }),
    ).toBe("~ update load balancer site example.com: (none) → server 123:80");
  });
});
