import { describe, expect, it, vi } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { deleteRedirectRule } from "./delete.ts";

describe("deleteRedirectRule", () => {
  it("should delete a redirect rule", async () => {
    const deleteMock = vi.fn(async () => undefined);
    const ctx = createTestExecutorContext({
      client: { delete: deleteMock } as never,
      organizationSlug: "test-org",
    });

    const result = await deleteRedirectRule({ server_id: "1", site_id: "2", id: "9" }, ctx);

    expect(deleteMock).toHaveBeenCalledWith("/orgs/test-org/servers/1/sites/2/redirect-rules/9");
    expect(result.data).toBeUndefined();
  });
});
