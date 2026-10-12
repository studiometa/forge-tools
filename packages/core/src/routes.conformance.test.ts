import { describe, expect, it } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

import { ROUTES, flattenRoutes } from "./routes.ts";

// Load the OpenAPI spec
const specPath = path.resolve(import.meta.dirname, "../../../docs/forge-openapi-v2.json");
const spec = JSON.parse(fs.readFileSync(specPath, "utf-8"));
const specPaths = Object.keys(spec.paths);

/**
 * Normalize a path by replacing all param placeholders with a wildcard.
 * This allows matching our `:param` format against the spec's `{param}` format
 * regardless of param naming differences.
 */
function normalize(routePath: string): string {
  return routePath.replaceAll(/:[^/]+/g, "*").replaceAll(/\{[^}]+\}/g, "*");
}

/**
 * Find a matching spec path for the given route path.
 */
function findMatchingSpecPath(routePath: string): string | undefined {
  const normalized = normalize(routePath);
  return specPaths.find((specPath) => normalize(specPath) === normalized);
}

describe("Route conformance with OpenAPI spec", () => {
  const allRoutes = flattenRoutes(ROUTES);

  // user.get is `/user` — exists in spec but not org-scoped
  const routesToCheck = allRoutes;

  // Some routes are parameterized where the OpenAPI spec enumerates one literal
  // path per value (e.g. one path per restartable service). Such a route is
  // conformant when every concrete path exists in the spec.
  const LITERAL_PARAMS: Record<string, { param: string; values: string[] }> = {
    "services.action": {
      param: ":service",
      values: ["nginx", "php", "mysql", "postgres", "redis", "supervisor"],
    },
    "php.getConfig": { param: ":type", values: ["cli", "fpm", "pool"] },
    "php.updateConfig": { param: ":type", values: ["cli", "fpm", "pool"] },
  };

  for (const { key, route } of routesToCheck) {
    it(`${key} → ${route.method} ${route.path}`, () => {
      const literal = LITERAL_PARAMS[key];
      if (literal) {
        for (const value of literal.values) {
          const concrete = route.path.replace(literal.param, value);
          const match = findMatchingSpecPath(concrete);
          expect(match, `No spec path matches: ${concrete}`).toBeDefined();
          const methods = Object.keys(spec.paths[match!]).map((m: string) => m.toUpperCase());
          expect(methods).toContain(route.method);
        }
        return;
      }

      const matchingPath = findMatchingSpecPath(route.path);

      expect(matchingPath, `No spec path matches: ${route.path}`).toBeDefined();

      if (matchingPath) {
        const specEntry = spec.paths[matchingPath];
        const specMethods = Object.keys(specEntry).map((m: string) => m.toUpperCase());

        expect(
          specMethods,
          `${key}: spec has methods [${specMethods.join(",")}] but route uses ${route.method}`,
        ).toContain(route.method);
      }
    });
  }

  it("should have checked a reasonable number of routes", () => {
    expect(routesToCheck.length).toBeGreaterThan(60);
  });
});
