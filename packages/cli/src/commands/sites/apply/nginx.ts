/**
 * The Nginx file of a site file: an Nginx configuration with the template variables of Forge,
 * e.g. `{{ PROXY_PASS }}`, rendered locally with the values of the site.
 * See https://forge.laravel.com/docs/servers/nginx-templates
 */

import type { ServerAttributes } from "@studiometa/forge-api";

import { ValidationError } from "../../../errors.ts";
import { isPathInside, normalizePath } from "./ownership.ts";
import { type Site, siteWorkDirectory } from "./plan.ts";

/** The variables of Forge Nginx templates. Forge accepts spaces inside the braces. */
export const NGINX_VARIABLES = [
  "DIRECTORY",
  "DOMAINS",
  "PATH",
  "PORT",
  "PORT_V6",
  "PROXY_PASS",
  "ROOT_PATH",
  "SERVER_PUBLIC_IP",
  "SERVER_PRIVATE_IP",
  "SITE",
  "SITE_ID",
  "USER",
] as const;

export type NginxVariable = (typeof NGINX_VARIABLES)[number];

/** The variables that need the server, not only the site. */
const SERVER_VARIABLES: ReadonlySet<string> = new Set(["SERVER_PUBLIC_IP", "SERVER_PRIVATE_IP"]);

const VARIABLE = /\{\{\s*([^{}]*?)\s*\}\}/g;

/** The names of the variables in a template, each once, in order. */
export function templateVariables(template: string): string[] {
  return [...new Set([...template.matchAll(VARIABLE)].map((match) => match[1]))];
}

/**
 * Exit with a validation error when the template has a variable that Forge does not define.
 */
export function assertNginxTemplate(template: string, source: string): void {
  const known: ReadonlySet<string> = new Set(NGINX_VARIABLES);
  const unknown = templateVariables(template).filter((name) => !known.has(name));
  if (unknown.length > 0) {
    throw new ValidationError(
      `Nginx file ${source} has unknown variables: ${unknown.map((name) => `{{${name}}}`).join(", ")}`,
      "nginx",
      [`Supported variables: ${NGINX_VARIABLES.map((name) => `{{${name}}}`).join(", ")}`],
    );
  }
}

/** True when rendering the template needs the attributes of the server. */
export function needsServer(template: string): boolean {
  return templateVariables(template).some((name) => SERVER_VARIABLES.has(name));
}

/** `PHP 8.3`, `php83` and `php8.3` all give `8.3`. */
export function phpSocketVersion(version: string): string {
  const digits = version.replaceAll(/\D/g, "");
  if (digits.length < 2) {
    throw new ValidationError(`Cannot read the PHP version ${version} of the site`, "nginx");
  }
  return `${digits[0]}.${digits.slice(1)}`;
}

export type NginxServer = Pick<ServerAttributes, "ip_address" | "private_ip_address">;

/**
 * The value of each variable for a site, as Forge renders its templates.
 * A server is needed only for the `SERVER_*` variables.
 */
export function nginxValues(
  site: Site,
  server: NginxServer | null = null,
): Record<NginxVariable, string> {
  const root = siteWorkDirectory(site);
  const path = isPathInside(site.web_directory, root)
    ? normalizePath(site.web_directory)
    : normalizePath(`${root}/${site.web_directory}`);
  const directory = path === root ? "/" : path.slice(root.length);
  const defaultServer = site.name === "default" ? " default_server" : "";
  const isolated = site.isolated ? `-${site.user}` : "";

  return {
    DIRECTORY: directory,
    DOMAINS: [site.name, ...(site.aliases ?? [])].join(" "),
    PATH: path,
    PORT: `80${defaultServer}`,
    PORT_V6: `[::]:80${defaultServer}`,
    get PROXY_PASS() {
      return `unix:/var/run/php/php${phpSocketVersion(site.php_version)}-fpm${isolated}.sock`;
    },
    ROOT_PATH: root,
    SERVER_PUBLIC_IP: server?.ip_address ?? "",
    SERVER_PRIVATE_IP: server?.private_ip_address ?? "",
    SITE: site.name,
    SITE_ID: String(site.id),
    USER: site.user,
  };
}

/**
 * Replace each variable of the template with its value for the site.
 */
export function renderNginx(
  template: string,
  site: Site,
  server: NginxServer | null = null,
): string {
  const values = nginxValues(site, server);
  return template.replaceAll(VARIABLE, (match, name: string) =>
    name in values ? values[name as NginxVariable] : match,
  );
}
