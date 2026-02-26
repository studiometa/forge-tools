import { describe, it, expect, vi } from "vitest";

import type { ForgeServer, ForgeSite } from "@studiometa/forge-api";

import { resolveServerId, resolveSiteId } from "./resolve.ts";
import { ValidationError } from "../errors.ts";

vi.mock("@studiometa/forge-core", () => ({
  listServers: vi.fn(),
  listSites: vi.fn(),
}));

const mockServer = (id: number, name: string): ForgeServer =>
  ({
    id,
    name,
    ip_address: "1.2.3.4",
    is_ready: true,
  }) as ForgeServer;

const mockSite = (id: number, name: string): ForgeSite =>
  ({
    id,
    server_id: 10,
    name,
  }) as ForgeSite;

const execCtx = {} as never;

// ── resolveServerId ──────────────────────────────────────────────────────────

describe("resolveServerId", () => {
  it("returns numeric value as-is without API call", async () => {
    const { listServers } = await import("@studiometa/forge-core");
    const result = await resolveServerId("12345", execCtx);
    expect(result).toBe("12345");
    expect(vi.mocked(listServers)).not.toHaveBeenCalled();
  });

  it("resolves exact name match", async () => {
    const { listServers } = await import("@studiometa/forge-core");
    vi.mocked(listServers).mockResolvedValue({
      data: [mockServer(1, "prod-server"), mockServer(2, "staging-server")],
    });
    const result = await resolveServerId("prod-server", execCtx);
    expect(result).toBe("1");
  });

  it("resolves exact name match case-insensitively", async () => {
    const { listServers } = await import("@studiometa/forge-core");
    vi.mocked(listServers).mockResolvedValue({
      data: [mockServer(1, "Prod-Server")],
    });
    const result = await resolveServerId("prod-server", execCtx);
    expect(result).toBe("1");
  });

  it("resolves partial name match", async () => {
    const { listServers } = await import("@studiometa/forge-core");
    vi.mocked(listServers).mockResolvedValue({
      data: [mockServer(1, "studio-meta-prod-1"), mockServer(2, "other-server")],
    });
    const result = await resolveServerId("prod", execCtx);
    expect(result).toBe("1");
  });

  it("prefers exact match over partial when both exist", async () => {
    const { listServers } = await import("@studiometa/forge-core");
    vi.mocked(listServers).mockResolvedValue({
      data: [mockServer(1, "prod"), mockServer(2, "prod-extra")],
    });
    const result = await resolveServerId("prod", execCtx);
    expect(result).toBe("1");
  });

  it("throws ValidationError when no match found", async () => {
    const { listServers } = await import("@studiometa/forge-core");
    vi.mocked(listServers).mockResolvedValue({
      data: [mockServer(1, "prod-server"), mockServer(2, "staging-server")],
    });
    await expect(resolveServerId("unknown", execCtx)).rejects.toBeInstanceOf(ValidationError);
    await expect(resolveServerId("unknown", execCtx)).rejects.toThrow(
      'No server found matching "unknown"',
    );
  });

  it("includes available servers in error hints", async () => {
    const { listServers } = await import("@studiometa/forge-core");
    vi.mocked(listServers).mockResolvedValue({
      data: [mockServer(1, "prod-server")],
    });
    try {
      await resolveServerId("unknown", execCtx);
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      const err = e as ValidationError;
      expect(err.hints?.[0]).toContain("prod-server");
    }
  });

  it("throws ValidationError when multiple partial matches", async () => {
    const { listServers } = await import("@studiometa/forge-core");
    vi.mocked(listServers).mockResolvedValue({
      data: [mockServer(1, "studio-prod-1"), mockServer(2, "studio-prod-2")],
    });
    await expect(resolveServerId("studio", execCtx)).rejects.toBeInstanceOf(ValidationError);
    await expect(resolveServerId("studio", execCtx)).rejects.toThrow("Ambiguous server name");
  });

  it("includes matching servers in ambiguity error hints", async () => {
    const { listServers } = await import("@studiometa/forge-core");
    vi.mocked(listServers).mockResolvedValue({
      data: [mockServer(1, "studio-prod-1"), mockServer(2, "studio-prod-2")],
    });
    try {
      await resolveServerId("studio", execCtx);
    } catch (e) {
      const err = e as ValidationError;
      expect(err.hints?.[0]).toContain("studio-prod-1");
      expect(err.hints?.[0]).toContain("studio-prod-2");
    }
  });
});

// ── resolveSiteId ────────────────────────────────────────────────────────────

describe("resolveSiteId", () => {
  it("returns numeric value as-is without API call", async () => {
    const { listSites } = await import("@studiometa/forge-core");
    const result = await resolveSiteId("456", "10", execCtx);
    expect(result).toBe("456");
    expect(vi.mocked(listSites)).not.toHaveBeenCalled();
  });

  it("resolves exact domain match", async () => {
    const { listSites } = await import("@studiometa/forge-core");
    vi.mocked(listSites).mockResolvedValue({
      data: [mockSite(1, "myapp.com"), mockSite(2, "staging.myapp.com")],
    });
    const result = await resolveSiteId("myapp.com", "10", execCtx);
    expect(result).toBe("1");
  });

  it("resolves exact domain match case-insensitively", async () => {
    const { listSites } = await import("@studiometa/forge-core");
    vi.mocked(listSites).mockResolvedValue({
      data: [mockSite(1, "MyApp.com")],
    });
    const result = await resolveSiteId("myapp.com", "10", execCtx);
    expect(result).toBe("1");
  });

  it("resolves partial domain match", async () => {
    const { listSites } = await import("@studiometa/forge-core");
    vi.mocked(listSites).mockResolvedValue({
      data: [mockSite(1, "myapp.com"), mockSite(2, "other.com")],
    });
    const result = await resolveSiteId("myapp", "10", execCtx);
    expect(result).toBe("1");
  });

  it("prefers exact match over partial", async () => {
    const { listSites } = await import("@studiometa/forge-core");
    vi.mocked(listSites).mockResolvedValue({
      data: [mockSite(1, "myapp.com"), mockSite(2, "myapp.staging.com")],
    });
    const result = await resolveSiteId("myapp.com", "10", execCtx);
    expect(result).toBe("1");
  });

  it("passes server_id when fetching sites", async () => {
    const { listSites } = await import("@studiometa/forge-core");
    vi.mocked(listSites).mockResolvedValue({ data: [mockSite(1, "myapp.com")] });
    await resolveSiteId("myapp.com", "42", execCtx);
    expect(vi.mocked(listSites)).toHaveBeenCalledWith({ server_id: "42" }, execCtx);
  });

  it("throws ValidationError when no match found", async () => {
    const { listSites } = await import("@studiometa/forge-core");
    vi.mocked(listSites).mockResolvedValue({
      data: [mockSite(1, "myapp.com")],
    });
    await expect(resolveSiteId("unknown", "10", execCtx)).rejects.toBeInstanceOf(ValidationError);
    await expect(resolveSiteId("unknown", "10", execCtx)).rejects.toThrow(
      'No site found matching "unknown"',
    );
  });

  it("includes available sites in error hints", async () => {
    const { listSites } = await import("@studiometa/forge-core");
    vi.mocked(listSites).mockResolvedValue({
      data: [mockSite(1, "myapp.com")],
    });
    try {
      await resolveSiteId("unknown", "10", execCtx);
    } catch (e) {
      const err = e as ValidationError;
      expect(err.hints?.[0]).toContain("myapp.com");
    }
  });

  it("throws ValidationError when multiple partial matches", async () => {
    const { listSites } = await import("@studiometa/forge-core");
    vi.mocked(listSites).mockResolvedValue({
      data: [mockSite(1, "myapp.com"), mockSite(2, "myapp.staging.com")],
    });
    await expect(resolveSiteId("myapp", "10", execCtx)).rejects.toBeInstanceOf(ValidationError);
    await expect(resolveSiteId("myapp", "10", execCtx)).rejects.toThrow("Ambiguous site name");
  });

  it("includes matching sites in ambiguity error hints", async () => {
    const { listSites } = await import("@studiometa/forge-core");
    vi.mocked(listSites).mockResolvedValue({
      data: [mockSite(1, "myapp.com"), mockSite(2, "myapp.staging.com")],
    });
    try {
      await resolveSiteId("myapp", "10", execCtx);
    } catch (e) {
      const err = e as ValidationError;
      expect(err.hints?.[0]).toContain("myapp.com");
      expect(err.hints?.[0]).toContain("myapp.staging.com");
    }
  });
});
