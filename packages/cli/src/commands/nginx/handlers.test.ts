import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { createTestContext } from "../../context.ts";
import { nginxGet, nginxUpdate } from "./handlers.ts";

vi.mock("node:fs", () => ({
  readFileSync: vi.fn(),
}));

vi.mock("@studiometa/forge-core", () => ({
  getNginxConfig: vi.fn(),
  updateNginxConfig: vi.fn(),
}));

describe("nginxGet", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should get nginx config", async () => {
    const { getNginxConfig } = await import("@studiometa/forge-core");
    vi.mocked(getNginxConfig).mockResolvedValue({ data: "server { }" });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10", site: "100" },
    });

    await nginxGet(ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(expect.stringContaining("server {"));
  });

  it("should exit with error when no server_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", site: "100" },
    });

    await nginxGet(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no site_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await nginxGet(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should output raw config in human format", async () => {
    const { getNginxConfig } = await import("@studiometa/forge-core");
    vi.mocked(getNginxConfig).mockResolvedValue({ data: "server { listen 80; }" });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human", server: "10", site: "100" },
    });

    await nginxGet(ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalledWith("server { listen 80; }");
  });
});

describe("nginxUpdate", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should update nginx config", async () => {
    const { updateNginxConfig } = await import("@studiometa/forge-core");
    vi.mocked(updateNginxConfig).mockResolvedValue({ data: undefined as never });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human", server: "10", site: "100", content: "server { }" },
    });

    await nginxUpdate(ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(expect.stringContaining("updated"));
  });

  it("should exit with error when no server_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", site: "100", content: "x" },
    });

    await nginxUpdate(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no site_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10", content: "x" },
    });

    await nginxUpdate(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no content", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10", site: "100" },
    });

    await nginxUpdate(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should update from --file", async () => {
    const { readFileSync } = await import("node:fs");
    const { updateNginxConfig } = await import("@studiometa/forge-core");
    vi.mocked(readFileSync).mockReturnValue("server { listen 80; }\n");
    vi.mocked(updateNginxConfig).mockResolvedValue({ data: undefined as never });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human", server: "10", site: "100", file: "nginx.conf" },
    });

    await nginxUpdate(ctx);
    expect(vi.mocked(readFileSync)).toHaveBeenCalledWith("nginx.conf", "utf8");
    expect(vi.mocked(updateNginxConfig)).toHaveBeenCalledWith(
      { server_id: "10", site_id: "100", content: "server { listen 80; }\n" },
      expect.anything(),
    );
  });

  it("should update from stdin with --file -", async () => {
    const { readFileSync } = await import("node:fs");
    const { updateNginxConfig } = await import("@studiometa/forge-core");
    vi.mocked(readFileSync).mockReturnValue("server { listen 80; }\n");
    vi.mocked(updateNginxConfig).mockResolvedValue({ data: undefined as never });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human", server: "10", site: "100", file: "-" },
    });

    await nginxUpdate(ctx);
    expect(vi.mocked(readFileSync)).toHaveBeenCalledWith(0, "utf8");
  });

  it("should exit with error when both --file and --content are given", async () => {
    const { updateNginxConfig } = await import("@studiometa/forge-core");
    vi.mocked(updateNginxConfig).mockClear();
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human", server: "10", site: "100", file: "nginx.conf", content: "x" },
    });

    await nginxUpdate(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
    expect(vi.mocked(updateNginxConfig)).not.toHaveBeenCalled();
  });
});

describe("nginxUpdate --check", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should report in sync and not write", async () => {
    const { getNginxConfig, updateNginxConfig } = await import("@studiometa/forge-core");
    vi.mocked(getNginxConfig).mockResolvedValue({ data: "server { listen 80; }\n" });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: {
        format: "human",
        server: "10",
        site: "100",
        content: "server { listen 80; }",
        check: true,
      },
    });

    await nginxUpdate(ctx);
    expect(vi.mocked(getNginxConfig)).toHaveBeenCalledWith(
      { server_id: "10", site_id: "100" },
      expect.anything(),
    );
    expect(vi.mocked(updateNginxConfig)).not.toHaveBeenCalled();
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(
      expect.stringContaining("Nginx configuration is in sync with Forge."),
    );
    expect(processExitSpy).not.toHaveBeenCalled();
  });

  it("should print a diff, exit 1 and not write when the content differs", async () => {
    const { getNginxConfig, updateNginxConfig } = await import("@studiometa/forge-core");
    vi.mocked(getNginxConfig).mockResolvedValue({ data: "server { listen 80; }\n" });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: {
        format: "json",
        server: "10",
        site: "100",
        content: "server { listen 443; }",
        check: true,
      },
    });

    await nginxUpdate(ctx);
    expect(vi.mocked(updateNginxConfig)).not.toHaveBeenCalled();
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(
      JSON.stringify({
        inSync: false,
        diff: "--- remote\n+++ local\n@@ -1,1 +1,1 @@\n-server { listen 80; }\n+server { listen 443; }",
      }),
    );
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });
});
