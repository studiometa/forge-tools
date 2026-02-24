import { describe, expect, it } from "vitest";

import type { CommandsResponse } from "@studiometa/forge-api";

import { createTestExecutorContext } from "../../context.ts";
import { listCommands } from "./list.ts";

describe("listCommands", () => {
  it("should list commands and format output", async () => {
    const commands = [
      { id: 1, status: "finished", user_name: "forge", command: "php artisan migrate" },
    ];

    const ctx = createTestExecutorContext({
      client: {
        get: async () => ({ commands }) as CommandsResponse,
      } as never,
    });

    const result = await listCommands({ server_id: "1", site_id: "2" }, ctx);

    expect(result.data).toHaveLength(1);
  });

  it("should handle empty list", async () => {
    const ctx = createTestExecutorContext({
      client: { get: async () => ({ commands: [] }) } as never,
    });

    const result = await listCommands({ server_id: "1", site_id: "2" }, ctx);

    expect(result.data).toHaveLength(0);
  });
});
