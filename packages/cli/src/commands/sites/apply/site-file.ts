/**
 * The site file of `forge sites apply`: a JSON file that declares one Forge site.
 * A key that is absent is not managed; only `server` and `domain` are required.
 */

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import * as v from "valibot";

import { ValidationError } from "../../../errors.ts";
import { assertNginxTemplate } from "./nginx.ts";

/** URL of the JSON Schema of the site file, published with the package. */
export const SITE_FILE_SCHEMA_URL =
  "https://unpkg.com/@studiometa/forge-cli/schemas/site.schema.json";

const text = v.pipe(v.string(), v.trim(), v.nonEmpty());

/** A server name (exact match) or ID. */
const serverRef = v.union([text, v.pipe(v.number(), v.integer(), v.minValue(1))]);

export const SITE_TYPES = [
  "laravel",
  "symfony",
  "statamic",
  "wordpress",
  "phpmyadmin",
  "php",
  "nextjs",
  "nuxtjs",
  "static-html",
  "other",
  "custom",
] as const;

export const SOURCE_CONTROL_PROVIDERS = [
  "github",
  "gitlab",
  "bitbucket",
  "gitlab-custom",
  "custom",
] as const;

export const SCHEDULE_FREQUENCIES = [
  "minutely",
  "hourly",
  "nightly",
  "weekly",
  "monthly",
  "reboot",
  "custom",
] as const;

export const WorkerSchema = v.strictObject({
  command: text,
  processes: v.optional(v.pipe(v.number(), v.integer(), v.minValue(1)), 1),
  directory: v.optional(text),
});

export const ScheduledJobSchema = v.pipe(
  v.strictObject({
    command: text,
    frequency: v.picklist(SCHEDULE_FREQUENCIES),
    cron: v.optional(text),
  }),
  v.check(
    (job) => (job.frequency === "custom") === (job.cron !== undefined),
    "cron is required with the custom frequency, and only with it",
  ),
);

const envName = v.pipe(
  v.string(),
  v.regex(/^[A-Za-z_][A-Za-z0-9_]*$/, "invalid .env variable name"),
);

/** The .env keys that a new database user gets. Default: the Laravel names. */
export const DatabaseEnvSchema = v.pipe(
  v.strictObject({
    name: v.optional(envName),
    user: v.optional(envName),
    password: v.optional(envName),
  }),
  v.check(
    (env) =>
      new Set([env.name ?? "DB_DATABASE", env.user ?? "DB_USERNAME", env.password ?? "DB_PASSWORD"])
        .size === 3,
    "the .env keys of the database must be different",
  ),
);

/** The load balancer that sends the traffic of the site to its server. */
export const LoadBalancerSchema = v.strictObject({
  server: serverRef,
  port: v.optional(v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(65535)), 80),
});

export const SiteFileSchema = v.strictObject({
  $schema: v.optional(v.string()),
  server: serverRef,
  domain: text,
  aliases: v.optional(v.array(text)),
  type: v.optional(v.picklist(SITE_TYPES)),
  php: v.optional(v.pipe(v.string(), v.regex(/^php\d+$/, "php must look like php83"))),
  webDirectory: v.optional(text),
  repository: v.optional(
    v.strictObject({
      provider: v.picklist(SOURCE_CONTROL_PROVIDERS),
      url: text,
      branch: v.optional(text),
    }),
  ),
  database: v.optional(
    v.strictObject({ name: text, user: text, env: v.optional(DatabaseEnvSchema) }),
  ),
  env: v.optional(v.record(envName, v.union([v.string(), v.number(), v.boolean()]))),
  nginx: v.optional(text),
  workers: v.optional(v.array(WorkerSchema)),
  schedule: v.optional(v.array(ScheduledJobSchema)),
  loadBalancer: v.optional(LoadBalancerSchema),
});

export type SiteFileData = v.InferOutput<typeof SiteFileSchema>;

/** A site file with the content of its Nginx file, when it declares one. */
export type SiteFile = SiteFileData & { nginxTemplate?: string };
export type WorkerDeclaration = v.InferOutput<typeof WorkerSchema>;
export type ScheduledJobDeclaration = v.InferOutput<typeof ScheduledJobSchema>;

/**
 * Validate parsed JSON as a site file. Throws a ValidationError that lists every issue.
 */
export function parseSiteFile(data: unknown, source = "site file"): SiteFileData {
  const result = v.safeParse(SiteFileSchema, data);
  if (!result.success) {
    const issues = result.issues.map((issue) => {
      const path = v.getDotPath(issue);
      return `${path ?? "(root)"}: ${issue.message}`;
    });
    throw new ValidationError(`Invalid ${source}`, "file", issues);
  }
  return result.output;
}

/**
 * Read and validate a site file from disk, with its Nginx file: a relative `nginx` path is
 * read against the folder of the site file.
 */
export function readSiteFile(path: string): SiteFile {
  let content: string;
  try {
    content = readFileSync(path, "utf8");
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new ValidationError(`Cannot read site file ${path}: ${reason}`, "file");
  }

  let data: unknown;
  try {
    data = JSON.parse(content);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new ValidationError(`Site file ${path} is not valid JSON: ${reason}`, "file");
  }

  const file: SiteFile = parseSiteFile(data, `site file ${path}`);
  if (file.nginx) {
    const nginxPath = resolve(dirname(path), file.nginx);
    try {
      file.nginxTemplate = readFileSync(nginxPath, "utf8");
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      throw new ValidationError(`Cannot read Nginx file ${nginxPath}: ${reason}`, "nginx");
    }
    assertNginxTemplate(file.nginxTemplate, nginxPath);
  }
  return file;
}
