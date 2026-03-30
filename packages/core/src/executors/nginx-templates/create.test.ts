import { describe, expect, it } from "vitest";

import { mockDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { createNginxTemplate } from "./create.ts";

describe("createNginxTemplate", () => {
  it("should create an nginx template and format output", async () => {
    const ctx = createTestExecutorContext({
      client: {
        post: async () =>
          mockDocument(6, "nginx-templates", {
            name: "custom-php",
            content: "server {}",
            created_at: "2024-01-01T00:00:00.000000Z",
            updated_at: "2024-01-01T00:00:00.000000Z",
          }),
      } as never,
      organizationSlug: "test-org",
    });

    const result = await createNginxTemplate(
      { server_id: "1", name: "custom-php", content: "server {}" },
      ctx,
    );

    expect(result.data.name).toBe("custom-php");
  });
});
