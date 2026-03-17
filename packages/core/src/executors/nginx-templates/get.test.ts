import { describe, expect, it } from "vitest";

import { mockDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { getNginxTemplate } from "./get.ts";

describe("getNginxTemplate", () => {
  it("should get an nginx template and format output", async () => {
    const getMock = async () =>
      mockDocument(6, "nginx-templates", {
        name: "custom-php",
        content: "server { listen 80; }",
        created_at: "2024-01-01T00:00:00.000000Z",
        updated_at: "2024-01-01T00:00:00.000000Z",
      });

    const ctx = createTestExecutorContext({
      client: { get: getMock } as never,
      organizationSlug: "test-org",
    });

    const result = await getNginxTemplate({ server_id: "1", id: "6" }, ctx);

    expect(result.data.name).toBe("custom-php");
  });
});
