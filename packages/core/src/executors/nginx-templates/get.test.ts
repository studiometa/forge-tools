import { describe, expect, it } from "vitest";

import type { NginxTemplateResponse } from "@studiometa/forge-api";

import { createTestExecutorContext } from "../../context.ts";
import { getNginxTemplate } from "./get.ts";

describe("getNginxTemplate", () => {
  it("should get an nginx template and format output", async () => {
    const template = {
      id: 6,
      name: "custom-php",
      content: "server { listen 80; }",
    };

    const ctx = createTestExecutorContext({
      client: {
        get: async () => ({ template }) as NginxTemplateResponse,
      } as never,
    });

    const result = await getNginxTemplate({ server_id: "1", id: "6" }, ctx);

    expect(result.data.name).toBe("custom-php");
  });
});
