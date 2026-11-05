import { describe, it, expect, vi } from "vitest";

import type { ServerAttributes, SiteAttributes } from "@studiometa/forge-api";

import { matchServerId, resolveServerId, resolveSiteId } from "./resolve.ts";
import { ValidationError } from "../errors.ts";

vi.mock("@studiometa/forge-core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@studiometa/forge-core")>();
  return {
    listServers: vi.fn(),
    listSites: vi.fn(),
    matchByName: actual.matchByName,
  };
});

const mockServer = (id: number, name: string): ServerAttributes & { id: number } =>
  ({
    id,
    name,
    ip_address: "1.2.3.4",
    is_ready: true,
  }) as ServerAttributes & { id: number };

const mockSite = (id: number, name: string): SiteAttributes & { id: number } =>
  ({
    id,
    name,
  }) as SiteAttributes & { id: number };

const execCtx = { exactMatch: false } as never;
const exactCtx = { exactMatch: true } as never;

async function catchError(promise: Promise<unknown>): Promise<ValidationError> {
  try {
    await promise;
  } catch (error) {
    expect(error).toBeInstanceOf(ValidationError);
    return error as ValidationError;
  }
  throw new Error("Expected a ValidationError");
}

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

// ── Exact mode ───────────────────────────────────────────────────────────────

describe("resolveServerId in exact mode", () => {
  it("returns numeric value as-is without API call", async () => {
    const { listServers } = await import("@studiometa/forge-core");
    vi.mocked(listServers).mockClear();
    expect(await resolveServerId("123", exactCtx)).toBe("123");
    expect(vi.mocked(listServers)).not.toHaveBeenCalled();
  });

  it("resolves exact name match", async () => {
    const { listServers } = await import("@studiometa/forge-core");
    vi.mocked(listServers).mockResolvedValue({
      data: [mockServer(1, "web"), mockServer(2, "web-2")],
    });
    expect(await resolveServerId("WEB", exactCtx)).toBe("1");
  });

  it("rejects a single partial match and lists it as a near match", async () => {
    const { listServers } = await import("@studiometa/forge-core");
    vi.mocked(listServers).mockResolvedValue({
      data: [mockServer(1, "web-1"), mockServer(2, "worker")],
    });
    const error = await catchError(resolveServerId("web", exactCtx));
    expect(error.message).toBe('No server named "web" (exact match required)');
    expect(error.field).toBe("server");
    expect(error.hints?.[0]).toBe("Near matches:\n  web-1 (1)");
    expect(error.hints?.[1]).toContain("--exact");
    expect(error.hints?.[1]).toContain("FORGE_EXACT_MATCH");
  });

  it("rejects several partial matches and lists them as near matches", async () => {
    const { listServers } = await import("@studiometa/forge-core");
    vi.mocked(listServers).mockResolvedValue({
      data: [mockServer(1, "web-1"), mockServer(2, "web-2")],
    });
    const error = await catchError(resolveServerId("web", exactCtx));
    expect(error.message).toBe('No server named "web" (exact match required)');
    expect(error.hints?.[0]).toBe("Near matches:\n  web-1 (1)\n  web-2 (2)");
  });

  it("lists available servers when nothing matches", async () => {
    const { listServers } = await import("@studiometa/forge-core");
    vi.mocked(listServers).mockResolvedValue({ data: [mockServer(1, "web-1")] });
    const error = await catchError(resolveServerId("db", exactCtx));
    expect(error.message).toBe('No server named "db" (exact match required)');
    expect(error.hints?.[0]).toBe("Available servers:\n  web-1 (1)");
  });

  it("rejects duplicate exact names as ambiguous", async () => {
    const { listServers } = await import("@studiometa/forge-core");
    vi.mocked(listServers).mockResolvedValue({
      data: [mockServer(1, "web"), mockServer(2, "web")],
    });
    const error = await catchError(resolveServerId("web", exactCtx));
    expect(error.message).toContain("Ambiguous server name");
  });
});

describe("resolveSiteId in exact mode", () => {
  it("returns numeric value as-is without API call", async () => {
    const { listSites } = await import("@studiometa/forge-core");
    vi.mocked(listSites).mockClear();
    expect(await resolveSiteId("456", "123", exactCtx)).toBe("456");
    expect(vi.mocked(listSites)).not.toHaveBeenCalled();
  });

  it("resolves exact domain match", async () => {
    const { listSites } = await import("@studiometa/forge-core");
    vi.mocked(listSites).mockResolvedValue({
      data: [mockSite(456, "shop.example.com"), mockSite(789, "example.com")],
    });
    expect(await resolveSiteId("example.com", "123", exactCtx)).toBe("789");
  });

  it("rejects a single partial match instead of resolving it", async () => {
    const { listSites } = await import("@studiometa/forge-core");
    vi.mocked(listSites).mockResolvedValue({
      data: [mockSite(456, "shop.example.com"), mockSite(789, "other.test")],
    });
    const error = await catchError(resolveSiteId("example.com", "123", exactCtx));
    expect(error.message).toBe('No site named "example.com" on server 123 (exact match required)');
    expect(error.field).toBe("site");
    expect(error.hints?.[0]).toBe("Near matches:\n  shop.example.com (456)");
    expect(error.hints?.[1]).toContain("--exact");
  });

  it("rejects several partial matches and lists them as near matches", async () => {
    const { listSites } = await import("@studiometa/forge-core");
    vi.mocked(listSites).mockResolvedValue({
      data: [mockSite(456, "shop.example.com"), mockSite(457, "blog.example.com")],
    });
    const error = await catchError(resolveSiteId("example.com", "123", exactCtx));
    expect(error.hints?.[0]).toBe(
      "Near matches:\n  shop.example.com (456)\n  blog.example.com (457)",
    );
  });

  it("lists available sites when nothing matches", async () => {
    const { listSites } = await import("@studiometa/forge-core");
    vi.mocked(listSites).mockResolvedValue({ data: [mockSite(456, "other.test")] });
    const error = await catchError(resolveSiteId("example.com", "123", exactCtx));
    expect(error.hints?.[0]).toBe("Available sites:\n  other.test (456)");
  });
});

describe("matchServerId", () => {
  const servers = [
    { id: 1, name: "web-1" },
    { id: 2, name: "web-2" },
    { id: 3, name: "db" },
  ];

  it("returns numeric value as-is", () => {
    expect(matchServerId("123", servers, true)).toBe("123");
    expect(matchServerId("123", servers, false)).toBe("123");
  });

  it("resolves exact name match in both modes", () => {
    expect(matchServerId("db", servers, true)).toBe("3");
    expect(matchServerId("db", servers, false)).toBe("3");
  });

  it("resolves a single partial match only when exact mode is off", () => {
    expect(matchServerId("web-1", servers, false)).toBe("1");
    expect(matchServerId("we", [{ id: 5, name: "web" }], false)).toBe("5");
    expect(() => matchServerId("we", [{ id: 5, name: "web" }], true)).toThrow(
      'No server named "we" (exact match required)',
    );
  });

  it("rejects several partial matches in both modes", () => {
    expect(() => matchServerId("web", servers, false)).toThrow("Ambiguous server name");
    expect(() => matchServerId("web", servers, true)).toThrow(
      'No server named "web" (exact match required)',
    );
  });

  it("rejects no match in both modes", () => {
    expect(() => matchServerId("cache", servers, false)).toThrow(
      'No server found matching "cache"',
    );
    expect(() => matchServerId("cache", servers, true)).toThrow(
      'No server named "cache" (exact match required)',
    );
  });
});
