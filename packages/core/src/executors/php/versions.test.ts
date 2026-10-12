import { describe, expect, it, vi } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { mockDocument, mockListDocument } from "../../test-helpers.ts";
import { getPhpVersion, listPhpVersions, resolvePhpVersionId } from "./versions.ts";

function phpVersion(version: string) {
  return {
    version,
    binary_name: `php${version}`,
    status: "installed",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  };
}

function versionsList() {
  return mockListDocument("phpVersions", [
    { id: 11, attributes: phpVersion("8.2") },
    { id: 12, attributes: phpVersion("8.3") },
  ]);
}

describe("listPhpVersions", () => {
  it("should list the PHP versions of a server", async () => {
    const getMock = vi.fn(async () => versionsList());
    const ctx = createTestExecutorContext({
      client: { get: getMock } as never,
      organizationSlug: "test-org",
    });

    const result = await listPhpVersions({ server_id: "1" }, ctx);

    expect(getMock).toHaveBeenCalledWith("/orgs/test-org/servers/1/php/versions");
    expect(result.data).toHaveLength(2);
    expect(result.data[1]).toMatchObject({ id: 12, version: "8.3", binary_name: "php8.3" });
  });
});

describe("resolvePhpVersionId", () => {
  it("should return a numeric version as an ID without an API call", async () => {
    const getMock = vi.fn();
    const ctx = createTestExecutorContext({ client: { get: getMock } as never });

    expect(await resolvePhpVersionId("1", "12", ctx)).toBe("12");
    expect(getMock).not.toHaveBeenCalled();
  });

  it.each(["8.3", "php8.3", "php83", "PHP83", " 8.3 "])(
    "should resolve %j to the version ID",
    async (version) => {
      const ctx = createTestExecutorContext({
        client: { get: async () => versionsList() } as never,
        organizationSlug: "test-org",
      });

      expect(await resolvePhpVersionId("1", version, ctx)).toBe("12");
    },
  );

  it("should throw with the installed versions when there is no match", async () => {
    const ctx = createTestExecutorContext({
      client: { get: async () => versionsList() } as never,
      organizationSlug: "test-org",
    });

    await expect(resolvePhpVersionId("1", "7.4", ctx)).rejects.toThrow(
      'PHP version "7.4" is not installed on server 1. Installed: 8.2, 8.3.',
    );
  });

  it("should say none when no version is installed", async () => {
    const ctx = createTestExecutorContext({
      client: { get: async () => mockListDocument("phpVersions", []) } as never,
      organizationSlug: "test-org",
    });

    await expect(resolvePhpVersionId("1", "8.3", ctx)).rejects.toThrow("Installed: none.");
  });
});

describe("getPhpVersion", () => {
  it("should resolve the version and get it", async () => {
    const getMock = vi.fn(async (url: string) =>
      url.endsWith("/php/versions")
        ? versionsList()
        : mockDocument(12, "phpVersions", phpVersion("8.3")),
    );
    const ctx = createTestExecutorContext({
      client: { get: getMock } as never,
      organizationSlug: "test-org",
    });

    const result = await getPhpVersion({ server_id: "1", version: "php83" }, ctx);

    expect(getMock).toHaveBeenLastCalledWith("/orgs/test-org/servers/1/php/versions/12");
    expect(result.data).toMatchObject({ id: 12, version: "8.3" });
  });
});
