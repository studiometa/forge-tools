import { describe, expect, it } from "vitest";

import type { CommandResponse } from "@studiometa/forge-api";

import { createTestExecutorContext } from "../../context.ts";
import { createCommand } from "./create.ts";

describe("createCommand", () => {
  it("should execute a command and format output", async () => {
    const ctx = createTestExecutorContext({
      client: {
        post: async () =>
          ({
            command: { id: 5, command: "php artisan cache:clear", status: "running" },
          }) as CommandResponse,
      } as never,
    });

    const result = await createCommand(
      { server_id: "1", site_id: "2", command: "php artisan cache:clear" },
      ctx,
    );

    expect(result.data.command).toBe("php artisan cache:clear");
  });
});
