import { describe, expect, it, vi } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { restartDaemon } from "./restart.ts";

describe("restartDaemon", () => {
  it("should restart a daemon", async () => {
    const postMock = vi.fn(async () => {});
    const ctx = createTestExecutorContext({
      client: { post: postMock } as never,
      organizationSlug: "test-org",
    });

    const result = await restartDaemon({ server_id: "1", id: "5" }, ctx);

    expect(postMock).toHaveBeenCalledWith(
      "/orgs/test-org/servers/1/background-processes/5/actions",
      { action: "restart" },
    );
    expect(result.data).toBeUndefined();
  });
});
