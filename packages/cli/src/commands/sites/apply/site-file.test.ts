import { resolve } from "node:path";

import * as v from "valibot";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("node:fs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:fs")>();
  return { ...actual, readFileSync: vi.fn() };
});

import { readFileSync } from "node:fs";

import { ValidationError } from "../../../errors.ts";
import {
  SITE_FILE_SCHEMA_URL,
  DatabaseEnvSchema,
  SiteFileSchema,
  ScheduledJobSchema,
  WorkerSchema,
  parseSiteFile,
  readSiteFile,
} from "./site-file.ts";

const example = {
  $schema: SITE_FILE_SCHEMA_URL,
  server: "web-1",
  domain: "www.example.com",
  aliases: ["example.com"],
  wwwRedirect: "none",
  type: "php",
  php: "php83",
  webDirectory: "/public",
  repository: {
    provider: "custom",
    url: "https://git.example.com/group/project.git",
    branch: "main",
  },
  database: { name: "example", user: "example" },
  env: { APP_ENV: "production", APP_DEBUG: false, WORKERS: 2 },
  workers: [{ command: "php artisan queue:work database --queue=default", processes: 4 }],
  schedule: [{ command: "php artisan schedule:run", frequency: "minutely" }],
  loadBalancer: { server: "lb-1", port: 80 },
};

function issues(data: unknown): string[] {
  try {
    parseSiteFile(data);
    return [];
  } catch (error) {
    return (error as ValidationError).hints ?? [];
  }
}

describe("parseSiteFile", () => {
  it("accepts a full site file", () => {
    expect(parseSiteFile(example)).toMatchObject({ server: "web-1", domain: "www.example.com" });
  });

  it("accepts the minimal site file and a numeric server", () => {
    expect(parseSiteFile({ server: 123, domain: "www.example.com" })).toEqual({
      server: 123,
      domain: "www.example.com",
    });
  });

  it("accepts each www redirect and refuses another value", () => {
    for (const wwwRedirect of ["to-www", "from-www", "none"]) {
      expect(parseSiteFile({ server: 1, domain: "example.com", wwwRedirect }).wwwRedirect).toBe(
        wwwRedirect,
      );
    }
    expect(issues({ server: 1, domain: "example.com", wwwRedirect: "www" })).toEqual([
      expect.stringMatching(/^wwwRedirect: /),
    ]);
  });

  it("defaults the number of processes of a worker to 1", () => {
    const file = parseSiteFile({ ...example, workers: [{ command: "php artisan horizon" }] });
    expect(file.workers).toEqual([{ command: "php artisan horizon", processes: 1 }]);
  });

  it("defaults the port of the load balancer to 80 and refuses an invalid port", () => {
    expect(
      parseSiteFile({ server: 1, domain: "a.example.com", loadBalancer: { server: 300 } })
        .loadBalancer,
    ).toEqual({ server: 300, port: 80 });
    expect(
      issues({ server: 1, domain: "a.example.com", loadBalancer: { server: "lb-1", port: 0 } }),
    ).toHaveLength(1);
  });

  it("keeps an empty list of workers, which differs from no list", () => {
    expect(parseSiteFile({ server: 1, domain: "a.example.com", workers: [] }).workers).toEqual([]);
    expect(parseSiteFile({ server: 1, domain: "a.example.com" }).workers).toBeUndefined();
  });

  it("lists every issue with its path", () => {
    expect(
      issues({
        server: "",
        domain: "www.example.com",
        php: "8.3",
        unknown: true,
        env: { "BAD-NAME": "x" },
        workers: [{ command: "x", processes: 0 }],
        schedule: [{ command: "x", frequency: "custom" }],
      }),
    ).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/^server: /),
        expect.stringMatching(/^php: php must look like php83/),
        expect.stringMatching(/^unknown: /),
        expect.stringMatching(/^env\.BAD-NAME: invalid \.env variable name/),
        expect.stringMatching(/^workers\.0\.processes: /),
        expect.stringMatching(/^schedule\.0: cron is required/),
      ]),
    );
  });

  it("refuses a cron without the custom frequency", () => {
    expect(
      issues({ ...example, schedule: [{ command: "x", frequency: "hourly", cron: "* * * * *" }] }),
    ).toEqual(["schedule.0: cron is required with the custom frequency, and only with it"]);
  });

  it("accepts .env keys for the database, each one optional", () => {
    const database = {
      name: "example",
      user: "example",
      env: { name: "DB_NAME", password: "DB_PASS" },
    };
    expect(parseSiteFile({ ...example, database }).database).toEqual(database);
  });

  it("refuses invalid or identical .env keys for the database", () => {
    const database = { name: "example", user: "example" };
    expect(issues({ ...example, database: { ...database, env: { name: "DB-NAME" } } })).toEqual([
      "database.env.name: invalid .env variable name",
    ]);
    expect(issues({ ...example, database: { ...database, env: { user: "DB_PASSWORD" } } })).toEqual(
      ["database.env: the .env keys of the database must be different"],
    );
    expect(issues({ ...example, database: { ...database, env: { host: "DB_HOST" } } })).toEqual([
      expect.stringMatching(/^database\.env\.host: /),
    ]);
  });

  it("names the root when the file is not an object", () => {
    expect(issues("site")).toEqual([expect.stringMatching(/^\(root\): /)]);
  });
});

describe("readSiteFile", () => {
  beforeEach(() => {
    vi.mocked(readFileSync).mockReset();
  });

  it("reads and validates a file", () => {
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify(example));
    expect(readSiteFile("config/forge/production/site.json").domain).toBe("www.example.com");
    expect(readFileSync).toHaveBeenCalledWith("config/forge/production/site.json", "utf8");
  });

  it("reports a missing file", () => {
    vi.mocked(readFileSync).mockImplementation(() => {
      throw new Error("ENOENT");
    });
    expect(() => readSiteFile("site.json")).toThrow("Cannot read site file site.json: ENOENT");
  });

  it("reports invalid JSON", () => {
    vi.mocked(readFileSync).mockReturnValue("{");
    expect(() => readSiteFile("site.json")).toThrow(/is not valid JSON/);
  });

  it("reads the Nginx file next to the site file", () => {
    vi.mocked(readFileSync).mockImplementation((path) =>
      String(path).endsWith("site.json")
        ? JSON.stringify({ ...example, nginx: "nginx.conf" })
        : "root {{ PATH }};\n",
    );
    const file = readSiteFile("config/forge/production/site.json");
    expect(file.nginx).toBe("nginx.conf");
    expect(file.nginxTemplate).toBe("root {{ PATH }};\n");
    expect(readFileSync).toHaveBeenLastCalledWith(
      resolve("config/forge/production/nginx.conf"),
      "utf8",
    );
  });

  it("reports a missing Nginx file", () => {
    vi.mocked(readFileSync).mockImplementation((path) => {
      if (String(path).endsWith("site.json"))
        return JSON.stringify({ ...example, nginx: "x.conf" });
      throw new Error("ENOENT");
    });
    expect(() => readSiteFile("site.json")).toThrow(
      `Cannot read Nginx file ${resolve("x.conf")}: ENOENT`,
    );
  });

  it("refuses an unknown variable in the Nginx file", () => {
    vi.mocked(readFileSync).mockImplementation((path) =>
      String(path).endsWith("site.json")
        ? JSON.stringify({ ...example, nginx: "/etc/forge/nginx.conf" })
        : "root {{ WEB_ROOT }};",
    );
    expect(() => readSiteFile("site.json")).toThrow(
      "Nginx file /etc/forge/nginx.conf has unknown variables: {{WEB_ROOT}}",
    );
  });

  it("names the file in validation errors", () => {
    vi.mocked(readFileSync).mockReturnValue("{}");
    expect(() => readSiteFile("site.json")).toThrow("Invalid site file site.json");
  });
});

const actualFs = await vi.importActual<typeof import("node:fs")>("node:fs");

describe("site.schema.json", () => {
  const schema = JSON.parse(
    actualFs.readFileSync(
      resolve(import.meta.dirname, "../../../../schemas/site.schema.json"),
      "utf8",
    ),
  );

  function keys(
    object:
      | v.ObjectSchema<v.ObjectEntries, undefined>
      | v.StrictObjectSchema<v.ObjectEntries, undefined>,
  ) {
    return Object.keys(object.entries).toSorted();
  }

  it("is published at the URL of $schema", () => {
    expect(schema.$id).toBe(SITE_FILE_SCHEMA_URL);
  });

  it("has the keys of the valibot schema", () => {
    expect(Object.keys(schema.properties).toSorted()).toEqual(keys(SiteFileSchema));
    expect(Object.keys(schema.properties.workers.items.properties).toSorted()).toEqual(
      keys(WorkerSchema),
    );
    expect(Object.keys(schema.properties.schedule.items.properties).toSorted()).toEqual(
      keys(ScheduledJobSchema.pipe[0]),
    );
    expect(Object.keys(schema.properties.repository.properties).toSorted()).toEqual(
      keys(SiteFileSchema.entries.repository.wrapped),
    );
    expect(Object.keys(schema.properties.database.properties).toSorted()).toEqual(
      keys(SiteFileSchema.entries.database.wrapped),
    );
    expect(Object.keys(schema.properties.loadBalancer.properties).toSorted()).toEqual(
      keys(SiteFileSchema.entries.loadBalancer.wrapped),
    );
    expect(Object.keys(schema.properties.database.properties.env.properties).toSorted()).toEqual(
      keys(DatabaseEnvSchema.pipe[0]),
    );
  });

  it("has the same enums as the valibot schema", () => {
    expect(schema.properties.type.enum).toEqual(SiteFileSchema.entries.type.wrapped.options);
    expect(schema.properties.wwwRedirect.enum).toEqual(
      SiteFileSchema.entries.wwwRedirect.wrapped.options,
    );
    expect(schema.properties.repository.properties.provider.enum).toEqual(
      SiteFileSchema.entries.repository.wrapped.entries.provider.options,
    );
    expect(schema.properties.schedule.items.properties.frequency.enum).toEqual(
      ScheduledJobSchema.pipe[0].entries.frequency.options,
    );
  });
});
