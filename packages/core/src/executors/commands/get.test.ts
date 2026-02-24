import { describe, expect, it } from "vitest";

import type { CommandResponse } from "@studiometa/forge-api";

import { createTestExecutorContext } from "../../context.ts";
import { getCommand } from "./get.ts";

describe("getCommand", () => {
  it("should get a command and format output", async () => {
    const command = {
      id: 1,
      command: "php artisan migrate",
      status: "finished",
      user_name: "forge",
      created_at: "2024-01-01T00:00:00Z",
    };

    const ctx = createTestExecutorContext({
      client: {
        get: async () => ({ command }) as CommandResponse,
      } as never,
    });

    const result = await getCommand({ server_id: "1", site_id: "2", id: "1" }, ctx);

    expect(result.data.command).toBe("php artisan migrate");
    expect(result.text).toContain("php artisan migrate");
    expect(result.text).toContain("finished");
    expect(result.text).toContain("forge");
  });
});
