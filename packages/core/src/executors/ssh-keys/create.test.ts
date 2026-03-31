import { describe, expect, it } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { createSshKey } from "./create.ts";

describe("createSshKey", () => {
  it("should create an SSH key and format output", async () => {
    const ctx = createTestExecutorContext({
      client: {
        post: async () => {},
      } as never,
      organizationSlug: "test-org",
    });

    const result = await createSshKey(
      { server_id: "1", name: "deploy-key", key: "ssh-rsa AAAA..." },
      ctx,
    );

    expect(result.data).toBeUndefined();
  });
});
