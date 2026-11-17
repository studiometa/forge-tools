import { describe, expect, it } from "vitest";

import { ValidationError } from "../../../errors.ts";
import {
  COMMAND_VARIABLES,
  assertCommandTemplate,
  commandValues,
  renderCommand,
} from "./command-template.ts";
import { site } from "./test-fixtures.ts";

const example = site(456, "example.com", { php_version: "PHP 8.3" });

describe("commandValues", () => {
  it("gives the values of the deploy script of Forge", () => {
    expect(commandValues(example, "123")).toEqual({
      FORGE_PHP: "php8.3",
      FORGE_PHP_FPM: "php8.3-fpm",
      FORGE_SERVER_ID: "123",
      FORGE_SITE_BRANCH: "main",
      FORGE_SITE_ID: "456",
      FORGE_SITE_PATH: "/home/forge/example.com",
      FORGE_SITE_USER: "forge",
    });
  });

  it("uses the current folder of a zero-downtime site and the user of an isolated site", () => {
    const values = commandValues(
      site(457, "app.example.com", {
        zero_downtime_deployments: true,
        isolated: true,
        user: "app",
        php_version: "php84",
      }),
      "123",
    );
    expect(values.FORGE_SITE_PATH).toBe("/home/app/app.example.com/current");
    expect(values.FORGE_SITE_USER).toBe("app");
    expect(values.FORGE_PHP).toBe("php8.4");
  });
});

describe("assertCommandTemplate", () => {
  it("accepts every command variable", () => {
    const template = COMMAND_VARIABLES.map((name) => `{{ ${name} }}`).join(" ");
    expect(() => assertCommandTemplate(template, "x", "schedule")).not.toThrow();
  });

  it("refuses a variable of the deploy script that changes at each deployment", () => {
    expect(() => assertCommandTemplate("{{ FORGE_DEPLOY_COMMIT }}", "x", "schedule")).toThrow(
      ValidationError,
    );
  });
});

describe("renderCommand", () => {
  it("renders the variables only, and keeps the shell text byte for byte", () => {
    expect(
      renderCommand(
        `{{FORGE_PHP}}  {{ FORGE_SITE_PATH }}/artisan x --at="$(date -I)" ~/a_* $FORGE_PHP && 'y'`,
        example,
        "123",
      ),
    ).toBe(`php8.3  /home/forge/example.com/artisan x --at="$(date -I)" ~/a_* $FORGE_PHP && 'y'`);
  });

  it("reads the branch only when the command uses it", () => {
    const noRepository = site(1, "a.example.com", { repository: null });
    expect(renderCommand("{{ FORGE_SITE_ID }}", noRepository, "123")).toBe("1");
    expect(() => renderCommand("{{ FORGE_SITE_BRANCH }}", noRepository, "123")).toThrow(
      ValidationError,
    );
  });
});
