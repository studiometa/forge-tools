import { describe, expect, it, vi } from "vitest";

import { mockDocument } from "@studiometa/forge-core";

import type { HandlerContext } from "./types.ts";

import { handleDeployKey } from "./deploy-key.ts";

function context(key: string | null = "ssh-ed25519 AAAA") {
  const get = vi.fn(async () => mockDocument(1, "deployKeys", { key }));
  const post = vi.fn(async () => mockDocument(1, "deployKeys", { key }));
  const del = vi.fn(async () => {});
  const ctx: HandlerContext = {
    executorContext: { organizationSlug: "o", client: { get, post, delete: del } as never },
    compact: true,
  };
  return { ctx, get, post, del };
}

const site = { resource: "deploy-key", server_id: "1", site_id: "2" };

describe("handleDeployKey", () => {
  it("should get the deploy key", async () => {
    const { ctx, get } = context();
    const result = await handleDeployKey("get", { ...site, action: "get" }, ctx);
    expect(get).toHaveBeenCalledWith("/orgs/o/servers/1/sites/2/deploy-key");
    expect(result.content[0].text).toBe("Deploy key:\nssh-ed25519 AAAA");
  });

  it("should say when the site has no deploy key", async () => {
    const { ctx } = context(null);
    const result = await handleDeployKey("get", { ...site, action: "get" }, ctx);
    expect(result.content[0].text).toBe("The site has no deploy key.");
  });

  it("should create the deploy key", async () => {
    const { ctx, post } = context();
    await handleDeployKey("create", { ...site, action: "create" }, ctx);
    expect(post).toHaveBeenCalledWith("/orgs/o/servers/1/sites/2/deploy-key", undefined);
  });

  it("should delete the deploy key", async () => {
    const { ctx, del } = context();
    const result = await handleDeployKey("delete", { ...site, action: "delete" }, ctx);
    expect(del).toHaveBeenCalledWith("/orgs/o/servers/1/sites/2/deploy-key");
    expect(result.content[0].text).toBe("Deploy key of site 2 deleted.");
  });
});
