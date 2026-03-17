import { describe, expect, it } from "vitest";

import { createTestExecutorContext } from "../context.ts";
import { orgPrefix, serverPath, sitePath } from "./url-builder.ts";

function ctx(slug = "studio-meta") {
  return createTestExecutorContext({
    client: {} as never,
    organizationSlug: slug,
  });
}

describe("orgPrefix", () => {
  it("should return /orgs/{slug}", () => {
    expect(orgPrefix(ctx())).toBe("/orgs/studio-meta");
  });

  it("should throw when organizationSlug is missing", () => {
    const noSlug = createTestExecutorContext({ client: {} as never });
    expect(() => orgPrefix(noSlug)).toThrow("organizationSlug is required");
  });
});

describe("serverPath", () => {
  it("should return /orgs/{slug}/servers/{id}", () => {
    expect(serverPath("123", ctx())).toBe("/orgs/studio-meta/servers/123");
  });
});

describe("sitePath", () => {
  it("should return /orgs/{slug}/servers/{id}/sites/{siteId}", () => {
    expect(sitePath("123", "456", ctx())).toBe("/orgs/studio-meta/servers/123/sites/456");
  });
});
