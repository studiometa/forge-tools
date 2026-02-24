import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import type { ForgeSecurityRule } from "@studiometa/forge-api";

import { createTestContext } from "../../context.ts";
import {
  securityRulesList,
  securityRulesGet,
  securityRulesCreate,
  securityRulesDelete,
} from "./handlers.ts";

vi.mock("@studiometa/forge-core", () => ({
  listSecurityRules: vi.fn(),
  getSecurityRule: vi.fn(),
  createSecurityRule: vi.fn(),
  deleteSecurityRule: vi.fn(),
}));

const mockRule: ForgeSecurityRule = {
  id: 1,
  server_id: 10,
  site_id: 20,
  name: "Protected Area",
  path: "/admin",
  credentials: [],
  created_at: "2024-01-01T00:00:00Z",
};

describe("securityRulesList", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should list security rules", async () => {
    const { listSecurityRules } = await import("@studiometa/forge-core");
    vi.mocked(listSecurityRules).mockResolvedValue({ data: [mockRule] });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10", site: "20" },
    });

    await securityRulesList(ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(
      expect.stringContaining('"Protected Area"'),
    );
  });

  it("should exit with error when no server_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", site: "20" },
    });

    await securityRulesList(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no site_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await securityRulesList(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});

describe("securityRulesGet", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should get security rule by id", async () => {
    const { getSecurityRule } = await import("@studiometa/forge-core");
    vi.mocked(getSecurityRule).mockResolvedValue({ data: mockRule });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10", site: "20" },
    });

    await securityRulesGet(["1"], ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(
      expect.stringContaining('"Protected Area"'),
    );
  });

  it("should exit with error when no rule_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10", site: "20" },
    });

    await securityRulesGet([], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no server_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", site: "20" },
    });

    await securityRulesGet(["1"], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no site_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await securityRulesGet(["1"], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});

describe("securityRulesCreate", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should create a security rule", async () => {
    const { createSecurityRule } = await import("@studiometa/forge-core");
    vi.mocked(createSecurityRule).mockResolvedValue({ data: mockRule });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10", site: "20", name: "Protected Area" },
    });

    await securityRulesCreate(ctx);
    expect(vi.mocked(createSecurityRule)).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Protected Area", credentials: [] }),
      expect.anything(),
    );
  });

  it("should exit with error when no server_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", site: "20", name: "Protected Area" },
    });

    await securityRulesCreate(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no site_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10", name: "Protected Area" },
    });

    await securityRulesCreate(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no name", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10", site: "20" },
    });

    await securityRulesCreate(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});

describe("securityRulesDelete", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should delete a security rule", async () => {
    const { deleteSecurityRule } = await import("@studiometa/forge-core");
    vi.mocked(deleteSecurityRule).mockResolvedValue({ data: undefined });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10", site: "20" },
    });

    await securityRulesDelete(["1"], ctx);
    expect(vi.mocked(deleteSecurityRule)).toHaveBeenCalledWith(
      { server_id: "10", site_id: "20", id: "1" },
      expect.anything(),
    );
  });

  it("should exit with error when no rule_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10", site: "20" },
    });

    await securityRulesDelete([], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no server_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", site: "20" },
    });

    await securityRulesDelete(["1"], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no site_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await securityRulesDelete(["1"], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});
