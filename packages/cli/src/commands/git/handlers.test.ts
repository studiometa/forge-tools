import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { createTestContext } from "../../context.ts";
import { gitUpdate } from "./handlers.ts";

vi.mock("@studiometa/forge-core", () => ({
  updateSiteGit: vi.fn(),
}));

function context(options: Record<string, unknown>) {
  return createTestContext({ token: "test", mockClient: {} as never, options });
}

const valid = { server: "1", site: "2", repository: "acme/app", branch: "main" };
let exit: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  exit = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("gitUpdate", () => {
  it("should change the repository, with github by default", async () => {
    const { updateSiteGit } = await import("@studiometa/forge-core");
    vi.mocked(updateSiteGit).mockResolvedValue({ data: { id: 2, name: "example.com" } as never });

    await gitUpdate(context({ format: "human", ...valid }));

    expect(updateSiteGit).toHaveBeenCalledWith(
      {
        server_id: "1",
        site_id: "2",
        source_control_provider: "github",
        repository: "acme/app",
        branch: "main",
      },
      expect.anything(),
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("Site example.com now deploys acme/app (main)."),
    );
  });

  it("should output the site as JSON with another provider", async () => {
    const { updateSiteGit } = await import("@studiometa/forge-core");
    vi.mocked(updateSiteGit).mockResolvedValue({ data: { id: 2, name: "example.com" } as never });

    await gitUpdate(context({ format: "json", ...valid, provider: "gitlab" }));

    expect(vi.mocked(updateSiteGit).mock.lastCall?.[0].source_control_provider).toBe("gitlab");
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('"example.com"'));
  });

  it.each([
    [{ ...valid, server: undefined }],
    [{ ...valid, site: undefined }],
    [{ ...valid, repository: undefined }],
    [{ ...valid, branch: undefined }],
    [{ ...valid, provider: "svn" }],
  ])("should refuse missing or invalid options %#", async (options) => {
    await gitUpdate(context({ format: "json", ...options })).catch(() => {});
    expect(exit).toHaveBeenCalledWith(3);
  });
});
