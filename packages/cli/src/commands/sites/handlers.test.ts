import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import type { ForgeSite } from "@studiometa/forge-api";

import { createTestContext } from "../../context.ts";
import { sitesList, sitesGet } from "./handlers.ts";

vi.mock("@studiometa/forge-core", () => ({
  listSites: vi.fn(),
  getSite: vi.fn(),
}));

const mockSite: ForgeSite = {
  id: 1,
  server_id: 10,
  name: "example.com",
  aliases: [],
  directory: "/public",
  wildcards: false,
  status: "installed",
  repository: null,
  repository_provider: null,
  repository_branch: null,
  repository_status: null,
  quick_deploy: false,
  deployment_status: null,
  project_type: "php",
  php_version: "php83",
  app: null,
  app_status: null,
  slack_channel: null,
  telegram_chat_id: null,
  telegram_chat_title: null,
  username: "forge",
  deployment_url: "https://forge.laravel.com/deploy/xxx",
  created_at: "2024-01-01T00:00:00Z",
  telegram_secret: "",
  tags: [],
  is_secured: false,
  discord_webhook_url: null,
  teams_webhook_url: null,
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
