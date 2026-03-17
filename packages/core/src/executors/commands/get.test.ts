import { describe, expect, it } from "vitest";

import { mockDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { getCommand } from "./get.ts";

describe("getCommand", () => {
  it("should get a command and format output", async () => {
    const getMock = async () =>
      mockDocument(1, "commands", {
        command: "php artisan migrate",
        status: "finished",
        user_name: "forge",
        created_at: "2024-01-01T00:00:00.000000Z",
        updated_at: "2024-01-01T00:00:00.000000Z",
      });

    const ctx = createTestExecutorContext({
      client: { get: getMock } as never,
      organizationSlug: "test-org",
    });

    const result = await getCommand({ server_id: "1", site_id: "2", id: "1" }, ctx);

    expect(result.data.command).toBe("php artisan migrate");
  });
});
