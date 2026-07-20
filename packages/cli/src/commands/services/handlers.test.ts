import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { createTestContext } from "../../context.ts";
import { servicesList, servicesRestart } from "./handlers.ts";

vi.mock("@studiometa/forge-core", () => ({
  listServices: vi.fn(),
  restartService: vi.fn(),
  getServer: vi.fn(),
  RESTARTABLE_SERVICES: ["nginx", "php", "mysql", "postgres", "redis", "supervisor"],
}));

// Resolve numeric server IDs without an API call.
vi.mock("../../utils/resolve.ts", () => ({
  resolveServerId: vi.fn(async (value: string) => value),
}));

const mockRows = [
  { service: "nginx", available: true, detail: null },
  { service: "php", available: true, detail: "php83" },
];

describe("servicesList", () => {
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

  it("should list services (json)", async () => {
    const { listServices } = await import("@studiometa/forge-core");
    vi.mocked(listServices).mockResolvedValue({ data: mockRows });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json" },
    });

    await servicesList(["10"], ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(expect.stringContaining("php83"));
  });

  it("should render human lineFormat", async () => {
    const { listServices } = await import("@studiometa/forge-core");
    vi.mocked(listServices).mockResolvedValue({ data: mockRows });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human" },
    });

    await servicesList(["10"], ctx);
    const output = vi
      .mocked(console.log)
      .mock.calls.map((c) => c.join(""))
      .join("\n");
    expect(output).toContain("nginx");
    expect(output).toContain("php");
    expect(output).toContain("(php83)");
  });

  it("should exit with error when no server", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json" },
    });

    await servicesList([], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});

describe("servicesRestart", () => {
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

  it("should restart a service", async () => {
    const { restartService } = await import("@studiometa/forge-core");
    vi.mocked(restartService).mockResolvedValue({ data: undefined as never });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human" },
    });

    await servicesRestart(["10", "nginx"], ctx);
    expect(vi.mocked(restartService)).toHaveBeenCalledWith(
      { server_id: "10", service: "nginx", version: undefined },
      expect.anything(),
    );
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(
      expect.stringContaining("restart initiated"),
    );
  });

  it("should restart php with an explicit --version", async () => {
    const { restartService, getServer } = await import("@studiometa/forge-core");
    vi.mocked(restartService).mockResolvedValue({ data: undefined as never });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human", version: "php83" },
    });

    await servicesRestart(["10", "php"], ctx);
    expect(vi.mocked(getServer)).not.toHaveBeenCalled();
    expect(vi.mocked(restartService)).toHaveBeenCalledWith(
      { server_id: "10", service: "php", version: "php83" },
      expect.anything(),
    );
  });

  it("should default php version from the server", async () => {
    const { restartService, getServer } = await import("@studiometa/forge-core");
    vi.mocked(restartService).mockResolvedValue({ data: undefined as never });
    vi.mocked(getServer).mockResolvedValue({ data: { php_version: "php82" } as never });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human" },
    });

    await servicesRestart(["10", "php"], ctx);
    expect(vi.mocked(restartService)).toHaveBeenCalledWith(
      { server_id: "10", service: "php", version: "php82" },
      expect.anything(),
    );
  });

  it("should exit when php has no version and none can be defaulted", async () => {
    const { getServer, restartService } = await import("@studiometa/forge-core");
    vi.mocked(getServer).mockResolvedValue({ data: { php_version: null } as never });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json" },
    });

    await servicesRestart(["10", "php"], ctx).catch(() => {});
    expect(vi.mocked(restartService)).not.toHaveBeenCalled();
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit for an invalid service", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json" },
    });

    await servicesRestart(["10", "apache"], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit when no server", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json" },
    });

    await servicesRestart([], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit when no service", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json" },
    });

    await servicesRestart(["10"], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});
