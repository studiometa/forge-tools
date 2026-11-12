/**
 * Read the state of Forge for a site file, and run a plan against Forge.
 */

import { randomBytes } from "node:crypto";

import {
  createDaemon,
  createDatabase,
  createDatabaseUser,
  createDomain,
  createScheduledJob,
  createSite,
  deleteDaemon,
  deleteScheduledJob,
  getDatabase,
  getDatabaseUser,
  getEnv,
  getNginxConfig,
  getServer,
  getSite,
  listDaemons,
  listDatabaseUsers,
  listDatabases,
  listDomains,
  listLoadBalancingNodes,
  listScheduledJobs,
  listServers,
  listSites,
  updateEnv,
  updateLoadBalancingNodes,
  updateNginxConfig,
  updateSite,
} from "@studiometa/forge-core";

import type { CliExecutorContext } from "../../../context.ts";
import { CliError, ValidationError } from "../../../errors.ts";
import { unifiedDiff } from "../../../utils/drift.ts";
import { matchServerId } from "../../../utils/resolve.ts";
import { needsServer, renderNginx } from "./nginx.ts";
import {
  type Change,
  type Plan,
  type RemoteState,
  type Site,
  buildPlan,
  databaseEnvKeys,
} from "./plan.ts";
import type { SiteFile } from "./site-file.ts";

/** Error of `apply` that is not a validation error, e.g. a site that never gets installed. */
export class ApplyError extends CliError {
  readonly code = "APPLY_ERROR";
  readonly isRecoverable = false;
}

/**
 * Resolve the server of the site file, always with an exact name (never a partial match).
 */
export async function resolveApplyServer(
  server: string | number,
  ctx: CliExecutorContext,
): Promise<string> {
  const value = String(server);
  if (/^\d+$/.test(value)) return value;
  const servers = await listServers({}, ctx);
  return matchServerId(value, servers.data, true);
}

/**
 * The site named `domain` on the server, compared without case. A partial match never counts.
 */
export function findSite(sites: Site[], domain: string): Site | null {
  return sites.find((site) => site.name.toLowerCase() === domain.toLowerCase()) ?? null;
}

/**
 * The site of the load balancer named `domain` or one of the aliases, compared without case.
 * Its name can be any of them, e.g. the domain without `www`. Two matches are an error: a guess
 * could send the traffic of another site.
 */
export function findLoadBalancerSite(sites: Site[], names: string[]): Site | null {
  const wanted = new Set(names.map((name) => name.toLowerCase()));
  const matches = sites.filter((site) => wanted.has(site.name.toLowerCase()));
  if (matches.length > 1) {
    throw new ValidationError(
      `Several sites of the load balancer match the site file: ${matches.map((site) => site.name).join(", ")}`,
      "loadBalancer",
      ["Keep one site for the domain and its aliases on the load balancer"],
    );
  }
  return matches[0] ?? null;
}

/**
 * Exit with a validation error when the load balancer has no site for the site file: the Forge
 * API cannot create a site on a load balancer.
 */
export function assertLoadBalancerSite(file: SiteFile, state: RemoteState): void {
  if (file.loadBalancer && !state.loadBalancer?.site) {
    throw new ValidationError(
      `The load balancer ${file.loadBalancer.server} has no site for ${file.domain}`,
      "loadBalancer",
      [
        `In Forge, create the site ${file.domain} on the load balancer (New site), then run apply again`,
        "Check the domain, the aliases and the server of the load balancer",
      ],
    );
  }
}

/**
 * Read from Forge what the site file manages, and nothing else.
 */
export async function readRemoteState(
  file: SiteFile,
  serverId: string,
  ctx: CliExecutorContext,
): Promise<RemoteState> {
  const sites = (await listSites({ server_id: serverId }, ctx)).data;
  const site = findSite(sites, file.domain);
  const siteId = site ? String(site.id) : undefined;
  const state: RemoteState = { sites, site };

  if (file.database) {
    state.databases = (await listDatabases({ server_id: serverId }, ctx)).data;
    state.databaseUsers = (await listDatabaseUsers({ server_id: serverId }, ctx)).data;
  }

  if (file.env || file.database) {
    state.env = siteId ? (await getEnv({ server_id: serverId, site_id: siteId }, ctx)).data : null;
  }

  if (file.workers) {
    state.daemons = (await listDaemons({ server_id: serverId }, ctx)).data;
    state.siteDaemonIds = new Set(
      siteId
        ? (await listDaemons({ server_id: serverId, site_id: siteId }, ctx)).data.map((d) => d.id)
        : [],
    );
  }

  if (site && (file.aliases || file.nginxTemplate !== undefined)) {
    state.domains = await readDomains(serverId, site, ctx);
  }

  if (file.nginxTemplate !== undefined) {
    state.nginx =
      site && state.domains
        ? await readNginx(file.nginxTemplate, serverId, site, state.domains, ctx)
        : null;
  }

  if (file.schedule) {
    const siteJobs = siteId
      ? (await listScheduledJobs({ server_id: serverId, site_id: siteId }, ctx)).data
      : [];
    const serverJobs = (await listScheduledJobs({ server_id: serverId }, ctx)).data;
    state.jobs = [...siteJobs, ...serverJobs];
    state.siteJobIds = new Set(siteJobs.map((job) => job.id));
  }

  if (file.loadBalancer) {
    const balancerId = await resolveApplyServer(file.loadBalancer.server, ctx);
    const balancerSites = (await listSites({ server_id: balancerId }, ctx)).data;
    const balancerSite = findLoadBalancerSite(balancerSites, [
      file.domain,
      ...(file.aliases ?? []),
    ]);
    const nodes = balancerSite
      ? (
          await listLoadBalancingNodes(
            { server_id: balancerId, site_id: String(balancerSite.id) },
            ctx,
          )
        ).data
      : [];
    state.loadBalancer = {
      serverId: balancerId,
      site: balancerSite,
      nodes,
      target: Number(serverId),
    };
  }

  return state;
}

/**
 * The names of the domains of a site on Forge, the primary domain first, then the aliases.
 * The `aliases` of a site are always null in the Forge API: the domains route lists them.
 */
export async function readDomains(
  serverId: string,
  site: Site,
  ctx: CliExecutorContext,
): Promise<string[]> {
  const domains = (await listDomains({ server_id: serverId, site_id: String(site.id) }, ctx)).data;
  return [
    ...domains.filter((domain) => domain.type === "primary"),
    ...domains.filter((domain) => domain.type !== "primary"),
  ].map((domain) => domain.name);
}

/**
 * Read the Nginx configuration of a site on Forge and render the Nginx file for the site.
 */
export async function readNginx(
  template: string,
  serverId: string,
  site: Site,
  domains: string[],
  ctx: CliExecutorContext,
): Promise<{ remote: string; rendered: string }> {
  const remote = (await getNginxConfig({ server_id: serverId, site_id: String(site.id) }, ctx))
    .data;
  const server = needsServer(template)
    ? (await getServer({ server_id: serverId }, ctx)).data
    : null;
  return { remote, rendered: renderNginx(template, site, domains, server) };
}

/**
 * Exit with a validation error when the site does not exist and the site file cannot create it.
 */
export function assertCanCreateSite(file: SiteFile, state: RemoteState): void {
  if (!state.site && !file.type) {
    throw new ValidationError(
      `Site ${file.domain} does not exist and the site file has no type to create it`,
      "type",
      ['Add "type" to the site file, e.g. "type": "php"', "Check the domain and the server"],
    );
  }
}

/** A random password for a database user: 32 characters, letters and digits only. */
export function generatePassword(): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  // 248 is the largest multiple of 62 below 256: drop higher bytes to keep the draw uniform.
  let password = "";
  while (password.length < 32) {
    for (const byte of randomBytes(64)) {
      if (byte < 248 && password.length < 32) password += alphabet[byte % 62];
    }
  }
  return password;
}

/** Write a value for a .env file, quoted when it needs quotes. */
export function formatEnvValue(value: string): string {
  if (/^[\w.,:/@+-]*$/.test(value)) return value;
  if (!value.includes("'") && !value.includes("\n")) return `'${value}'`;
  return `"${value.replaceAll("\\", "\\\\").replaceAll('"', '\\"').replaceAll("\n", "\\n")}"`;
}

/**
 * Set .env variables: replace the line of a variable that exists, append the others.
 */
export function setEnvValues(content: string, values: Map<string, string>): string {
  const lines = content === "" ? [] : content.replace(/\n$/, "").split("\n");
  const pending = new Map(values);
  const result = lines.map((line) => {
    const match = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_.]*)\s*=/.exec(line);
    const name = match?.[1];
    if (name && pending.has(name)) {
      const value = pending.get(name)!;
      pending.delete(name);
      return `${name}=${formatEnvValue(value)}`;
    }
    return line;
  });
  for (const [name, value] of pending) {
    result.push(`${name}=${formatEnvValue(value)}`);
  }
  return `${result.join("\n")}\n`;
}

export interface ApplyOptions {
  /** Wait between two reads of a new site; injectable for tests. */
  sleep?: (ms: number) => Promise<void>;
  /** Time between two reads of a new site, in ms. */
  pollIntervalMs?: number;
  /** Time to wait for a new site, database or database user to be installed, in ms. */
  timeoutMs?: number;
  /** Called before each change. */
  onChange?: (change: Change) => void;
  /** Generate a password; injectable for tests. */
  generatePassword?: () => string;
}

/** Forge clones the repository with the key of the server: the git host must accept it. */
const REPOSITORY_HINT = (serverId: string) =>
  `Check that the git host accepts the key of the server: forge servers public-key ${serverId}`;

const defaultSleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

/**
 * Read a new resource until Forge has installed it. Throw the error of `fail` when its status is
 * `failed` or when it is not installed in time.
 */
async function waitForInstalled<T extends { status: string }>(
  read: () => Promise<T>,
  fail: (resource: T) => ApplyError,
  options: ApplyOptions,
): Promise<void> {
  const sleep = options.sleep ?? defaultSleep;
  const interval = options.pollIntervalMs ?? 5000;
  const timeout = options.timeoutMs ?? 600_000;
  for (let waited = 0; ; waited += interval) {
    const resource = await read();
    if (resource.status === "installed") return;
    if (resource.status === "failed" || waited >= timeout) throw fail(resource);
    await sleep(interval);
  }
}

async function waitForSite(
  file: SiteFile,
  serverId: string,
  siteId: string,
  ctx: CliExecutorContext,
  options: ApplyOptions,
): Promise<void> {
  await waitForInstalled(
    async () => (await getSite({ server_id: serverId, site_id: siteId }, ctx)).data,
    (site) =>
      new ApplyError(`Site ${site.name} is still ${site.status} on Forge`, [
        "Run forge sites apply again once the site is installed",
        ...(file.repository ? [REPOSITORY_HINT(serverId)] : []),
      ]),
    options,
  );
}

interface DatabaseIds {
  database_id?: number;
  database_user_id?: string;
}

/**
 * Create the database and its user. Returns their IDs and the .env values to write.
 */
async function applyDatabase(
  file: SiteFile,
  plan: Plan,
  state: RemoteState,
  serverId: string,
  ctx: CliExecutorContext,
  options: ApplyOptions,
): Promise<{ ids: DatabaseIds; env: Map<string, string> }> {
  const env = new Map<string, string>();
  const ids: DatabaseIds = {};
  if (!file.database) return { ids, env };

  let databaseId = state.databases?.find((db) => db.name === file.database!.name)?.id;
  for (const change of plan.changes) {
    if (change.action === "create-database") {
      options.onChange?.(change);
      const id = (await createDatabase({ server_id: serverId, name: change.name }, ctx)).data.id;
      // Forge refuses a user for a database that it is still installing.
      await waitForInstalled(
        async () => (await getDatabase({ server_id: serverId, id: String(id) }, ctx)).data,
        (database) =>
          new ApplyError(`Database ${change.name} is ${database.status} on Forge, not installed`, [
            "Run forge sites apply again once the database is installed",
          ]),
        options,
      );
      databaseId = id;
    } else if (change.action === "create-database-user") {
      options.onChange?.(change);
      const password = (options.generatePassword ?? generatePassword)();
      const user = await createDatabaseUser(
        {
          server_id: serverId,
          name: change.name,
          password,
          ...(databaseId === undefined ? {} : { database_ids: [databaseId] }),
        },
        ctx,
      );
      // Forge refuses a site with a user that it is still installing. The password is only in
      // memory until apply writes the .env of the site: a user that is not installed is lost.
      await waitForInstalled(
        async () =>
          (await getDatabaseUser({ server_id: serverId, id: String(user.data.id) }, ctx)).data,
        (created) =>
          new ApplyError(
            `Database user ${change.name} is ${created.status} on Forge, not installed`,
            [
              `The database user ${change.name} exists on Forge, but its password was not saved`,
              `Delete the database user ${change.name} on Forge before you run forge sites apply again`,
            ],
          ),
        options,
      );
      ids.database_user_id = String(user.data.id);
      const keys = databaseEnvKeys(file.database);
      env.set(keys.name, change.database);
      env.set(keys.user, change.name);
      env.set(keys.password, password);
    }
  }
  if (databaseId !== undefined) ids.database_id = databaseId;
  return { ids, env };
}

/**
 * Write the rendered Nginx file when it differs from Forge. After a change of the site or its
 * aliases, read the site and its domains again: the web directory and the domains are template
 * variables.
 */
async function applyNginx(
  template: string,
  plan: Plan,
  serverId: string,
  site: Site,
  domains: string[],
  ctx: CliExecutorContext,
  options: ApplyOptions,
): Promise<void> {
  const siteChanged = plan.changes.some((change) => change.action === "update-site");
  const aliasAdded = plan.changes.some((change) => change.action === "add-alias");
  const planned = plan.changes.some((change) => change.action === "update-nginx");
  if (!planned && !siteChanged && !aliasAdded) return;

  const params = { server_id: serverId, site_id: String(site.id) };
  const current = siteChanged ? (await getSite(params, ctx)).data : site;
  const currentDomains = aliasAdded ? await readDomains(serverId, site, ctx) : domains;
  const { remote, rendered } = await readNginx(template, serverId, current, currentDomains, ctx);
  const diff = unifiedDiff(remote, rendered);
  if (!diff) return;
  options.onChange?.({ action: "update-nginx", diff });
  await updateNginxConfig({ ...params, content: rendered }, ctx);
}

/**
 * Run the changes of a plan for a site that exists.
 */
async function applyChanges(
  file: SiteFile,
  plan: Plan,
  state: RemoteState,
  serverId: string,
  site: Site,
  generatedEnv: Map<string, string>,
  ctx: CliExecutorContext,
  options: ApplyOptions,
  newSiteEnv?: Change,
): Promise<void> {
  const params = { server_id: serverId, site_id: String(site.id) };
  const { env: databaseEnv } = await applyDatabase(file, plan, state, serverId, ctx, options);
  const env = new Map([...generatedEnv, ...databaseEnv]);
  const creations: Change[] = [];
  const deletions: Change[] = [];

  for (const change of plan.changes) {
    switch (change.action) {
      case "update-site": {
        options.onChange?.(change);
        const update: Record<string, string> = {};
        for (const { field, to } of change.changes) {
          if (field === "php_version") update.php_version = to;
          if (field === "web_directory") update.directory = to;
          if (field === "branch") update.repository_branch = to;
        }
        await updateSite({ ...params, ...update }, ctx);
        break;
      }
      case "add-alias":
        options.onChange?.(change);
        await createDomain(
          {
            ...params,
            name: change.name,
            allow_wildcard_subdomains: false,
            www_redirect_type: "none",
          },
          ctx,
        );
        break;
      case "add-env":
        for (const key of change.keys) env.set(key, String(file.env?.[key]));
        break;
      case "create-worker":
      case "create-job":
        creations.push(change);
        break;
      case "delete-worker":
      case "delete-job":
        deletions.push(change);
        break;
      default:
        break;
    }
  }

  if (newSiteEnv) {
    // A site created in this run: the site file owns the whole .env, and the keys that Forge
    // copied from .env.example go away. The generated database keys win over the file.
    options.onChange?.(newSiteEnv);
    const fileEnv = Object.entries(file.env ?? {}).map(([key, value]): [string, string] => [
      key,
      String(value),
    ]);
    const content = setEnvValues("", new Map([...fileEnv, ...env]));
    await updateEnv({ ...params, content }, ctx);
  } else if (env.size > 0) {
    const addEnv = plan.changes.find((change) => change.action === "add-env");
    if (addEnv) options.onChange?.(addEnv);
    const content = (await getEnv(params, ctx)).data;
    await updateEnv({ ...params, content: setEnvValues(content, env) }, ctx);
  }

  if (file.nginxTemplate !== undefined) {
    await applyNginx(file.nginxTemplate, plan, serverId, site, state.domains ?? [], ctx, options);
  }

  // Create first, then delete: a changed worker runs again before the old one stops.
  for (const change of creations) {
    options.onChange?.(change);
    if (change.action === "create-worker") {
      await createDaemon(
        {
          server_id: serverId,
          site_id: site.id,
          name: change.command.slice(0, 255),
          command: change.command,
          user: "forge",
          directory: change.directory,
          processes: change.processes,
        },
        ctx,
      );
    } else if (change.action === "create-job") {
      await createScheduledJob(
        {
          ...params,
          command: change.command,
          user: "forge",
          frequency: change.frequency,
          ...(change.cron ? { cron: change.cron } : {}),
        },
        ctx,
      );
    }
  }

  // Last: the load balancer sends traffic to the server once the site is ready there.
  const balancer = state.loadBalancer;
  const balancing = plan.changes.find((change) => change.action === "update-load-balancer");
  if (balancing?.action === "update-load-balancer" && balancer?.site) {
    options.onChange?.(balancing);
    await updateLoadBalancingNodes(
      {
        server_id: balancer.serverId,
        site_id: String(balancer.site.id),
        balancer_method: "round_robin",
        balancing: [{ ...balancing.to, weight: 1 }],
      },
      ctx,
    );
  }

  for (const change of deletions) {
    options.onChange?.(change);
    if (change.action === "delete-worker") {
      await deleteDaemon({ server_id: serverId, id: String(change.id) }, ctx);
    } else if (change.action === "delete-job") {
      await deleteScheduledJob(
        {
          server_id: serverId,
          id: String(change.id),
          ...(change.onSite ? { site_id: params.site_id } : {}),
        },
        ctx,
      );
    }
  }
}

/**
 * Apply a site file: create the site when it does not exist and wait until Forge installs it,
 * then read the state again and run the other changes. Returns the plan that ran first.
 */
export async function applySiteFile(
  file: SiteFile,
  serverId: string,
  ctx: CliExecutorContext,
  options: ApplyOptions = {},
): Promise<Plan> {
  let state = await readRemoteState(file, serverId, ctx);
  assertLoadBalancerSite(file, state);
  const firstPlan = buildPlan(file, state);
  let plan = firstPlan;
  let generatedEnv = new Map<string, string>();

  const createSiteChange = plan.changes.find((change) => change.action === "create-site");
  if (createSiteChange && createSiteChange.action === "create-site") {
    assertCanCreateSite(file, state);
    const database = await applyDatabase(file, plan, state, serverId, ctx, options);
    generatedEnv = database.env;
    options.onChange?.(createSiteChange);
    const { settings } = createSiteChange;
    const created = await createSite(
      {
        server_id: serverId,
        type: file.type!,
        name: file.domain,
        domain_mode: "custom",
        www_redirect_type: "none",
        allow_wildcard_subdomains: false,
        ...(settings.php_version ? { php_version: settings.php_version } : {}),
        ...(settings.web_directory ? { web_directory: settings.web_directory } : {}),
        ...(settings.source_control_provider
          ? { source_control_provider: settings.source_control_provider }
          : {}),
        ...(settings.repository ? { repository: settings.repository } : {}),
        ...(settings.branch ? { branch: settings.branch } : {}),
        ...database.ids,
      },
      ctx,
    );
    await waitForSite(file, serverId, String(created.data.id), ctx, options);
    state = await readRemoteState(file, serverId, ctx);
    plan = buildPlan(file, state);
  }

  const site = state.site;
  if (!site) {
    throw new ApplyError(`Site ${file.domain} is not on server ${serverId} after its creation`);
  }
  const newSiteEnv = createSiteChange
    ? firstPlan.changes.find((change) => change.action === "add-env" && change.replace)
    : undefined;
  await applyChanges(file, plan, state, serverId, site, generatedEnv, ctx, options, newSiteEnv);
  return firstPlan;
}
