import { describe, expect, it } from "vitest";

import { mockDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { getSshKey } from "./get.ts";

describe("getSshKey", () => {
  it("should get an SSH key and format output", async () => {
    const getMock = async () =>
      mockDocument(12, "ssh-keys", {
        name: "deploy-key",
        fingerprint: null,
        status: "installed",
        created_at: "2024-01-01T00:00:00.000000Z",
        updated_at: "2024-01-01T00:00:00.000000Z",
      });

    const ctx = createTestExecutorContext({
      client: { get: getMock } as never,
      organizationSlug: "test-org",
    });

    const result = await getSshKey({ server_id: "1", id: "12" }, ctx);

    expect(result.data.name).toBe("deploy-key");
  });
});
