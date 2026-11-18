import { describe, expect, it, vi } from "vitest";

import { mockDocument, mockListDocument } from "@studiometa/forge-core";

import type { HandlerContext } from "./types.ts";

import { handleCertificates } from "./certificates.ts";

function makeCertAttrs(overrides: Record<string, unknown> = {}) {
  return {
    type: "letsencrypt",
    verification_method: null,
    key_type: null,
    preferred_chain: null,
    request_status: "created",
    status: "installed",
    active: true,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
    ...overrides,
  };
}

function createMockContext() {
  const get = vi.fn(async (path: string) =>
    path.endsWith("/certificates")
      ? mockListDocument("certificates", [{ id: 1, attributes: makeCertAttrs() }])
      : mockDocument(1, "certificates", makeCertAttrs()),
  );
  const post = vi.fn(async () =>
    mockDocument(2, "certificates", makeCertAttrs({ status: "installing", active: false })),
  );
  const del = vi.fn(async () => {});
  const ctx: HandlerContext = {
    executorContext: {
      organizationSlug: "test-org",
      client: { get, post, delete: del } as never,
    },
    compact: true,
  };
  return { ctx, get, post, del };
}

const domain = { server_id: "1", site_id: "10", domain_id: "100" };

describe("handleCertificates", () => {
  it("should list the certificates of a domain", async () => {
    const { ctx, get } = createMockContext();
    const result = await handleCertificates(
      "list",
      { resource: "certificates", action: "list", ...domain },
      ctx,
    );
    expect(result.isError).toBeUndefined();
    expect(get).toHaveBeenCalledWith("/orgs/test-org/servers/1/sites/10/domains/100/certificates");
    expect(result.content[0].text).toContain("#1 letsencrypt — installed (active)");
  });

  it("should list the certificates of a site without domain_id", async () => {
    const { ctx, get } = createMockContext();
    const result = await handleCertificates(
      "list",
      { resource: "certificates", action: "list", server_id: "1", site_id: "10" },
      ctx,
    );
    expect(result.isError).toBeUndefined();
    expect(get).toHaveBeenCalledWith("/orgs/test-org/servers/1/sites/10/certificates");
  });

  it("should get the active certificate of a domain", async () => {
    const { ctx, get } = createMockContext();
    const result = await handleCertificates(
      "get",
      { resource: "certificates", action: "get", ...domain },
      ctx,
    );
    expect(result.isError).toBeUndefined();
    expect(get).toHaveBeenCalledWith(
      "/orgs/test-org/servers/1/sites/10/domains/100/certificates/active",
    );
    expect(result.content[0].text).toContain("letsencrypt");
  });

  it("should get a certificate by id", async () => {
    const { ctx, get } = createMockContext();
    await handleCertificates(
      "get",
      { resource: "certificates", action: "get", ...domain, id: "7" },
      ctx,
    );
    expect(get).toHaveBeenCalledWith(
      "/orgs/test-org/servers/1/sites/10/domains/100/certificates/7",
    );
  });

  it("should create a certificate", async () => {
    const { ctx } = createMockContext();
    const result = await handleCertificates(
      "create",
      { resource: "certificates", action: "create", ...domain, type: "letsencrypt" },
      ctx,
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("installing");
  });

  it("should delete a certificate", async () => {
    const { ctx, del } = createMockContext();
    const result = await handleCertificates(
      "delete",
      { resource: "certificates", action: "delete", ...domain, id: "7" },
      ctx,
    );
    expect(result.isError).toBeUndefined();
    expect(del).toHaveBeenCalledWith(
      "/orgs/test-org/servers/1/sites/10/domains/100/certificates/7",
    );
    expect(result.content[0].text).toBe("Certificate 7 of domain 100 deleted.");
  });

  it("should activate a certificate", async () => {
    const { ctx, post } = createMockContext();
    const result = await handleCertificates(
      "activate",
      { resource: "certificates", action: "activate", ...domain, id: "7" },
      ctx,
    );
    expect(result.isError).toBeUndefined();
    expect(post).toHaveBeenCalledWith(
      "/orgs/test-org/servers/1/sites/10/domains/100/certificates/7/actions",
      { action: "enable" },
    );
    expect(result.content[0].text).toContain("Certificate 7 of domain 100 activated.");
  });

  it("should require an id to delete or activate a certificate", async () => {
    const { ctx } = createMockContext();
    for (const action of ["delete", "activate"]) {
      const result = await handleCertificates(
        action,
        { resource: "certificates", action, ...domain },
        ctx,
      );
      expect(result.isError).toBe(true);
    }
  });

  it("should refuse a domain_id that is not an ID", async () => {
    const { ctx } = createMockContext();
    const result = await handleCertificates(
      "get",
      { resource: "certificates", action: "get", ...domain, domain_id: "../../servers" },
      ctx,
    );
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid domain_id");
  });

  it("should require domain_id for get", async () => {
    const { ctx } = createMockContext();
    const result = await handleCertificates(
      "get",
      { resource: "certificates", action: "get", server_id: "1", site_id: "10" },
      ctx,
    );
    expect(result.isError).toBe(true);
  });

  it("should handle unknown action", async () => {
    const { ctx } = createMockContext();
    const result = await handleCertificates(
      "unknown",
      { resource: "certificates", action: "unknown", ...domain },
      ctx,
    );
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Unknown action");
  });

  it("should inject hints on get when includeHints=true", async () => {
    const { ctx } = createMockContext();
    ctx.compact = false;
    ctx.includeHints = true;

    const result = await handleCertificates(
      "get",
      { resource: "certificates", action: "get", ...domain },
      ctx,
    );
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed._hints.common_actions[0].example).toMatchObject({
      action: "activate",
      domain_id: "100",
      id: "1",
    });
  });
});
