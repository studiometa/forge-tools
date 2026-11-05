/**
 * Path and command helpers of `forge sites apply`: normalize commands so that
 * equivalent spellings compare equal, and find which site owns a daemon or a scheduled job.
 *
 * Ownership is strict on purpose: `apply` deletes the workers and scheduled jobs of a site
 * that the site file does not declare, and a server often hosts many sites.
 */

import { posix } from "node:path";

/** A site, as far as ownership is concerned. */
export interface SiteRoots {
  id: number;
  /** Absolute paths that belong to the site, e.g. `/home/forge/example.com`. */
  roots: string[];
}

/**
 * Normalize an absolute path: resolve `.` and `..`, collapse repeated slashes
 * and drop the trailing slash.
 */
export function normalizePath(path: string): string {
  const normalized = posix.normalize(path.trim());
  return normalized.length > 1 && normalized.endsWith("/") ? normalized.slice(0, -1) : normalized;
}

/**
 * Whether `path` is `root` or inside it, compared on whole path segments:
 * `/home/forge/a.com` contains `/home/forge/a.com/current` but not `/home/forge/a.com-staging`.
 */
export function isPathInside(path: string, root: string): boolean {
  const child = normalizePath(path);
  const parent = normalizePath(root);
  if (parent === "/") return child.startsWith("/");
  return child === parent || child.startsWith(`${parent}/`);
}

/**
 * Resolve `path` against `base` when it is relative.
 */
export function resolvePath(base: string, path: string): string {
  return normalizePath(path.startsWith("/") ? path : posix.join(base, path));
}

function escapeRegExp(value: string): string {
  return value.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
}

/**
 * Whether a shell command uses `root` as a whole path: `root` must start the command or follow
 * a space, a quote, `=` or a shell operator, and must end the command or be followed by `/`,
 * a space, a quote or a shell operator. `/home/forge/a.com` is not found in
 * `/home/forge/a.com-staging/artisan`, `/home/forge/a.com.old` or `/home/forge/*`.
 */
export function commandUsesPath(command: string, root: string): boolean {
  const path = normalizePath(root);
  if (path === "/") return false;
  const pattern = new RegExp(
    String.raw`(?:^|[\s'"=(;&|<>:])${escapeRegExp(path)}(?=$|[/\s'";&|)<>])`,
  );
  return pattern.test(command);
}

/**
 * Split a shell command into words, with the quoting rules of a POSIX shell:
 * single quotes keep everything, double quotes and a backslash escape one character.
 */
export function splitCommand(command: string): string[] {
  const words: string[] = [];
  let word = "";
  let inWord = false;
  let quote: "'" | '"' | null = null;

  for (let index = 0; index < command.length; index++) {
    const char = command[index];
    if (quote === "'") {
      if (char === "'") quote = null;
      else word += char;
    } else if (quote === '"') {
      if (char === '"') quote = null;
      else if (
        char === "\\" &&
        index + 1 < command.length &&
        '"\\$`'.includes(command[index + 1])
      ) {
        word += command[++index];
      } else word += char;
    } else if (char === "'" || char === '"') {
      quote = char;
      inWord = true;
    } else if (char === "\\" && index + 1 < command.length) {
      word += command[++index];
      inWord = true;
    } else if (/\s/.test(char)) {
      if (inWord) words.push(word);
      word = "";
      inWord = false;
    } else {
      word += char;
      inWord = true;
    }
  }

  if (inWord) words.push(word);
  return words;
}

/**
 * Quote a word for a POSIX shell when it needs quotes.
 */
export function quoteWord(word: string): string {
  if (word !== "" && /^[\w@%+=:,./-]+$/.test(word)) return word;
  return `'${word.replaceAll("'", String.raw`'\''`)}'`;
}

/**
 * Write a command in one canonical form, so that equivalent spellings compare equal:
 * quotes only where needed, single spaces, and a relative `artisan` (or `./artisan`)
 * replaced by its absolute path in `directory`.
 *
 * `php artisan queue:work 'database'  --queue="default"` in `/home/forge/example.com/`
 * gives `php /home/forge/example.com/artisan queue:work database --queue=default`.
 */
export function canonicalCommand(command: string, directory: string | null): string {
  return splitCommand(command)
    .map((word) => {
      if (directory && (word === "artisan" || word === "./artisan")) {
        return `${normalizePath(directory)}/artisan`;
      }
      return word;
    })
    .map(quoteWord)
    .join(" ");
}

/**
 * The site whose root holds `path`: the most specific root wins, so a site in
 * `/home/forge/a.com/admin` is not owned by `/home/forge/a.com`. Returns null when no site holds it.
 */
export function siteOfPath(path: string, sites: SiteRoots[]): number | null {
  let best: { id: number; length: number } | null = null;
  for (const site of sites) {
    for (const root of site.roots) {
      if (isPathInside(path, root)) {
        const length = normalizePath(root).length;
        if (!best || length > best.length) best = { id: site.id, length };
      }
    }
  }
  return best?.id ?? null;
}

/**
 * The sites whose roots a command uses as a path.
 */
export function sitesOfCommand(command: string, sites: SiteRoots[]): number[] {
  return sites
    .filter((site) => site.roots.some((root) => commandUsesPath(command, root)))
    .map((site) => site.id);
}

/**
 * Who owns a daemon or a scheduled job, from the point of view of one site:
 * - `site`: it belongs to the site; `apply` can match it, and delete it when it is not declared
 * - `ambiguous`: it may belong to the site; `apply` can match it but never deletes it
 * - `other`: it belongs to another site, to the server, or to nobody known; `apply` ignores it
 */
export type Ownership = "site" | "ambiguous" | "other";

/**
 * Ownership of a daemon (a Forge background process).
 *
 * - With a directory: the site that holds the directory (see {@link siteOfPath}).
 * - Without a directory: `ambiguous` when the command uses the site root, `site` only when
 *   the command uses no other site root and Forge also associates the daemon with the site.
 */
export function daemonOwnership(
  daemon: { directory: string | null; command: string },
  siteId: number,
  sites: SiteRoots[],
  associatedWithSite: boolean,
): Ownership {
  if (daemon.directory && daemon.directory.trim()) {
    return siteOfPath(daemon.directory, sites) === siteId ? "site" : "other";
  }

  const owners = sitesOfCommand(daemon.command, sites);
  if (!owners.includes(siteId)) return "other";
  return owners.length === 1 && associatedWithSite ? "site" : "ambiguous";
}

/**
 * Ownership of a scheduled job. Forge lists the jobs of a site on a site route: those
 * belong to the site. A job of the server belongs to the site when its command uses the
 * site root and no other site root; when it uses several site roots, it is `ambiguous`.
 */
export function scheduledJobOwnership(
  job: { command: string },
  siteId: number,
  sites: SiteRoots[],
  listedOnSite: boolean,
): Ownership {
  if (listedOnSite) return "site";
  const owners = sitesOfCommand(job.command, sites);
  if (!owners.includes(siteId)) return "other";
  return owners.length === 1 ? "site" : "ambiguous";
}
