import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import type { SiteAttributes } from "@studiometa/forge-api";

import { createTestContext } from "../../context.ts";
import { sitesList, sitesGet, sitesUpdate } from "./handlers.ts";

vi.mock("@studiometa/forge-core", () => ({
  listSites: vi.fn(),
  getSite: vi.fn(),
  updateSite: vi.fn(),
}));

const mockSite: SiteAttributes & { id: number } = {
  id: 1,
  name: "example.com",
  aliases: [],
  root_directory: "/public",
  web_directory: "/public",
  wildcards: false,
  status: "installed",
  repository: null,
  quick_deploy: false,
  deployment_status: null,
  deployment_url: "https://forge.laravel.com/deploy/xxx",
  app_type: "php",
  php_version: "php83",
  url: "https://example.com",
  https: false,
  isolated: false,
  user: "forge",
  database: null,
  shared_paths: [],
  uses_envoyer: false,
  zero_downtime_deployments: false,
  maintenance_mode: false,
  healthcheck_url: null,
  deployment_script: null,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

describe("sitesList", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should list sites", async () => {
    const { listSites } = await import("@studiometa/forge-core");
    vi.mocked(listSites).mockResolvedValue({ data: [mockSite] });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await sitesList(ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(expect.stringContaining('"example.com"'));
  });

  it("should exit with error when no server_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json" },
    });

    await sitesList(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});

describe("sitesGet", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should get site by id", async () => {
    const { getSite } = await import("@studiometa/forge-core");
    vi.mocked(getSite).mockResolvedValue({ data: mockSite });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await sitesGet(["1"], ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(expect.stringContaining('"example.com"'));
  });

  it("should exit with error when no site_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await sitesGet([], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no server_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json" },
    });

    await sitesGet(["1"], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});

describe("sitesUpdate", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should update site with options", async () => {
    const { updateSite } = await import("@studiometa/forge-core");
    vi.mocked(updateSite).mockResolvedValue({ data: mockSite });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: {
        format: "json",
        server: "10",
        root_path: "/var/www",
        type: "php",
        php_version: "php83",
        push_to_deploy: "true",
      },
    });

    await sitesUpdate(["1"], ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(expect.stringContaining('"example.com"'));
    expect(vi.mocked(updateSite)).toHaveBeenCalledWith(
      expect.objectContaining({
        server_id: "10",
        site_id: "1",
        root_path: "/var/www",
        type: "php",
        php_version: "php83",
        push_to_deploy: true,
      }),
      expect.anything(),
    );
  });

  it("should handle push_to_deploy as boolean true", async () => {
    const { updateSite } = await import("@studiometa/forge-core");
    vi.mocked(updateSite).mockResolvedValue({ data: mockSite });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10", push_to_deploy: true },
    });

    await sitesUpdate(["1"], ctx);
    expect(vi.mocked(updateSite)).toHaveBeenCalledWith(
      expect.objectContaining({ push_to_deploy: true }),
      expect.anything(),
    );
  });

  it("should omit push_to_deploy when not provided", async () => {
    const { updateSite } = await import("@studiometa/forge-core");
    vi.mocked(updateSite).mockResolvedValue({ data: mockSite });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await sitesUpdate(["1"], ctx);
    expect(vi.mocked(updateSite)).toHaveBeenCalledWith(
      expect.objectContaining({ push_to_deploy: undefined }),
      expect.anything(),
    );
  });

  it("should parse push_to_deploy false string", async () => {
    const { updateSite } = await import("@studiometa/forge-core");
    vi.mocked(updateSite).mockResolvedValue({ data: mockSite });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10", push_to_deploy: "false" },
    });

    await sitesUpdate(["1"], ctx);
    expect(vi.mocked(updateSite)).toHaveBeenCalledWith(
      expect.objectContaining({ push_to_deploy: false }),
      expect.anything(),
    );
  });

  it("should exit with error when no site_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await sitesUpdate([], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no server_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json" },
    });

    await sitesUpdate(["1"], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});

describe("sitesList — human format lineFormat", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it("should render human format with lineFormat callback", async () => {
    const { listSites } = await import("@studiometa/forge-core");
    vi.mocked(listSites).mockResolvedValue({ data: [mockSite] });
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human", server: "10" },
    });
    await sitesList(ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalled();
  });
});
