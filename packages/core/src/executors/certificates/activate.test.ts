import { describe, expect, it, vi } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { activateCertificate } from "./activate.ts";

describe("activateCertificate", () => {
  it("should activate a certificate", async () => {
    const postMock = vi.fn(async () => undefined);
    const ctx = createTestExecutorContext({ client: { post: postMock } as never });

    const result = await activateCertificate({ server_id: "1", site_id: "2", id: "3" }, ctx);

    expect(postMock).toHaveBeenCalledWith("/servers/1/sites/2/certificates/3/activate", {});
    expect(result.data).toBeUndefined();
    expect(result.text).toContain("activated");
  });
});
