import { describe, expect, it, vi } from "vitest";

import { mockDocument, mockListDocument } from "@studiometa/forge-core";

import type { HandlerContext } from "./types.ts";

import { handlePhp } from "./php.ts";

const php83 = {
  version: "8.3",
  binary_name: "php8.3",
  status: "installed",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

function respond(path: string): unknown {
  if (path.endsWith("/php/versions")) {
    return mockListDocument("phpVersions", [{ id: 12, attributes: php83 }]);
  }
  if (path.endsWith("/php/versions/12")) {
    return mockDocument(12, "phpVersions", php83);
  }
  if (path.includes("/configs/")) {
    return mockDocument(12, "phpConfigs", { configuration: "memory_limit = 512M" });
  }
  if (path.endsWith("/max-upload-size")) {
    return mockDocument(1, "phpSettings", { max_upload_size: "64" });
  }
  if (path.endsWith("/max-execution-time")) {
    return mockDocument(1, "phpSettings", { max_execution_time: "60" });
  }
  return mockDocument(1, "phpOpcache", { opcache_enabled: true });
}

function createMockContext(compact = true) {
  const client = {
    get: vi.fn(async (path: string) => respond(path)),
    put: vi.fn(async () => {}),
    post: vi.fn(async () => {}),
    delete: vi.fn(async () => {}),
  };
  const ctx: HandlerContext = {
    executorContext: { organizationSlug: "test-org", client: client as never },
    compact,
  };
  return { ctx, client };
}

const BASE = "/orgs/test-org/servers/1/php";

describe("handlePhp", () => {
  it("should list PHP versions", async () => {
    const { ctx } = createMockContext();
    const result = await handlePhp(
      "list",
      { resource: "php", action: "list", server_id: "1" },
      ctx,
    );

    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toBe("1 PHP version(s):\n• PHP 8.3 (ID: 12) — installed");
  });

  it("should say when no PHP version is installed", async () => {
    const { ctx, client } = createMockContext();
    client.get.mockResolvedValueOnce(mockListDocument("phpVersions", []));

    const result = await handlePhp(
      "list",
      { resource: "php", action: "list", server_id: "1" },
      ctx,
    );

    expect(result.content[0].text).toBe("No PHP versions found.");
  });

  it("should get a PHP version by version string", async () => {
    const { ctx, client } = createMockContext();
    const result = await handlePhp(
      "get",
      { resource: "php", action: "get", server_id: "1", setting: "version", version: "php83" },
      ctx,
    );

    expect(client.get).toHaveBeenLastCalledWith(`${BASE}/versions/12`);
    expect(result.content[0].text).toBe("PHP 8.3 (ID: 12)\nBinary: php8.3\nStatus: installed");
  });

  it("should get a configuration file", async () => {
    const { ctx, client } = createMockContext();
    const result = await handlePhp(
      "get",
      {
        resource: "php",
        action: "get",
        server_id: "1",
        setting: "config",
        version: "12",
        type: "pool",
        user: "forge",
      },
      ctx,
    );

    expect(client.get).toHaveBeenCalledWith(`${BASE}/versions/12/configs/pool?user=forge`);
    expect(result.content[0].text).toBe("PHP pool configuration:\nmemory_limit = 512M");
  });

  it.each([
    ["max-upload-size", "PHP max upload size: 64 MB"],
    ["max-execution-time", "PHP max execution time: 60 seconds"],
    ["opcache", "OPcache is enabled."],
  ])("should get %s", async (setting, text) => {
    const { ctx } = createMockContext();
    const result = await handlePhp(
      "get",
      { resource: "php", action: "get", server_id: "1", setting },
      ctx,
    );

    expect(result.content[0].text).toBe(text);
  });

  it("should say when OPcache is disabled", async () => {
    const { ctx, client } = createMockContext();
    client.get.mockResolvedValueOnce(mockDocument(1, "phpOpcache", { opcache_enabled: false }));

    const result = await handlePhp(
      "get",
      { resource: "php", action: "get", server_id: "1", setting: "opcache" },
      ctx,
    );

    expect(result.content[0].text).toBe("OPcache is disabled.");
  });

  it("should return scalar settings as objects in JSON output", async () => {
    const { ctx } = createMockContext(false);
    const result = await handlePhp(
      "get",
      { resource: "php", action: "get", server_id: "1", setting: "max-upload-size" },
      ctx,
    );

    expect(result.structuredContent).toEqual({
      success: true,
      result: { max_upload_size: "64" },
    });
  });

  it("should reject a get without a setting", async () => {
    const { ctx } = createMockContext();
    const result = await handlePhp("get", { resource: "php", action: "get", server_id: "1" }, ctx);

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("setting");
  });

  it("should reject a config get without a type", async () => {
    const { ctx } = createMockContext();
    const result = await handlePhp(
      "get",
      { resource: "php", action: "get", server_id: "1", setting: "config", version: "8.3" },
      ctx,
    );

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("type");
  });

  it("should reject a user for a config type other than pool", async () => {
    const { ctx, client } = createMockContext();

    await expect(
      handlePhp(
        "get",
        {
          resource: "php",
          action: "get",
          server_id: "1",
          setting: "config",
          version: "12",
          type: "fpm",
          user: "forge",
        },
        ctx,
      ),
    ).rejects.toThrow('The user option applies to the pool config only, not "fpm".');
    expect(client.get).not.toHaveBeenCalled();
  });

  it("should update a configuration file", async () => {
    const { ctx, client } = createMockContext();
    const result = await handlePhp(
      "update",
      {
        resource: "php",
        action: "update",
        server_id: "1",
        setting: "config",
        version: "8.3",
        type: "fpm",
        content: "memory_limit = 1G",
      },
      ctx,
    );

    expect(client.put).toHaveBeenCalledWith(`${BASE}/versions/12/configs/fpm`, {
      config: "memory_limit = 1G",
    });
    expect(result.content[0].text).toBe("PHP fpm configuration updated.");
  });

  it("should set the max upload size", async () => {
    const { ctx, client } = createMockContext();
    const result = await handlePhp(
      "update",
      { resource: "php", action: "update", server_id: "1", setting: "max-upload-size", value: 128 },
      ctx,
    );

    expect(client.put).toHaveBeenCalledWith(`${BASE}/max-upload-size`, { max_upload_size: 128 });
    expect(result.content[0].text).toBe("PHP max upload size set to 128 MB.");
  });

  it("should set the max execution time", async () => {
    const { ctx, client } = createMockContext();
    const result = await handlePhp(
      "update",
      {
        resource: "php",
        action: "update",
        server_id: "1",
        setting: "max-execution-time",
        value: 120,
      },
      ctx,
    );

    expect(client.put).toHaveBeenCalledWith(`${BASE}/max-execution-time`, {
      max_execution_time: 120,
    });
    expect(result.content[0].text).toBe("PHP max execution time set to 120 seconds.");
  });

  it("should reject a negative or non-integer value", async () => {
    const { ctx, client } = createMockContext();
    for (const value of [-1, 1.5, "64"]) {
      const result = await handlePhp(
        "update",
        { resource: "php", action: "update", server_id: "1", setting: "max-upload-size", value },
        ctx,
      );
      expect(result.isError).toBe(true);
    }
    expect(client.put).not.toHaveBeenCalled();
  });

  it("should enable and disable OPcache", async () => {
    const { ctx, client } = createMockContext();
    const enabled = await handlePhp(
      "update",
      { resource: "php", action: "update", server_id: "1", setting: "opcache", enabled: true },
      ctx,
    );
    const disabled = await handlePhp(
      "update",
      { resource: "php", action: "update", server_id: "1", setting: "opcache", enabled: false },
      ctx,
    );

    expect(client.post).toHaveBeenCalledWith(`${BASE}/opcache`, undefined);
    expect(client.delete).toHaveBeenCalledWith(`${BASE}/opcache`);
    expect(enabled.content[0].text).toBe("OPcache enabled.");
    expect(disabled.content[0].text).toBe("OPcache disabled.");
  });

  it("should handle an unknown action", async () => {
    const { ctx } = createMockContext();
    const result = await handlePhp(
      "delete",
      { resource: "php", action: "delete", server_id: "1" },
      ctx,
    );

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Unknown action");
  });
});

describe("handlePhp check", () => {
  const args = {
    resource: "php",
    action: "check",
    server_id: "1",
    setting: "config",
    version: "12",
    type: "fpm",
  };

  it("should report in sync for equal content", async () => {
    const { ctx, client } = createMockContext(false);
    const result = await handlePhp("check", { ...args, content: "memory_limit = 512M\n" }, ctx);

    expect(client.get).toHaveBeenCalledWith(`${BASE}/versions/12/configs/fpm`);
    expect(client.put).not.toHaveBeenCalled();
    expect(result.structuredContent).toEqual({ success: true, result: { inSync: true } });
  });

  it("should return a unified diff when the file differs", async () => {
    const { ctx } = createMockContext(false);
    const result = await handlePhp("check", { ...args, content: "memory_limit = 1G" }, ctx);

    expect(result.structuredContent).toEqual({
      success: true,
      result: {
        inSync: false,
        diff: "--- remote\n+++ local\n@@ -1,1 +1,1 @@\n-memory_limit = 512M\n+memory_limit = 1G",
      },
    });
  });

  it("should format the result in compact output", async () => {
    const { ctx } = createMockContext();
    const result = await handlePhp("check", { ...args, content: "memory_limit = 1G" }, ctx);

    expect(result.content[0].text).toMatch(
      /^PHP fpm configuration differs from Forge:\n--- remote/,
    );
  });

  it("should only check setting=config", async () => {
    const { ctx } = createMockContext();
    const result = await handlePhp(
      "check",
      { resource: "php", action: "check", server_id: "1", setting: "opcache", content: "x" },
      ctx,
    );

    expect(result.isError).toBe(true);
  });

  it("should require content", async () => {
    const { ctx } = createMockContext();
    const result = await handlePhp("check", args, ctx);

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("content");
  });
});
