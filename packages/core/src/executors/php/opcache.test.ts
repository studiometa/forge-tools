import { describe, expect, it, vi } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { mockDocument } from "../../test-helpers.ts";
import { disablePhpOpcache, enablePhpOpcache, getPhpOpcache } from "./opcache.ts";

describe("getPhpOpcache", () => {
  it("should get the OPcache status", async () => {
    const getMock = vi.fn(async () => mockDocument(1, "phpOpcache", { opcache_enabled: true }));
    const ctx = createTestExecutorContext({
      client: { get: getMock } as never,
      organizationSlug: "test-org",
    });

    const result = await getPhpOpcache({ server_id: "1" }, ctx);

    expect(getMock).toHaveBeenCalledWith("/orgs/test-org/servers/1/php/opcache");
    expect(result.data).toBe(true);
  });
});

describe("enablePhpOpcache", () => {
  it("should POST to the opcache endpoint", async () => {
    const postMock = vi.fn(async () => {});
    const ctx = createTestExecutorContext({
      client: { post: postMock } as never,
      organizationSlug: "test-org",
    });

    const result = await enablePhpOpcache({ server_id: "1" }, ctx);

    expect(postMock).toHaveBeenCalledWith("/orgs/test-org/servers/1/php/opcache", undefined);
    expect(result.data).toBeUndefined();
  });
});

describe("disablePhpOpcache", () => {
  it("should DELETE the opcache endpoint", async () => {
    const deleteMock = vi.fn(async () => {});
    const ctx = createTestExecutorContext({
      client: { delete: deleteMock } as never,
      organizationSlug: "test-org",
    });

    const result = await disablePhpOpcache({ server_id: "1" }, ctx);

    expect(deleteMock).toHaveBeenCalledWith("/orgs/test-org/servers/1/php/opcache");
    expect(result.data).toBeUndefined();
  });
});
