import { describe, expect, it } from "vitest";

import { mockDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { updateNginxTemplate } from "./update.ts";

describe("updateNginxTemplate", () => {
  it("should update an nginx template and format output", async () => {
    const ctx = createTestExecutorContext({
      client: {
        put: async () =>
          mockDocument(6, "nginx-templates", {
            name: "updated-php",
            content: "server {}",
            created_at: "2024-01-01T00:00:00.000000Z",
            updated_at: "2024-01-01T00:00:00.000000Z",
          }),
      } as never,
      organizationSlug: "test-org",
    });

    const result = await updateNginxTemplate(
      { server_id: "1", id: "6", name: "updated-php", content: "server {}" },
      ctx,
    );

    expect(result.data.name).toBe("updated-php");
  });
});
