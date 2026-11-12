import { describe, expect, it } from "vitest";

import { ValidationError } from "../../../errors.ts";
import {
  NGINX_VARIABLES,
  assertNginxTemplate,
  needsServer,
  nginxValues,
  phpSocketVersion,
  renderNginx,
  templateVariables,
} from "./nginx.ts";
import { site } from "./test-fixtures.ts";

const example = site(456, "www.example.com", { aliases: null, php_version: "PHP 8.3" });
const exampleDomains = ["www.example.com", "example.com"];

describe("templateVariables", () => {
  it("lists each variable once, with or without spaces in the braces", () => {
    expect(templateVariables("{{SITE}} {{ SITE }} {{  PROXY_PASS  }} $uri {x}")).toEqual([
      "SITE",
      "PROXY_PASS",
    ]);
  });
});

describe("assertNginxTemplate", () => {
  it("accepts every variable of Forge", () => {
    const template = NGINX_VARIABLES.map((name) => `{{ ${name} }}`).join("\n");
    expect(() => assertNginxTemplate(template, "nginx.conf")).not.toThrow();
  });

  it("refuses an unknown variable and names it", () => {
    let error: unknown;
    try {
      assertNginxTemplate("root {{PATH}};\nserver_name {{ DOMAIN }} {{site}};", "nginx.conf");
    } catch (caught) {
      error = caught;
    }
    expect(error).toBeInstanceOf(ValidationError);
    expect((error as ValidationError).message).toBe(
      "Nginx file nginx.conf has unknown variables: {{DOMAIN}}, {{site}}",
    );
    expect((error as ValidationError).field).toBe("nginx");
  });
});

describe("needsServer", () => {
  it("is true only with a SERVER_ variable", () => {
    expect(needsServer("{{ SITE }}")).toBe(false);
    expect(needsServer("allow {{ SERVER_PRIVATE_IP }};")).toBe(true);
  });
});

describe("phpSocketVersion", () => {
  it("reads the versions of Forge", () => {
    expect(phpSocketVersion("PHP 8.3")).toBe("8.3");
    expect(phpSocketVersion("php84")).toBe("8.4");
    expect(phpSocketVersion("php8.1")).toBe("8.1");
  });

  it("refuses a version without minor", () => {
    expect(() => phpSocketVersion("php")).toThrow(ValidationError);
  });
});

describe("nginxValues", () => {
  it("gives the values of a site", () => {
    expect(
      nginxValues(example, exampleDomains, {
        ip_address: "203.0.113.10",
        private_ip_address: null,
      }),
    ).toEqual({
      DIRECTORY: "/public",
      DOMAINS: "www.example.com example.com",
      PATH: "/home/forge/www.example.com/public",
      PORT: "80",
      PORT_V6: "[::]:80",
      PROXY_PASS: "unix:/var/run/php/php8.3-fpm.sock",
      ROOT_PATH: "/home/forge/www.example.com",
      SERVER_PUBLIC_IP: "203.0.113.10",
      SERVER_PRIVATE_IP: "",
      SITE: "www.example.com",
      SITE_ID: "456",
      USER: "forge",
    });
  });

  it("uses the PHP pool of the user of an isolated site", () => {
    const isolated = site(457, "app.example.com", { isolated: true, user: "app" });
    expect(nginxValues(isolated, ["app.example.com"]).PROXY_PASS).toBe(
      "unix:/var/run/php/php8.3-fpm-app.sock",
    );
  });

  it("reads a relative web directory and the web directory at the root", () => {
    expect(nginxValues(site(1, "a.example.com", { web_directory: "/web" }), []).PATH).toBe(
      "/home/forge/a.example.com/web",
    );
    const atRoot = nginxValues(
      site(1, "a.example.com", { web_directory: "/home/forge/a.example.com" }),
      [],
    );
    expect(atRoot.DIRECTORY).toBe("/");
  });

  it("adds default_server to the ports of the default site", () => {
    const values = nginxValues(site(1, "default"), ["default"]);
    expect(values.PORT).toBe("80 default_server");
    expect(values.PORT_V6).toBe("[::]:80 default_server");
    expect(values.DOMAINS).toBe("default");
  });

  it("reads the PHP version only when PROXY_PASS is used", () => {
    expect(() =>
      renderNginx("{{ SITE }}", site(1, "a.example.com", { php_version: "" }), []),
    ).not.toThrow();
    expect(() =>
      renderNginx("{{ PROXY_PASS }}", site(1, "a.example.com", { php_version: "" }), []),
    ).toThrow(ValidationError);
  });
});

describe("renderNginx", () => {
  it("replaces each variable and keeps the rest of the file", () => {
    const template = [
      "include forge-conf/{{ SITE_ID }}/server/*;",
      "root {{PATH}};",
      "location ~ \\.php$ { fastcgi_pass {{ PROXY_PASS }}; }",
      "include /home/{{ USER }}/{{ SITE }}/nginx/*.conf;",
      "set $x '{literal}';",
    ].join("\n");
    expect(renderNginx(template, example, exampleDomains)).toBe(
      [
        "include forge-conf/456/server/*;",
        "root /home/forge/www.example.com/public;",
        "location ~ \\.php$ { fastcgi_pass unix:/var/run/php/php8.3-fpm.sock; }",
        "include /home/forge/www.example.com/nginx/*.conf;",
        "set $x '{literal}';",
      ].join("\n"),
    );
  });

  it("keeps a text that is not a variable", () => {
    expect(renderNginx("{{ NOT_A_VARIABLE }}", example, exampleDomains)).toBe(
      "{{ NOT_A_VARIABLE }}",
    );
  });
});
