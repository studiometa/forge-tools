import { describe, expect, it, vi } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { deleteNginxTemplate } from "./delete.ts";

describe("deleteNginxTemplate", () => {
  it("should delete an nginx template", async () => {
    const deleteMock = vi.fn(async () => {});
    const ctx = createTestExecutorContext({
      client: { delete: deleteMock } as never,
      organizationSlug: "test-org",
    });

    const result = await deleteNginxTemplate({ server_id: "1", id: "6" }, ctx);

    expect(deleteMock).toHaveBeenCalledWith("/orgs/test-org/servers/1/nginx/templates/6");
    expect(result.data).toBeUndefined();
  });
});
