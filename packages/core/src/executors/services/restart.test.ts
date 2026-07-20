import { describe, expect, it, vi } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { restartService } from "./restart.ts";

describe("restartService", () => {
  it("should restart a service via the reboot action", async () => {
    const postMock = vi.fn(async () => {});
    const ctx = createTestExecutorContext({
      client: { post: postMock } as never,
      organizationSlug: "test-org",
    });

    const result = await restartService({ server_id: "1", service: "nginx" }, ctx);

    expect(postMock).toHaveBeenCalledWith("/orgs/test-org/servers/1/services/nginx/actions", {
      action: "reboot",
    });
    expect(result.data).toBeUndefined();
  });

  it("should include the version in the body for php", async () => {
    const postMock = vi.fn(async () => {});
    const ctx = createTestExecutorContext({
      client: { post: postMock } as never,
      organizationSlug: "test-org",
    });

    await restartService({ server_id: "1", service: "php", version: "php83" }, ctx);

    expect(postMock).toHaveBeenCalledWith("/orgs/test-org/servers/1/services/php/actions", {
      action: "reboot",
      version: "php83",
    });
  });

  it("should throw a clear error for an invalid service", async () => {
    const postMock = vi.fn(async () => {});
    const ctx = createTestExecutorContext({
      client: { post: postMock } as never,
      organizationSlug: "test-org",
    });

    await expect(restartService({ server_id: "1", service: "apache" }, ctx)).rejects.toThrow(
      /Invalid service "apache"/,
    );
    expect(postMock).not.toHaveBeenCalled();
  });
});
