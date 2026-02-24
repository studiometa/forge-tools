import { describe, expect, it } from "vitest";

import type { NginxTemplateResponse } from "@studiometa/forge-api";

import { createTestExecutorContext } from "../../context.ts";
import { createNginxTemplate } from "./create.ts";

describe("createNginxTemplate", () => {
  it("should create an nginx template and format output", async () => {
    const ctx = createTestExecutorContext({
      client: {
        post: async () =>
          ({
            template: { id: 6, name: "custom-php" },
          }) as NginxTemplateResponse,
      } as never,
    });

    const result = await createNginxTemplate(
      { server_id: "1", name: "custom-php", content: "server {}" },
      ctx,
    );

    expect(result.data.name).toBe("custom-php");
  });
});
