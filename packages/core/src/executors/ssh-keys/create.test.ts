import { describe, expect, it } from "vitest";

import type { SshKeyResponse } from "@studiometa/forge-api";

import { createTestExecutorContext } from "../../context.ts";
import { createSshKey } from "./create.ts";

describe("createSshKey", () => {
  it("should create an SSH key and format output", async () => {
    const ctx = createTestExecutorContext({
      client: {
        post: async () =>
          ({
            key: { id: 12, name: "deploy-key" },
          }) as SshKeyResponse,
      } as never,
    });

    const result = await createSshKey(
      { server_id: "1", name: "deploy-key", key: "ssh-rsa AAAA..." },
      ctx,
    );

    expect(result.data.name).toBe("deploy-key");
    expect(result.text).toContain("deploy-key");
    expect(result.text).toContain("12");
  });
});
