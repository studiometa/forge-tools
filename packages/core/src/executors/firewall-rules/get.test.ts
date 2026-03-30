import { describe, expect, it } from "vitest";

import { mockDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { getFirewallRule } from "./get.ts";

describe("getFirewallRule", () => {
  it("should get a firewall rule and format output", async () => {
    const getMock = async () =>
      mockDocument(3, "firewall-rules", {
        name: "Allow SSH",
        port: "22",
        type: "allow",
        ip_address: "0.0.0.0",
        status: "installed",
        created_at: "2024-01-01T00:00:00.000000Z",
        updated_at: "2024-01-01T00:00:00.000000Z",
      });

    const ctx = createTestExecutorContext({
      client: { get: getMock } as never,
      organizationSlug: "test-org",
    });

    const result = await getFirewallRule({ server_id: "1", id: "3" }, ctx);

    expect(result.data.name).toBe("Allow SSH");
  });
});
