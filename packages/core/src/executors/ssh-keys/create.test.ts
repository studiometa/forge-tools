import { describe, expect, it } from "vitest";

import { mockDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { createSshKey } from "./create.ts";

describe("createSshKey", () => {
  it("should create an SSH key and format output", async () => {
    const ctx = createTestExecutorContext({
      client: {
        post: async () =>
          mockDocument(12, "ssh-keys", {
            name: "deploy-key",
            fingerprint: null,
            status: "creating",
            created_at: "2024-01-01T00:00:00.000000Z",
            updated_at: "2024-01-01T00:00:00.000000Z",
          }),
      } as never,
      organizationSlug: "test-org",
    });

    const result = await createSshKey(
      { server_id: "1", name: "deploy-key", key: "ssh-rsa AAAA..." },
      ctx,
    );

    expect(result.data.name).toBe("deploy-key");
  });
});
