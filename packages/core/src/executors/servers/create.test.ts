import { describe, expect, it } from "vitest";

import type { ServerResponse } from "@studiometa/forge-api";

import { createTestExecutorContext } from "../../context.ts";
import { createServer } from "./create.ts";

describe("createServer", () => {
  it("should create a server and format output", async () => {
    const ctx = createTestExecutorContext({
      client: {
        post: async () =>
          ({ server: { id: 99, name: "web-new", is_ready: false } }) as ServerResponse,
      } as never,
    });

    const result = await createServer(
      {
        provider: "ocean2",
        credential_id: 1,
        name: "web-new",
        type: "app",
        size: "01",
        region: "ams3",
      },
      ctx,
    );

    expect(result.data.name).toBe("web-new");
    expect(result.text).toContain("web-new");
    expect(result.text).toContain("provisioning");
  });

  it("should show ready status when server is ready", async () => {
    const ctx = createTestExecutorContext({
      client: {
        post: async () =>
          ({ server: { id: 100, name: "web-ready", is_ready: true } }) as ServerResponse,
      } as never,
    });

    const result = await createServer(
      {
        provider: "hetzner",
        credential_id: 1,
        name: "web-ready",
        type: "app",
        size: "01",
        region: "eu",
      },
      ctx,
    );

    expect(result.text).toContain("ready");
  });
});
