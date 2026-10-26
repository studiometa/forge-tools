import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { createTestContext } from "../../context.ts";
import { envGet, envUpdate } from "./handlers.ts";

vi.mock("node:fs", () => ({
  readFileSync: vi.fn(),
}));

vi.mock("@studiometa/forge-core", () => ({
  getEnv: vi.fn(),
  updateEnv: vi.fn(),
}));

describe("envGet", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should get env", async () => {
    const { getEnv } = await import("@studiometa/forge-core");
    vi.mocked(getEnv).mockResolvedValue({ data: "APP_ENV=production" });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10", site: "100" },
    });

    await envGet(ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(expect.stringContaining("APP_ENV"));
  });

  it("should exit with error when no server_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", site: "100" },
    });

    await envGet(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no site_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await envGet(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should output raw content in human format", async () => {
    const stdoutSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
    const { getEnv } = await import("@studiometa/forge-core");
    vi.mocked(getEnv).mockResolvedValue({ data: "APP_ENV=production" });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human", server: "10", site: "100" },
    });

    await envGet(ctx);
    expect(stdoutSpy).toHaveBeenCalledWith("APP_ENV=production\n");
  });
});

describe("envUpdate", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should update env", async () => {
    const { updateEnv } = await import("@studiometa/forge-core");
    vi.mocked(updateEnv).mockResolvedValue({ data: undefined as never });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human", server: "10", site: "100", content: "APP_ENV=prod" },
    });

    await envUpdate(ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(expect.stringContaining("updated"));
  });

  it("should exit with error when no server_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", site: "100", content: "X=1" },
    });

    await envUpdate(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no site_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10", content: "X=1" },
    });

    await envUpdate(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no content", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10", site: "100" },
    });

    await envUpdate(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should update from --file", async () => {
    const { readFileSync } = await import("node:fs");
    const { updateEnv } = await import("@studiometa/forge-core");
    vi.mocked(readFileSync).mockReturnValue("APP_ENV=prod\n");
    vi.mocked(updateEnv).mockResolvedValue({ data: undefined as never });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human", server: "10", site: "100", file: ".env" },
    });

    await envUpdate(ctx);
    expect(vi.mocked(readFileSync)).toHaveBeenCalledWith(".env", "utf8");
    expect(vi.mocked(updateEnv)).toHaveBeenCalledWith(
      { server_id: "10", site_id: "100", content: "APP_ENV=prod\n" },
      expect.anything(),
    );
  });

  it("should update from stdin with --file -", async () => {
    const { readFileSync } = await import("node:fs");
    const { updateEnv } = await import("@studiometa/forge-core");
    vi.mocked(readFileSync).mockReturnValue("APP_ENV=prod\n");
    vi.mocked(updateEnv).mockResolvedValue({ data: undefined as never });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human", server: "10", site: "100", file: "-" },
    });

    await envUpdate(ctx);
    expect(vi.mocked(readFileSync)).toHaveBeenCalledWith(0, "utf8");
  });

  it("should exit with error when both --file and --content are given", async () => {
    const { updateEnv } = await import("@studiometa/forge-core");
    vi.mocked(updateEnv).mockClear();
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human", server: "10", site: "100", file: ".env", content: "x" },
    });

    await envUpdate(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
    expect(vi.mocked(updateEnv)).not.toHaveBeenCalled();
  });
});

describe("envUpdate --check", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.exitCode = undefined;
  });

  it("should report in sync and not write", async () => {
    const { getEnv, updateEnv } = await import("@studiometa/forge-core");
    vi.mocked(getEnv).mockResolvedValue({ data: "# remote\nAPP_ENV=production\n" });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: {
        format: "human",
        server: "10",
        site: "100",
        content: "APP_ENV=production",
        check: true,
      },
    });

    await envUpdate(ctx);
    expect(vi.mocked(getEnv)).toHaveBeenCalledWith(
      { server_id: "10", site_id: "100" },
      expect.anything(),
    );
    expect(vi.mocked(updateEnv)).not.toHaveBeenCalled();
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(
      expect.stringContaining("Environment file is in sync with Forge."),
    );
    expect(processExitSpy).not.toHaveBeenCalled();
    expect(process.exitCode).toBeUndefined();
  });

  it("should print variable names only, exit 1 and not write", async () => {
    const { getEnv, updateEnv } = await import("@studiometa/forge-core");
    vi.mocked(getEnv).mockResolvedValue({ data: "DB_PASSWORD=remote-secret\nOLD=old-secret" });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: {
        format: "human",
        server: "10",
        site: "100",
        content: "DB_PASSWORD=local-secret\nNEW=new-secret",
        check: true,
      },
    });

    await envUpdate(ctx);
    expect(vi.mocked(updateEnv)).not.toHaveBeenCalled();
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(
      "+ NEW (added)\n- OLD (removed)\n~ DB_PASSWORD (changed)",
    );
    const printed = JSON.stringify([
      vi.mocked(console.log).mock.calls,
      vi.mocked(console.error).mock.calls,
    ]);
    expect(printed).not.toMatch(/secret/);
    expect(process.exitCode).toBe(1);
    expect(processExitSpy).not.toHaveBeenCalled();
  });

  it("should print { inSync, diff } with names only in json format", async () => {
    const { getEnv } = await import("@studiometa/forge-core");
    vi.mocked(getEnv).mockResolvedValue({ data: "A=1" });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10", site: "100", content: "A=2", check: true },
    });

    await envUpdate(ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(
      JSON.stringify({ inSync: false, diff: { added: [], removed: [], changed: ["A"] } }, null, 2),
    );
    expect(process.exitCode).toBe(1);
    expect(processExitSpy).not.toHaveBeenCalled();
  });
});
