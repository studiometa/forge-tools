import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { createTestContext } from "../../context.ts";
import { envGet, envUpdate } from "./handlers.ts";

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
});
