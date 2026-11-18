import { describe, expect, it, vi } from "vitest";

import { mockDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { createSiteDeployKey } from "./create-deploy-key.ts";
import { deleteSiteDeployKey } from "./delete-deploy-key.ts";
import { getSiteDeployKey } from "./get-deploy-key.ts";

const key = mockDocument(1, "deployKeys", { key: "ssh-ed25519 AAAA forge" });

describe("site deploy key", () => {
  it("should get the deploy key of a site", async () => {
    const get = vi.fn(async () => key);
    const ctx = createTestExecutorContext({ client: { get } as never, organizationSlug: "o" });

    const result = await getSiteDeployKey({ server_id: "1", site_id: "2" }, ctx);

    expect(get).toHaveBeenCalledWith("/orgs/o/servers/1/sites/2/deploy-key");
    expect(result.data).toEqual({ id: 1, key: "ssh-ed25519 AAAA forge" });
  });

  it("should create a deploy key", async () => {
    const post = vi.fn(async () => key);
    const ctx = createTestExecutorContext({ client: { post } as never, organizationSlug: "o" });

    const result = await createSiteDeployKey({ server_id: "1", site_id: "2" }, ctx);

    expect(post).toHaveBeenCalledWith("/orgs/o/servers/1/sites/2/deploy-key", undefined);
    expect(result.data.key).toBe("ssh-ed25519 AAAA forge");
  });

  it("should delete the deploy key", async () => {
    const del = vi.fn(async () => {});
    const ctx = createTestExecutorContext({
      client: { delete: del } as never,
      organizationSlug: "o",
    });

    const result = await deleteSiteDeployKey({ server_id: "1", site_id: "2" }, ctx);

    expect(del).toHaveBeenCalledWith("/orgs/o/servers/1/sites/2/deploy-key");
    expect(result.data).toBeUndefined();
  });
});
