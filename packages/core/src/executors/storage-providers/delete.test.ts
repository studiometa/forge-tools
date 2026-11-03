import { describe, expect, it, vi } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { deleteStorageProvider } from "./delete.ts";

describe("deleteStorageProvider", () => {
  it("should delete a storage provider", async () => {
    const deleteMock = vi.fn(async () => {});
    const ctx = createTestExecutorContext({
      client: { delete: deleteMock } as never,
      organizationSlug: "test-org",
    });

    const result = await deleteStorageProvider({ id: "9" }, ctx);

    expect(deleteMock).toHaveBeenCalledWith("/orgs/test-org/storage-providers/9");
    expect(result.data).toBeUndefined();
  });
});
