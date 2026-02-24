import { describe, expect, it } from "vitest";

import type { SshKeyResponse } from "@studiometa/forge-api";

import { createTestExecutorContext } from "../../context.ts";
import { getSshKey } from "./get.ts";

describe("getSshKey", () => {
  it("should get an SSH key and format output", async () => {
    const key = {
      id: 12,
      name: "deploy-key",
      status: "installed",
      created_at: "2024-01-01T00:00:00.000000Z",
    };

    const ctx = createTestExecutorContext({
      client: {
        get: async () => ({ key }) as SshKeyResponse,
      } as never,
    });

    const result = await getSshKey({ server_id: "1", id: "12" }, ctx);

    expect(result.data.name).toBe("deploy-key");
    expect(result.text).toContain("deploy-key");
    expect(result.text).toContain("installed");
  });
});
