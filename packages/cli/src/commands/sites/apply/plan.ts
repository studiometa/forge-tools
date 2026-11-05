/**
 * Compare a site file with the state of Forge and list the changes that `apply` makes.
 * Pure functions: no API call here.
 */

import type {
  BackgroundProcessAttributes,
  DatabaseAttributes,
  DatabaseUserAttributes,
  ScheduledJobAttributes,
  SiteAttributes,
} from "@studiometa/forge-api";

import { unifiedDiff } from "../../../utils/drift.ts";
import { parseEnv } from "../../env/env-diff.ts";
import type { SiteFile } from "./site-file.ts";
import {
  type Ownership,
  type SiteRoots,
  canonicalCommand,
  daemonOwnership,
  isPathInside,
  normalizePath,
  resolvePath,
  scheduledJobOwnership,
} from "./ownership.ts";

export type Site = SiteAttributes & { id: number };
export type Daemon = BackgroundProcessAttributes & { id: number };
export type ScheduledJob = ScheduledJobAttributes & { id: number };
export type Database = DatabaseAttributes & { id: number };
export type DatabaseUser = DatabaseUserAttributes & { id: number };

/** Shown in place of a generated password. */
export const GENERATED = "<generated>";

/** What `apply` reads from Forge. A list is undefined when the site file does not manage it. */
export interface RemoteState {
  /** All sites of the server. */
  sites: Site[];
  /** The site of the file, or null when it does not exist yet. */
  site: Site | null;
  databases?: Database[];
  databaseUsers?: DatabaseUser[];
  /** Content of the site .env; null when the site does not exist. */
  env?: string | null;
  /** All daemons of the server. */
  daemons?: Daemon[];
  /** IDs of the daemons that Forge associates with the site. */
  siteDaemonIds?: ReadonlySet<number>;
  /** All scheduled jobs of the server, with the jobs of the site. */
  jobs?: ScheduledJob[];
  /** IDs of the scheduled jobs that Forge lists on the site. */
  siteJobIds?: ReadonlySet<number>;
  /** Nginx configuration on Forge and the Nginx file rendered for the site; null when the site does not exist. */
  nginx?: { remote: string; rendered: string } | null;
}

export interface SiteSettings {
  type?: string;
  php_version?: string;
  web_directory?: string;
  source_control_provider?: string;
  repository?: string;
  branch?: string;
}

export type Change =
  | { action: "create-site"; name: string; settings: SiteSettings }
  | { action: "update-site"; changes: Array<{ field: string; from: string | null; to: string }> }
  | { action: "add-alias"; name: string }
  | { action: "create-database"; name: string }
  | { action: "create-database-user"; name: string; database: string }
  | {
      action: "add-env";
      keys: string[];
      /** Keys that get the database name, user and password of a new database user. */
      generated: string[];
      /** The generated key that holds the password; its value never shows. */
      password?: string;
    }
  | { action: "create-worker"; command: string; directory: string; processes: number }
  | {
      action: "delete-worker";
      id: number;
      command: string;
      directory: string | null;
      processes: number;
    }
  | { action: "create-job"; command: string; frequency: string; cron?: string }
  /** `diff` is null for a site that does not exist yet: the file is rendered once it exists. */
  | { action: "update-nginx"; diff: string | null }
  | {
      action: "delete-job";
      id: number;
      command: string;
      frequency: string;
      cron: string;
      onSite: boolean;
    };

export interface Plan {
  changes: Change[];
  /** Differences that `apply` does not change, e.g. a different .env value. */
  warnings: string[];
}

/** The path of the site folder, e.g. `/home/forge/example.com`. */
export function siteHome(site: Pick<Site, "user" | "name">): string {
  return `/home/${site.user}/${site.name}`;
}

/** The directory that workers run in and relative `artisan` resolves against. */
export function siteWorkDirectory(site: Pick<Site, "user" | "name" | "root_directory">): string {
  return inSiteHome(site, site.root_directory || "/");
}

/**
 * Read a directory of a site, absolute (`/home/forge/example.com/public`) or relative to the
 * site folder (`/public`), as an absolute path inside the site folder. A relative `/` never
 * becomes the root of the server.
 */
function inSiteHome(site: Pick<Site, "user" | "name">, directory: string): string {
  const home = siteHome(site);
  return isPathInside(directory, home)
    ? normalizePath(directory)
    : resolvePath(home, directory.replace(/^\/+/, ""));
}

/** The paths that belong to each site, for ownership. */
export function siteRoots(sites: Site[]): SiteRoots[] {
  return sites.map((site) => ({
    id: site.id,
    roots: [...new Set([siteHome(site), siteWorkDirectory(site)].map(normalizePath))],
  }));
}

/** `PHP 8.3`, `php83` and `php8.3` all give `php83`. */
export function normalizePhp(version: string | null | undefined): string | null {
  return version ? version.toLowerCase().replaceAll(/[^a-z0-9]/g, "") : null;
}

/** Forge displays frequencies in title case, e.g. `Minutely`. */
function normalizeFrequency(frequency: string): string {
  return frequency.trim().toLowerCase();
}

/** The path a declared site uses before it exists, from its domain. */
function plannedWorkDirectory(file: SiteFile): string {
  return `/home/forge/${file.domain}`;
}

function sameName(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

/**
 * Pair declared items with existing ones that have the same key, each existing item once.
 * Returns the declared items without a match and the existing items without a match.
 */
function matchByKey<D, E>(
  declared: D[],
  existing: E[],
  declaredKey: (item: D) => string,
  existingKey: (item: E) => string,
): { missing: D[]; unmatched: E[] } {
  const pool = existing.map((item) => ({ item, key: existingKey(item), used: false }));
  const missing: D[] = [];
  for (const item of declared) {
    const key = declaredKey(item);
    const match = pool.find((entry) => !entry.used && entry.key === key);
    if (match) match.used = true;
    else missing.push(item);
  }
  return { missing, unmatched: pool.filter((entry) => !entry.used).map((entry) => entry.item) };
}

function planSite(file: SiteFile, site: Site | null, changes: Change[], warnings: string[]): void {
  if (!site) {
    changes.push({
      action: "create-site",
      name: file.domain,
      settings: {
        type: file.type,
        php_version: file.php,
        web_directory: file.webDirectory,
        source_control_provider: file.repository?.provider,
        repository: file.repository?.url,
        branch: file.repository?.branch,
      },
    });
    return;
  }

  const updates: Array<{ field: string; from: string | null; to: string }> = [];
  if (file.php && normalizePhp(site.php_version) !== normalizePhp(file.php)) {
    updates.push({ field: "php_version", from: site.php_version, to: file.php });
  }
  if (file.webDirectory) {
    const root = siteWorkDirectory(site);
    const expected = resolvePath(root, file.webDirectory.replace(/^\/+/, ""));
    // Forge gives an absolute path; a relative one is read against the site root.
    const remote = isPathInside(site.web_directory, root)
      ? normalizePath(site.web_directory)
      : resolvePath(root, site.web_directory.replace(/^\/+/, ""));
    if (remote !== expected) {
      updates.push({ field: "web_directory", from: site.web_directory, to: file.webDirectory });
    }
  }
  if (file.repository?.branch && site.repository?.branch !== file.repository.branch) {
    updates.push({
      field: "branch",
      from: site.repository?.branch ?? null,
      to: file.repository.branch,
    });
  }
  if (updates.length > 0) {
    changes.push({ action: "update-site", changes: updates });
  }

  const url = site.repository?.url;
  if (
    file.repository &&
    url &&
    url.replace(/\.git$/, "") !== file.repository.url.replace(/\.git$/, "")
  ) {
    warnings.push(
      `Repository differs on Forge (${url}): apply does not change the repository of a site.`,
    );
  }
  if (file.type && site.app_type && !sameName(site.app_type, file.type)) {
    warnings.push(
      `Site type differs on Forge (${site.app_type}): apply does not change the type of a site.`,
    );
  }
}

function planAliases(file: SiteFile, site: Site | null, changes: Change[]): void {
  const existing = site ? [site.name, ...(site.aliases ?? [])].map(String) : [];
  for (const alias of new Set(file.aliases ?? [])) {
    if (!existing.some((name) => sameName(name, alias))) {
      changes.push({ action: "add-alias", name: alias });
    }
  }
}

/** The .env keys of a new database user, from `database.env` or the Laravel names. */
export function databaseEnvKeys(database: NonNullable<SiteFile["database"]>): {
  name: string;
  user: string;
  password: string;
} {
  return {
    name: database.env?.name ?? "DB_DATABASE",
    user: database.env?.user ?? "DB_USERNAME",
    password: database.env?.password ?? "DB_PASSWORD",
  };
}

/**
 * Plan the database and its user. Returns the names of the .env keys that get generated values.
 */
function planDatabase(
  file: SiteFile,
  state: RemoteState,
  changes: Change[],
  warnings: string[],
): string[] {
  if (!file.database) return [];
  const { name, user } = file.database;
  const databaseExists = (state.databases ?? []).some((db) => db.name === name);
  const userExists = (state.databaseUsers ?? []).some((u) => u.name === user);

  if (!databaseExists) {
    changes.push({ action: "create-database", name });
  }
  if (!userExists) {
    changes.push({ action: "create-database-user", name: user, database: name });
    const keys = databaseEnvKeys(file.database);
    return [keys.name, keys.user, keys.password];
  }
  if (!databaseExists) {
    warnings.push(
      `Database user ${user} exists: apply does not give it access to the new database ${name}.`,
    );
  }
  return [];
}

function planEnv(
  file: SiteFile,
  state: RemoteState,
  generated: string[],
  changes: Change[],
  warnings: string[],
): void {
  const remote = parseEnv(state.env ?? "");
  const keys: string[] = [];
  for (const [key, value] of Object.entries(file.env ?? {})) {
    if (generated.includes(key)) continue;
    if (!remote.has(key)) keys.push(key);
    else if (remote.get(key) !== String(value)) {
      warnings.push(`.env key ${key} has another value on Forge: apply does not overwrite it.`);
    }
  }
  if (keys.length > 0 || generated.length > 0) {
    const password =
      file.database && generated.length > 0 ? databaseEnvKeys(file.database).password : undefined;
    changes.push({ action: "add-env", keys, generated, ...(password ? { password } : {}) });
  }
}

function planNginx(file: SiteFile, state: RemoteState, changes: Change[]): void {
  if (file.nginxTemplate === undefined) return;
  if (!state.nginx) {
    changes.push({ action: "update-nginx", diff: null });
    return;
  }
  const diff = unifiedDiff(state.nginx.remote, state.nginx.rendered);
  if (diff) changes.push({ action: "update-nginx", diff });
}

function describeOwnership(ownership: Ownership): string {
  return ownership === "ambiguous" ? "its owner is not certain" : "it runs as root";
}

function planWorkers(
  file: SiteFile,
  state: RemoteState,
  changes: Change[],
  warnings: string[],
): void {
  if (!file.workers) return;
  const site = state.site;
  const workDirectory = site ? siteWorkDirectory(site) : plannedWorkDirectory(file);

  const declared = file.workers.map((worker) => {
    const directory = worker.directory
      ? resolvePath(workDirectory, worker.directory)
      : workDirectory;
    return {
      command: worker.command,
      directory,
      processes: worker.processes,
      key: [canonicalCommand(worker.command, directory), directory, worker.processes, "forge"].join(
        "\n",
      ),
    };
  });

  // A site that does not exist yet owns no daemon.
  const roots = siteRoots(state.sites);
  const candidates = site
    ? (state.daemons ?? []).flatMap((daemon) => {
        const ownership = daemonOwnership(
          daemon,
          site.id,
          roots,
          state.siteDaemonIds?.has(daemon.id) ?? false,
        );
        return ownership === "other" ? [] : [{ daemon, ownership }];
      })
    : [];

  const { missing, unmatched } = matchByKey(
    declared,
    candidates,
    (worker) => worker.key,
    ({ daemon }) => {
      // A daemon without a directory compares as one in the site root, but its relative
      // `artisan` stays relative: it does not run in the site root.
      const directory = daemon.directory?.trim() ? normalizePath(daemon.directory) : null;
      return [
        canonicalCommand(daemon.command, directory),
        directory ?? workDirectory,
        daemon.processes,
        daemon.user,
      ].join("\n");
    },
  );

  for (const worker of missing) {
    changes.push({
      action: "create-worker",
      command: worker.command,
      directory: worker.directory,
      processes: worker.processes,
    });
  }

  for (const { daemon, ownership } of unmatched) {
    // Never delete a daemon of root, or one whose owner is not certain.
    if (ownership === "site" && daemon.user !== "root") {
      changes.push({
        action: "delete-worker",
        id: daemon.id,
        command: daemon.command,
        directory: daemon.directory,
        processes: daemon.processes,
      });
    } else {
      warnings.push(
        `Kept daemon ${daemon.id} (${daemon.command}): not declared, but ${describeOwnership(ownership)}.`,
      );
    }
  }
}

function planSchedule(
  file: SiteFile,
  state: RemoteState,
  changes: Change[],
  warnings: string[],
): void {
  if (!file.schedule) return;
  const site = state.site;
  const workDirectory = site ? siteWorkDirectory(site) : plannedWorkDirectory(file);

  const declared = file.schedule.map((job) => {
    const command = canonicalCommand(job.command, workDirectory);
    const frequency = normalizeFrequency(job.frequency);
    return {
      command,
      frequency,
      cron: job.cron,
      key: [command, "forge", frequency, frequency === "custom" ? job.cron : ""].join("\n"),
    };
  });

  const roots = siteRoots(state.sites);
  const seen = new Set<number>();
  const candidates = site
    ? (state.jobs ?? []).flatMap((job) => {
        if (seen.has(job.id)) return [];
        seen.add(job.id);
        const onSite = state.siteJobIds?.has(job.id) ?? false;
        const ownership = scheduledJobOwnership(job, site.id, roots, onSite);
        return ownership === "other" ? [] : [{ job, ownership, onSite }];
      })
    : [];

  const { missing, unmatched } = matchByKey(
    declared,
    candidates,
    (job) => job.key,
    ({ job }) => {
      const frequency = normalizeFrequency(job.frequency);
      return [
        canonicalCommand(job.command, workDirectory),
        job.user,
        frequency,
        frequency === "custom" ? job.cron : "",
      ].join("\n");
    },
  );

  for (const job of missing) {
    changes.push({
      action: "create-job",
      command: job.command,
      frequency: job.frequency,
      ...(job.frequency === "custom" ? { cron: job.cron } : {}),
    });
  }

  for (const { job, ownership, onSite } of unmatched) {
    if (ownership === "site" && job.user !== "root") {
      changes.push({
        action: "delete-job",
        id: job.id,
        command: job.command,
        frequency: job.frequency,
        cron: job.cron,
        onSite,
      });
    } else {
      warnings.push(
        `Kept scheduled job ${job.id} (${job.command}): not declared, but ${describeOwnership(ownership)}.`,
      );
    }
  }
}

/**
 * Compare the site file with the state of Forge. Keys that the file does not have are not
 * compared. The plan creates and updates what differs, and deletes only the workers and
 * scheduled jobs that surely belong to the site and that the file does not declare.
 */
export function buildPlan(file: SiteFile, state: RemoteState): Plan {
  const changes: Change[] = [];
  const warnings: string[] = [];

  planSite(file, state.site, changes, warnings);
  planAliases(file, state.site, changes);
  const generated = planDatabase(file, state, changes, warnings);
  if (file.env || generated.length > 0) {
    planEnv(file, state, generated, changes, warnings);
  }
  planNginx(file, state, changes);
  planWorkers(file, state, changes, warnings);
  planSchedule(file, state, changes, warnings);

  return { changes, warnings };
}

function quoted(value: string | null | undefined): string {
  return value ?? "(none)";
}

/**
 * One line per change, for human output. Values of .env keys never show.
 */
export function describeChange(change: Change): string {
  switch (change.action) {
    case "create-site": {
      const settings = Object.entries(change.settings)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => `${key}: ${value}`);
      return `+ create site ${change.name}${settings.length ? ` (${settings.join(", ")})` : ""}`;
    }
    case "update-site":
      return `~ update site: ${change.changes
        .map((c) => `${c.field} ${quoted(c.from)} → ${c.to}`)
        .join(", ")}`;
    case "add-alias":
      return `+ add alias ${change.name}`;
    case "create-database":
      return `+ create database ${change.name}`;
    case "create-database-user":
      return `+ create database user ${change.name} for ${change.database} (password: ${GENERATED})`;
    case "add-env":
      return `+ add .env keys: ${[
        ...change.keys,
        ...change.generated.map((key) => (key === change.password ? `${key}=${GENERATED}` : key)),
      ].join(", ")}`;
    case "update-nginx":
      return change.diff === null
        ? "~ write Nginx configuration (rendered once the site exists)"
        : `~ update Nginx configuration:\n${change.diff}`;
    case "create-worker":
      return `+ create worker: ${change.command} (directory: ${change.directory}, processes: ${change.processes})`;
    case "delete-worker":
      return `- delete worker ${change.id}: ${change.command} (directory: ${quoted(change.directory)}, processes: ${change.processes})`;
    case "create-job":
      return `+ create scheduled job: ${change.command} (${change.frequency}${change.cron ? ` ${change.cron}` : ""})`;
    case "delete-job":
      return `- delete scheduled job ${change.id}: ${change.command} (${change.frequency.toLowerCase()} ${change.cron})`;
  }
}

/**
 * The plan as text: one line per change, then the warnings.
 */
export function formatPlan(plan: Plan): string {
  return [
    ...plan.changes.map(describeChange),
    ...plan.warnings.map((warning) => `! ${warning}`),
  ].join("\n");
}
