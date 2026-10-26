import { readFileSync } from "node:fs";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { mockDocument, mockListDocument } from "@studiometa/forge-core";

import type { CommandOptions } from "../../context.ts";

import { createTestContext } from "../../context.ts";
import {
  phpConfig,
  phpDisableOpcache,
  phpEnableOpcache,
  phpList,
  phpMaxExecutionTime,
  phpMaxUploadSize,
  phpOpcache,
  phpSetMaxExecutionTime,
  phpSetMaxUploadSize,
  phpUpdateConfig,
} from "./handlers.ts";

vi.mock("node:fs", () => ({
  readFileSync: vi.fn(),
}));

const BASE = "/orgs/test-org/servers/10/php";

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
  if (path.includes("/configs/")) {
    return mockDocument(12, "phpConfigs", { configuration: "memory_limit = 512M\n" });
  }
  if (path.endsWith("/max-upload-size")) {
    return mockDocument(1, "phpSettings", { max_upload_size: "64" });
  }
  if (path.endsWith("/max-execution-time")) {
    return mockDocument(1, "phpSettings", { max_execution_time: 60 });
  }
  return mockDocument(1, "phpOpcache", { opcache_enabled: true });
}

function setup(options: CommandOptions) {
  const client = {
    get: vi.fn(async (path: string) => respond(path)),
    put: vi.fn(async () => {}),
    post: vi.fn(async () => {}),
    delete: vi.fn(async () => {}),
  };
  const ctx = createTestContext({ mockClient: client as never, options });
  return { ctx, client };
}

let exitSpy: ReturnType<typeof vi.spyOn>;
let logSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.mocked(readFileSync).mockReset();
  exitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
  logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  process.exitCode = undefined;
});

function printed(): string {
  return logSpy.mock.calls.map((call) => String(call[0])).join("\n");
}

describe("phpList", () => {
  it("should list PHP versions", async () => {
    const { ctx, client } = setup({ format: "human", server: "10" });

    await phpList(ctx);

    expect(client.get).toHaveBeenCalledWith(`${BASE}/versions`);
    expect(printed()).toContain("12       8.3    php8.3     installed");
  });

  it("should exit with a validation error without --server", async () => {
    const { ctx } = setup({ format: "json" });

    await phpList(ctx).catch(() => {});

    expect(exitSpy).toHaveBeenCalledWith(3);
  });
});

describe("phpConfig", () => {
  it("should resolve the version and print the raw config", async () => {
    const stdoutSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
    const { ctx, client } = setup({ format: "human", server: "10", version: "8.3", type: "fpm" });

    await phpConfig(ctx);

    expect(client.get).toHaveBeenLastCalledWith(`${BASE}/versions/12/configs/fpm`);
    expect(stdoutSpy).toHaveBeenCalledTimes(1);
    expect(stdoutSpy).toHaveBeenCalledWith("memory_limit = 512M\n");
  });

  it("should pass the pool user and print JSON", async () => {
    const { ctx, client } = setup({
      format: "json",
      server: "10",
      version: "12",
      type: "pool",
      user: "forge",
    });

    await phpConfig(ctx);

    expect(client.get).toHaveBeenCalledWith(`${BASE}/versions/12/configs/pool?user=forge`);
    expect(logSpy).toHaveBeenCalledWith(JSON.stringify({ content: "memory_limit = 512M\n" }));
  });

  it("should exit with a validation error without --version", async () => {
    const { ctx, client } = setup({ format: "json", server: "10", type: "fpm" });

    await phpConfig(ctx).catch(() => {});

    expect(exitSpy).toHaveBeenCalledWith(3);
    expect(client.get).not.toHaveBeenCalled();
  });

  it("should exit with a validation error for a bare --version", async () => {
    const { ctx, client } = setup({ format: "json", server: "10", version: true, type: "fpm" });

    await phpConfig(ctx).catch(() => {});

    expect(exitSpy).toHaveBeenCalledWith(3);
    expect(client.get).not.toHaveBeenCalled();
  });

  it("should exit with a validation error for --user with a type other than pool", async () => {
    const { ctx, client } = setup({
      format: "json",
      server: "10",
      version: "8.3",
      type: "fpm",
      user: "forge",
    });

    await phpConfig(ctx).catch(() => {});

    expect(exitSpy).toHaveBeenCalledWith(3);
    expect(printed()).toContain('--user applies to --type pool only, not \\"fpm\\"');
    expect(client.get).not.toHaveBeenCalled();
  });

  it("should exit with a validation error without --type", async () => {
    const { ctx } = setup({ format: "json", server: "10", version: "8.3" });

    await phpConfig(ctx).catch(() => {});

    expect(exitSpy).toHaveBeenCalledWith(3);
    expect(printed()).toContain("type is required");
  });

  it("should exit with a validation error for an invalid --type", async () => {
    const { ctx } = setup({ format: "json", server: "10", version: "8.3", type: "ini" });

    await phpConfig(ctx).catch(() => {});

    expect(exitSpy).toHaveBeenCalledWith(3);
    expect(printed()).toContain('Invalid --type \\"ini\\"');
  });

  it("should exit with an error when the version is not installed", async () => {
    const { ctx } = setup({ format: "json", server: "10", version: "7.4", type: "fpm" });

    await phpConfig(ctx);

    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(printed()).toContain('PHP version \\"7.4\\" is not installed on server 10');
  });
});

describe("phpUpdateConfig", () => {
  it("should update the config from --file", async () => {
    vi.mocked(readFileSync).mockReturnValue("memory_limit = 1G\n");
    const { ctx, client } = setup({
      format: "human",
      server: "10",
      version: "12",
      type: "cli",
      file: "php.ini",
    });

    await phpUpdateConfig(ctx);

    expect(readFileSync).toHaveBeenCalledWith("php.ini", "utf8");
    expect(client.put).toHaveBeenCalledWith(`${BASE}/versions/12/configs/cli`, {
      config: "memory_limit = 1G\n",
    });
    expect(printed()).toContain("PHP cli configuration updated.");
  });

  it("should update the pool config from --content with the pool user", async () => {
    const { ctx, client } = setup({
      format: "human",
      server: "10",
      version: "12",
      type: "pool",
      user: "forge",
      content: "[www]",
    });

    await phpUpdateConfig(ctx);

    expect(client.put).toHaveBeenCalledWith(`${BASE}/versions/12/configs/pool`, {
      config: "[www]",
      user: "forge",
    });
  });

  it("should exit with a validation error without content", async () => {
    const { ctx, client } = setup({ format: "json", server: "10", version: "12", type: "fpm" });

    await phpUpdateConfig(ctx).catch(() => {});

    expect(exitSpy).toHaveBeenCalledWith(3);
    expect(client.put).not.toHaveBeenCalled();
  });

  it("should exit with a validation error without --server", async () => {
    const { ctx } = setup({ format: "json", version: "12", type: "fpm", content: "x" });

    await phpUpdateConfig(ctx).catch(() => {});

    expect(exitSpy).toHaveBeenCalledWith(3);
  });

  it("should report in sync with --check and not write", async () => {
    const { ctx, client } = setup({
      format: "human",
      server: "10",
      version: "12",
      type: "fpm",
      content: "memory_limit = 512M",
      check: true,
    });

    await phpUpdateConfig(ctx);

    expect(client.put).not.toHaveBeenCalled();
    expect(printed()).toContain("PHP fpm configuration is in sync with Forge.");
    expect(process.exitCode).toBeUndefined();
  });

  it("should print a diff and exit 1 with --check when the config differs", async () => {
    const { ctx, client } = setup({
      format: "json",
      server: "10",
      version: "12",
      type: "fpm",
      content: "memory_limit = 1G",
      check: true,
    });

    await phpUpdateConfig(ctx);

    expect(client.put).not.toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(
      JSON.stringify(
        {
          inSync: false,
          diff: "--- remote\n+++ local\n@@ -1,1 +1,1 @@\n-memory_limit = 512M\n+memory_limit = 1G",
        },
        null,
        2,
      ),
    );
    expect(process.exitCode).toBe(1);
    expect(exitSpy).not.toHaveBeenCalled();
  });
});

describe("phpMaxUploadSize / phpSetMaxUploadSize", () => {
  it("should print the max upload size", async () => {
    const { ctx } = setup({ format: "human", server: "10" });

    await phpMaxUploadSize(ctx);

    expect(logSpy).toHaveBeenCalledWith("64 MB");
  });

  it("should print the max upload size as JSON", async () => {
    const { ctx } = setup({ format: "json", server: "10" });

    await phpMaxUploadSize(ctx);

    expect(logSpy).toHaveBeenCalledWith(JSON.stringify({ max_upload_size: "64" }, null, 2));
  });

  it("should set the max upload size", async () => {
    const { ctx, client } = setup({ format: "human", server: "10" });

    await phpSetMaxUploadSize(["128"], ctx);

    expect(client.put).toHaveBeenCalledWith(`${BASE}/max-upload-size`, { max_upload_size: 128 });
    expect(printed()).toContain("PHP max upload size set to 128 MB.");
  });

  it.each([[[]], [["64M"]], [["-1"]]])(
    "should exit with a validation error for %j",
    async (args) => {
      const { ctx, client } = setup({ format: "json", server: "10" });

      await phpSetMaxUploadSize(args, ctx).catch(() => {});

      expect(exitSpy).toHaveBeenCalledWith(3);
      expect(client.put).not.toHaveBeenCalled();
    },
  );
});

describe("phpMaxExecutionTime / phpSetMaxExecutionTime", () => {
  it("should print the max execution time", async () => {
    const { ctx } = setup({ format: "human", server: "10" });

    await phpMaxExecutionTime(ctx);

    expect(logSpy).toHaveBeenCalledWith("60 seconds");
  });

  it("should print the max execution time as JSON", async () => {
    const { ctx } = setup({ format: "json", server: "10" });

    await phpMaxExecutionTime(ctx);

    expect(logSpy).toHaveBeenCalledWith(JSON.stringify({ max_execution_time: "60" }, null, 2));
  });

  it("should set the max execution time", async () => {
    const { ctx, client } = setup({ format: "human", server: "10" });

    await phpSetMaxExecutionTime(["120"], ctx);

    expect(client.put).toHaveBeenCalledWith(`${BASE}/max-execution-time`, {
      max_execution_time: 120,
    });
    expect(printed()).toContain("PHP max execution time set to 120 seconds.");
  });

  it("should exit with a validation error without --server", async () => {
    const { ctx } = setup({ format: "json" });

    await phpSetMaxExecutionTime(["120"], ctx).catch(() => {});

    expect(exitSpy).toHaveBeenCalledWith(3);
  });
});

describe("phpOpcache / phpEnableOpcache / phpDisableOpcache", () => {
  it("should print the OPcache status", async () => {
    const { ctx } = setup({ format: "human", server: "10" });

    await phpOpcache(ctx);

    expect(logSpy).toHaveBeenCalledWith("OPcache is enabled.");
  });

  it("should print a disabled OPcache status", async () => {
    const { ctx, client } = setup({ format: "human", server: "10" });
    client.get.mockResolvedValueOnce(mockDocument(1, "phpOpcache", { opcache_enabled: false }));

    await phpOpcache(ctx);

    expect(logSpy).toHaveBeenCalledWith("OPcache is disabled.");
  });

  it("should print the OPcache status as JSON", async () => {
    const { ctx } = setup({ format: "json", server: "10" });

    await phpOpcache(ctx);

    expect(logSpy).toHaveBeenCalledWith(JSON.stringify({ opcache_enabled: true }, null, 2));
  });

  it("should enable OPcache", async () => {
    const { ctx, client } = setup({ format: "human", server: "10" });

    await phpEnableOpcache(ctx);

    expect(client.post).toHaveBeenCalledWith(`${BASE}/opcache`, undefined);
    expect(printed()).toContain("OPcache enabled.");
  });

  it("should disable OPcache", async () => {
    const { ctx, client } = setup({ format: "human", server: "10" });

    await phpDisableOpcache(ctx);

    expect(client.delete).toHaveBeenCalledWith(`${BASE}/opcache`);
    expect(printed()).toContain("OPcache disabled.");
  });
});
