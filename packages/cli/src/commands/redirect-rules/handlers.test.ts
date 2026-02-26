import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import type { ForgeRedirectRule } from "@studiometa/forge-api";

import { createTestContext } from "../../context.ts";
import {
  redirectRulesList,
  redirectRulesGet,
  redirectRulesCreate,
  redirectRulesDelete,
} from "./handlers.ts";

vi.mock("@studiometa/forge-core", () => ({
  listRedirectRules: vi.fn(),
  getRedirectRule: vi.fn(),
  createRedirectRule: vi.fn(),
  deleteRedirectRule: vi.fn(),
}));

const mockRule: ForgeRedirectRule = {
  id: 1,
  server_id: 10,
  site_id: 20,
  from: "/old-page",
  to: "/new-page",
  type: "redirect",
  created_at: "2024-01-01T00:00:00Z",
};

describe("redirectRulesList", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should list redirect rules", async () => {
    const { listRedirectRules } = await import("@studiometa/forge-core");
    vi.mocked(listRedirectRules).mockResolvedValue({ data: [mockRule] });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10", site: "20" },
    });

    await redirectRulesList(ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(expect.stringContaining('"/old-page"'));
  });

  it("should exit with error when no server_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", site: "20" },
    });

    await redirectRulesList(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no site_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await redirectRulesList(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});

describe("redirectRulesGet", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should get redirect rule by id", async () => {
    const { getRedirectRule } = await import("@studiometa/forge-core");
    vi.mocked(getRedirectRule).mockResolvedValue({ data: mockRule });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10", site: "20" },
    });

    await redirectRulesGet(["1"], ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(expect.stringContaining('"/old-page"'));
  });

  it("should exit with error when no rule_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10", site: "20" },
    });

    await redirectRulesGet([], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no server_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", site: "20" },
    });

    await redirectRulesGet(["1"], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no site_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await redirectRulesGet(["1"], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});

describe("redirectRulesCreate", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should create a redirect rule", async () => {
    const { createRedirectRule } = await import("@studiometa/forge-core");
    vi.mocked(createRedirectRule).mockResolvedValue({ data: mockRule });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: {
        format: "json",
        server: "10",
        site: "20",
        from: "/old-page",
        to: "/new-page",
      },
    });

    await redirectRulesCreate(ctx);
    expect(vi.mocked(createRedirectRule)).toHaveBeenCalledWith(
      expect.objectContaining({ from: "/old-page", to: "/new-page" }),
      expect.anything(),
    );
  });

  it("should exit with error when no server_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", site: "20", from: "/old", to: "/new" },
    });

    await redirectRulesCreate(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no site_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10", from: "/old", to: "/new" },
    });

    await redirectRulesCreate(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no from", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10", site: "20", to: "/new" },
    });

    await redirectRulesCreate(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no to", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10", site: "20", from: "/old" },
    });

    await redirectRulesCreate(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});

describe("redirectRulesDelete", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should delete a redirect rule", async () => {
    const { deleteRedirectRule } = await import("@studiometa/forge-core");
    vi.mocked(deleteRedirectRule).mockResolvedValue({ data: undefined });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10", site: "20" },
    });

    await redirectRulesDelete(["1"], ctx);
    expect(vi.mocked(deleteRedirectRule)).toHaveBeenCalledWith(
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

    await redirectRulesDelete([], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no server_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", site: "20" },
    });

    await redirectRulesDelete(["1"], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no site_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await redirectRulesDelete(["1"], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});

describe("redirectRulesList — human format lineFormat", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it("should render human format with lineFormat callback", async () => {
    const { listRedirectRules } = await import("@studiometa/forge-core");
    vi.mocked(listRedirectRules).mockResolvedValue({ data: [mockRule] });
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human", server: "10", site: "20" },
    });
    await redirectRulesList(ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalled();
  });
});
