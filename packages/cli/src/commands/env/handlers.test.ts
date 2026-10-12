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
    const { getEnv } = await import("@studiometa/forge-core");
    vi.mocked(getEnv).mockResolvedValue({ data: "APP_ENV=production" });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human", server: "10", site: "100" },
    });

    await envGet(ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalledWith("APP_ENV=production");
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
