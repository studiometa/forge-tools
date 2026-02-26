import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import type { ForgeSshKey } from "@studiometa/forge-api";

import { createTestContext } from "../../context.ts";
import { sshKeysList, sshKeysGet } from "./handlers.ts";

vi.mock("@studiometa/forge-core", () => ({
  listSshKeys: vi.fn(),
  getSshKey: vi.fn(),
}));

const mockKey: ForgeSshKey = {
  id: 1,
  server_id: 10,
  name: "my-key",
  status: "installed",
  created_at: "2024-01-01T00:00:00Z",
};

describe("sshKeysList", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should list ssh keys", async () => {
    const { listSshKeys } = await import("@studiometa/forge-core");
    vi.mocked(listSshKeys).mockResolvedValue({ data: [mockKey] });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await sshKeysList(ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(expect.stringContaining('"my-key"'));
  });

  it("should exit with error when no server_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json" },
    });

    await sshKeysList(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});

describe("sshKeysGet", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should get ssh key", async () => {
    const { getSshKey } = await import("@studiometa/forge-core");
    vi.mocked(getSshKey).mockResolvedValue({ data: mockKey });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await sshKeysGet(["1"], ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(expect.stringContaining('"my-key"'));
  });

  it("should exit with error when no key id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await sshKeysGet([], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no server_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json" },
    });

    await sshKeysGet(["1"], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});

describe("sshKeysList — human format lineFormat", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it("should render human format with lineFormat callback", async () => {
    const { listSshKeys } = await import("@studiometa/forge-core");
    vi.mocked(listSshKeys).mockResolvedValue({ data: [mockKey] });
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human", server: "10" },
    });
    await sshKeysList(ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalled();
  });
});
