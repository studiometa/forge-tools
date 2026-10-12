import { describe, expect, it, vi } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { mockDocument } from "../../test-helpers.ts";
import { getPhpConfig, updatePhpConfig } from "./config.ts";

describe("getPhpConfig", () => {
  it("should get a PHP configuration file by version ID", async () => {
    const getMock = vi.fn(async () =>
      mockDocument(12, "phpConfigs", { configuration: "memory_limit = 512M" }),
    );
    const ctx = createTestExecutorContext({
      client: { get: getMock } as never,
      organizationSlug: "test-org",
    });

    const result = await getPhpConfig({ server_id: "1", version: "12", type: "fpm" }, ctx);

    expect(getMock).toHaveBeenCalledWith("/orgs/test-org/servers/1/php/versions/12/configs/fpm");
    expect(result.data).toBe("memory_limit = 512M");
  });

  it("should pass the pool user as a query parameter", async () => {
    const getMock = vi.fn(async () => mockDocument(12, "phpConfigs", { configuration: "[www]" }));
    const ctx = createTestExecutorContext({
      client: { get: getMock } as never,
      organizationSlug: "test-org",
    });

    await getPhpConfig({ server_id: "1", version: "12", type: "pool", user: "forge" }, ctx);

    expect(getMock).toHaveBeenCalledWith(
      "/orgs/test-org/servers/1/php/versions/12/configs/pool?user=forge",
    );
  });

  it("should reject an invalid type before any request", async () => {
    const getMock = vi.fn();
    const ctx = createTestExecutorContext({ client: { get: getMock } as never });

    await expect(getPhpConfig({ server_id: "1", version: "12", type: "ini" }, ctx)).rejects.toThrow(
      'Invalid PHP config type "ini". Valid types: cli, fpm, pool.',
    );
    expect(getMock).not.toHaveBeenCalled();
  });

  it("should reject a user for a type other than pool before any request", async () => {
    const getMock = vi.fn();
    const ctx = createTestExecutorContext({ client: { get: getMock } as never });

    await expect(
      getPhpConfig({ server_id: "1", version: "12", type: "fpm", user: "forge" }, ctx),
    ).rejects.toThrow('The user option applies to the pool config only, not "fpm".');
    expect(getMock).not.toHaveBeenCalled();
  });
});

describe("updatePhpConfig", () => {
  it("should send the content as config", async () => {
    const putMock = vi.fn(async () => {});
    const ctx = createTestExecutorContext({
      client: { put: putMock } as never,
      organizationSlug: "test-org",
    });

    const result = await updatePhpConfig(
      { server_id: "1", version: "12", type: "cli", content: "memory_limit = 1G" },
      ctx,
    );

    expect(putMock).toHaveBeenCalledWith("/orgs/test-org/servers/1/php/versions/12/configs/cli", {
      config: "memory_limit = 1G",
    });
    expect(result.data).toBeUndefined();
  });

  it("should send the pool user in the body", async () => {
    const putMock = vi.fn(async () => {});
    const ctx = createTestExecutorContext({
      client: { put: putMock } as never,
      organizationSlug: "test-org",
    });

    await updatePhpConfig(
      { server_id: "1", version: "12", type: "pool", content: "[www]", user: "forge" },
      ctx,
    );

    expect(putMock).toHaveBeenCalledWith("/orgs/test-org/servers/1/php/versions/12/configs/pool", {
      config: "[www]",
      user: "forge",
    });
  });

  it("should reject an invalid type before any request", async () => {
    const putMock = vi.fn();
    const ctx = createTestExecutorContext({ client: { put: putMock } as never });

    await expect(
      updatePhpConfig({ server_id: "1", version: "12", type: "ini", content: "x" }, ctx),
    ).rejects.toThrow(/Invalid PHP config type/);
    expect(putMock).not.toHaveBeenCalled();
  });

  it("should reject a user for a type other than pool before any request", async () => {
    const putMock = vi.fn();
    const ctx = createTestExecutorContext({ client: { put: putMock } as never });

    await expect(
      updatePhpConfig(
        { server_id: "1", version: "12", type: "cli", content: "x", user: "forge" },
        ctx,
      ),
    ).rejects.toThrow('The user option applies to the pool config only, not "cli".');
    expect(putMock).not.toHaveBeenCalled();
  });
});
