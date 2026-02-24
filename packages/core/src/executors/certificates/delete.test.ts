import { describe, expect, it, vi } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { deleteCertificate } from "./delete.ts";

describe("deleteCertificate", () => {
  it("should delete a certificate", async () => {
    const deleteMock = vi.fn(async () => undefined);
    const ctx = createTestExecutorContext({ client: { delete: deleteMock } as never });

    const result = await deleteCertificate({ server_id: "1", site_id: "2", id: "3" }, ctx);

    expect(deleteMock).toHaveBeenCalledWith("/servers/1/sites/2/certificates/3");
    expect(result.data).toBeUndefined();
  });
});
