/**
 * The site file of `forge sites apply`: a JSON file that declares one Forge site.
 * A key that is absent is not managed; only `server` and `domain` are required.
 */

import { readFileSync } from "node:fs";

import * as v from "valibot";

import { ValidationError } from "../../../errors.ts";

/** URL of the JSON Schema of the site file, published with the package. */
export const SITE_FILE_SCHEMA_URL =
  "https://unpkg.com/@studiometa/forge-cli/schemas/site.schema.json";

const text = v.pipe(v.string(), v.trim(), v.nonEmpty());

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

export const SiteFileSchema = v.strictObject({
  $schema: v.optional(v.string()),
  server: v.union([text, v.pipe(v.number(), v.integer(), v.minValue(1))]),
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
  database: v.optional(v.strictObject({ name: text, user: text })),
  env: v.optional(
    v.record(
      v.pipe(v.string(), v.regex(/^[A-Za-z_][A-Za-z0-9_]*$/, "invalid .env variable name")),
      v.union([v.string(), v.number(), v.boolean()]),
    ),
  ),
  workers: v.optional(v.array(WorkerSchema)),
  schedule: v.optional(v.array(ScheduledJobSchema)),
});

export type SiteFile = v.InferOutput<typeof SiteFileSchema>;
export type WorkerDeclaration = v.InferOutput<typeof WorkerSchema>;
export type ScheduledJobDeclaration = v.InferOutput<typeof ScheduledJobSchema>;

/**
 * Validate parsed JSON as a site file. Throws a ValidationError that lists every issue.
 */
export function parseSiteFile(data: unknown, source = "site file"): SiteFile {
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
 * Read and validate a site file from disk.
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

  return parseSiteFile(data, `site file ${path}`);
}
