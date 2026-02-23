import { describe, expect, it } from "vitest";

import type { NginxTemplatesResponse } from "@studiometa/forge-api";

import { createTestExecutorContext } from "../../context.ts";
import { listNginxTemplates } from "./list.ts";

describe("listNginxTemplates", () => {
  it("should list nginx templates and format output", async () => {
    const templates = [{ id: 1, name: "Laravel Default" }];

    const ctx = createTestExecutorContext({
      client: {
        get: async () => ({ templates }) as NginxTemplatesResponse,
      } as never,
    });

    const result = await listNginxTemplates({ server_id: "123" }, ctx);

    expect(result.data).toHaveLength(1);
    expect(result.text).toContain("Laravel Default");
    expect(result.text).toContain("1 nginx template(s)");
  });

  it("should handle empty list", async () => {
    const ctx = createTestExecutorContext({
      client: {
        get: async () => ({ templates: [] }) as NginxTemplatesResponse,
      } as never,
    });

    const result = await listNginxTemplates({ server_id: "123" }, ctx);

    expect(result.data).toHaveLength(0);
    expect(result.text).toContain("No nginx templates");
  });
});
