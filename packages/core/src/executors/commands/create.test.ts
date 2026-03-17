import { describe, expect, it } from "vitest";

import { mockDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { createCommand } from "./create.ts";

describe("createCommand", () => {
  it("should execute a command and format output", async () => {
    const ctx = createTestExecutorContext({
      client: {
        post: async () =>
          mockDocument(5, "commands", {
            command: "php artisan cache:clear",
            status: "running",
            user_name: "forge",
            created_at: "2024-01-01T00:00:00.000000Z",
            updated_at: "2024-01-01T00:00:00.000000Z",
          }),
      } as never,
      organizationSlug: "test-org",
    });

    const result = await createCommand(
      { server_id: "1", site_id: "2", command: "php artisan cache:clear" },
      ctx,
    );

    expect(result.data.command).toBe("php artisan cache:clear");
  });
});
