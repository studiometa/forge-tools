import { describe, expect, it, vi } from "vitest";

import { mockListDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { listSshKeys } from "./list.ts";

describe("listSshKeys", () => {
  it("should list SSH keys and format output", async () => {
    const getMock = async () =>
      mockListDocument("ssh-keys", [
        {
          id: 1,
          attributes: {
            name: "Deploy Key",
            user: "forge",
            status: "installed",
            created_by: null,
            created_at: "2024-01-01T00:00:00.000000Z",
            updated_at: "2024-01-01T00:00:00.000000Z",
          },
        },
      ]);

    const ctx = createTestExecutorContext({
      client: { get: getMock } as never,
      organizationSlug: "test-org",
    });

    const result = await listSshKeys({ server_id: "123" }, ctx);

    expect(result.data).toHaveLength(1);
  });

  it("should handle empty list", async () => {
    const ctx = createTestExecutorContext({
      client: {
        get: async () => mockListDocument("ssh-keys", []),
      } as never,
      organizationSlug: "test-org",
    });

    const result = await listSshKeys({ server_id: "123" }, ctx);

    expect(result.data).toHaveLength(0);
  });

  it("should filter by user", async () => {
    const get = vi.fn(async () => mockListDocument("ssh-keys", []));
    const ctx = createTestExecutorContext({
      client: { get } as never,
      organizationSlug: "test-org",
    });

    await listSshKeys({ server_id: "123", user: "deploy" }, ctx);

    expect(get).toHaveBeenCalledWith("/orgs/test-org/servers/123/ssh-keys?filter%5Buser%5D=deploy");
  });
});
