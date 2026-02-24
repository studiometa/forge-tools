import { describe, expect, it } from "vitest";

import type { NginxTemplateResponse } from "@studiometa/forge-api";

import { createTestExecutorContext } from "../../context.ts";
import { updateNginxTemplate } from "./update.ts";

describe("updateNginxTemplate", () => {
  it("should update an nginx template and format output", async () => {
    const ctx = createTestExecutorContext({
      client: {
        put: async () =>
          ({
            template: { id: 6, name: "updated-php" },
          }) as NginxTemplateResponse,
      } as never,
    });

    const result = await updateNginxTemplate(
      { server_id: "1", id: "6", name: "updated-php", content: "server {}" },
      ctx,
    );

    expect(result.data.name).toBe("updated-php");
    expect(result.text).toContain("updated");
    expect(result.text).toContain("updated-php");
  });
});
