import { describe, expect, it, vi } from "vitest";

import { mockDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { getDaemonLog } from "./get-log.ts";

describe("getDaemonLog", () => {
  it("should fetch the daemon log", async () => {
    const logContent = "queue worker started\nprocessing jobs...";

    const getMock = vi.fn(async () =>
      mockDocument(5, "background-process-logs", { content: logContent }),
    );

    const ctx = createTestExecutorContext({
      client: { get: getMock } as never,
      organizationSlug: "test-org",
    });

    const result = await getDaemonLog({ server_id: "123", id: "5" }, ctx);

    expect(result.data).toBe(logContent);
    expect(getMock).toHaveBeenCalledWith("/orgs/test-org/servers/123/background-processes/5/log");
  });

  it("should return empty string log when content is empty", async () => {
    const ctx = createTestExecutorContext({
      client: {
        get: vi.fn(async () => mockDocument(1, "background-process-logs", { content: "" })),
      } as never,
      organizationSlug: "test-org",
    });

    const result = await getDaemonLog({ server_id: "1", id: "2" }, ctx);

    expect(result.data).toBe("");
  });
});
