import { describe, expect, it } from "vitest";

import type { ServerResponse } from "@studiometa/forge-api";

import { createTestExecutorContext } from "../../context.ts";
import { getServer } from "./get.ts";

describe("getServer", () => {
  it("should get a server and format output", async () => {
    const server = {
      id: 123,
      name: "web-1",
      provider: "ocean2",
      region: "ams3",
      ip_address: "1.2.3.4",
      php_version: "php83",
      ubuntu_version: "22.04",
      is_ready: true,
      created_at: "2024-01-01T00:00:00.000000Z",
    };

    const ctx = createTestExecutorContext({
      client: {
        get: async () => ({ server }) as ServerResponse,
      } as never,
    });

    const result = await getServer({ server_id: "123" }, ctx);

    expect(result.data.name).toBe("web-1");
  });

  it("should show provisioning status", async () => {
    const server = {
      id: 124,
      name: "web-2",
      provider: "hetzner",
      region: "eu",
      ip_address: "5.6.7.8",
      php_version: "php84",
      ubuntu_version: "24.04",
      is_ready: false,
      created_at: "2024-02-01T00:00:00.000000Z",
    };

    const ctx = createTestExecutorContext({
      client: {
        get: async () => ({ server }) as ServerResponse,
      } as never,
    });

    await getServer({ server_id: "124" }, ctx);
  });
});
