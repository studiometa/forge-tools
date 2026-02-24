import { describe, expect, it, vi } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { deleteNginxTemplate } from "./delete.ts";

describe("deleteNginxTemplate", () => {
  it("should delete an nginx template", async () => {
    const deleteMock = vi.fn(async () => undefined);
    const ctx = createTestExecutorContext({ client: { delete: deleteMock } as never });

    const result = await deleteNginxTemplate({ server_id: "1", id: "6" }, ctx);

    expect(deleteMock).toHaveBeenCalledWith("/servers/1/nginx/templates/6");
    expect(result.data).toBeUndefined();
    expect(result.text).toContain("deleted");
  });
});
