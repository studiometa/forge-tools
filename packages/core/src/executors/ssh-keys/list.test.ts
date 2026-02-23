import { describe, expect, it } from "vitest";

import type { SshKeysResponse } from "@studiometa/forge-api";

import { createTestExecutorContext } from "../../context.ts";
import { listSshKeys } from "./list.ts";

describe("listSshKeys", () => {
  it("should list SSH keys and format output", async () => {
    const keys = [{ id: 1, name: "Deploy Key", status: "installed" }];

    const ctx = createTestExecutorContext({
      client: {
        get: async () => ({ keys }) as SshKeysResponse,
      } as never,
    });

    const result = await listSshKeys({ server_id: "123" }, ctx);

    expect(result.data).toHaveLength(1);
    expect(result.text).toContain("Deploy Key");
    expect(result.text).toContain("1 SSH key(s)");
  });

  it("should handle empty list", async () => {
    const ctx = createTestExecutorContext({
      client: {
        get: async () => ({ keys: [] }) as SshKeysResponse,
      } as never,
    });

    const result = await listSshKeys({ server_id: "123" }, ctx);

    expect(result.data).toHaveLength(0);
    expect(result.text).toContain("No SSH keys");
  });
});
