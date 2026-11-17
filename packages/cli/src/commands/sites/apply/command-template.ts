/**
 * The commands (and worker directories) of a site file: shell text with template variables
 * named after the environment variables that Forge gives to the deploy script, e.g.
 * `{{ FORGE_PHP }} {{ FORGE_SITE_PATH }}/artisan schedule:run`. Only the values that stay the same
 * between deployments are available. Everything else in the text, `$FORGE_PHP` included, is left
 * to the shell. See https://forge.laravel.com/docs/sites/deployments#environment-variables
 */

import { ValidationError } from "../../../errors.ts";
import { phpSocketVersion } from "./nginx.ts";
import { type Site, siteHome } from "./plan.ts";
import { assertTemplate, renderTemplate, templateVariables } from "./template.ts";

export const COMMAND_VARIABLES = [
  "FORGE_PHP",
  "FORGE_PHP_FPM",
  "FORGE_SERVER_ID",
  "FORGE_SITE_BRANCH",
  "FORGE_SITE_ID",
  "FORGE_SITE_PATH",
  "FORGE_SITE_ROOT",
  "FORGE_SITE_USER",
] as const;

export type CommandVariable = (typeof COMMAND_VARIABLES)[number];

/**
 * Exit with a validation error when the text has a variable that is not a command variable.
 * `subject` names the text in the message, e.g. `schedule[0].command`.
 */
export function assertCommandTemplate(template: string, subject: string, field: string): void {
  assertTemplate(template, COMMAND_VARIABLES, subject, field);
}

/** True when the text has template variables. */
export function hasVariables(template: string): boolean {
  return templateVariables(template).length > 0;
}

/**
 * The value of each variable for a site, as Forge sets it in the deploy script.
 * `FORGE_SITE_PATH` is the `current` folder of a site with zero-downtime deployments.
 */
export function commandValues(site: Site, serverId: string): Record<CommandVariable, string> {
  const root = siteHome(site);
  return {
    get FORGE_PHP() {
      return `php${phpSocketVersion(site.php_version)}`;
    },
    get FORGE_PHP_FPM() {
      return `php${phpSocketVersion(site.php_version)}-fpm`;
    },
    FORGE_SERVER_ID: serverId,
    get FORGE_SITE_BRANCH() {
      const branch = site.repository?.branch;
      if (!branch) {
        throw new ValidationError(
          `Site ${site.name} has no branch for {{FORGE_SITE_BRANCH}}`,
          "repository",
        );
      }
      return branch;
    },
    FORGE_SITE_ID: String(site.id),
    FORGE_SITE_PATH: site.zero_downtime_deployments ? `${root}/current` : root,
    FORGE_SITE_ROOT: root,
    FORGE_SITE_USER: site.user,
  };
}

/** Replace each variable of the text with its value for the site. */
export function renderCommand(template: string, site: Site, serverId: string): string {
  return renderTemplate(template, commandValues(site, serverId));
}
