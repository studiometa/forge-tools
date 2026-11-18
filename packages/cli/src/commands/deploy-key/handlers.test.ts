import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { createTestContext } from "../../context.ts";
import { deployKeyCreate, deployKeyDelete, deployKeyGet } from "./handlers.ts";

vi.mock("@studiometa/forge-core", () => ({
  getSiteDeployKey: vi.fn(),
  createSiteDeployKey: vi.fn(),
  deleteSiteDeployKey: vi.fn(),
}));

function context(options: Record<string, unknown>) {
  return createTestContext({ token: "test", mockClient: {} as never, options });
}

const site = { server: "1", site: "2" };
let exit: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  exit = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("deployKeyGet", () => {
  it("should print the key", async () => {
    const { getSiteDeployKey } = await import("@studiometa/forge-core");
    vi.mocked(getSiteDeployKey).mockResolvedValue({ data: { id: 1, key: "ssh-ed25519 A" } });

    await deployKeyGet(context({ format: "human", ...site }));

    expect(getSiteDeployKey).toHaveBeenCalledWith(
      { server_id: "1", site_id: "2" },
      expect.anything(),
    );
    expect(console.log).toHaveBeenCalledWith("ssh-ed25519 A");
  });

  it("should say when there is no key", async () => {
    const { getSiteDeployKey } = await import("@studiometa/forge-core");
    vi.mocked(getSiteDeployKey).mockResolvedValue({ data: { id: 1, key: null } });

    await deployKeyGet(context({ format: "human", ...site }));

    expect(console.log).toHaveBeenCalledWith(expect.stringContaining("no deploy key"));
  });

  it("should require the server and the site", async () => {
    await deployKeyGet(context({ format: "json", site: "2" })).catch(() => {});
    expect(exit).toHaveBeenCalledWith(3);
    exit.mockClear();
    await deployKeyGet(context({ format: "json", server: "1" })).catch(() => {});
    expect(exit).toHaveBeenCalledWith(3);
  });
});

describe("deployKeyCreate", () => {
  it("should output the new key as JSON", async () => {
    const { createSiteDeployKey } = await import("@studiometa/forge-core");
    vi.mocked(createSiteDeployKey).mockResolvedValue({ data: { id: 1, key: "ssh-ed25519 B" } });

    await deployKeyCreate(context({ format: "json", ...site }));

    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('"ssh-ed25519 B"'));
  });
});

describe("deployKeyDelete", () => {
  it("should delete the key", async () => {
    const { deleteSiteDeployKey } = await import("@studiometa/forge-core");
    vi.mocked(deleteSiteDeployKey).mockResolvedValue({ data: undefined });

    await deployKeyDelete(context({ format: "human", ...site }));

    expect(deleteSiteDeployKey).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("Deploy key of site 2 deleted."),
    );
  });
});
