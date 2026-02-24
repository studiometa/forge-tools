import { describe, expect, it, vi } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { restartDaemon } from "./restart.ts";

describe("restartDaemon", () => {
  it("should restart a daemon", async () => {
    const postMock = vi.fn(async () => undefined);
    const ctx = createTestExecutorContext({ client: { post: postMock } as never });

    const result = await restartDaemon({ server_id: "1", id: "5" }, ctx);

    expect(postMock).toHaveBeenCalledWith("/servers/1/daemons/5/restart", {});
    expect(result.data).toBeUndefined();
    expect(result.text).toContain("restarted");
  });
});
