import { describe, expect, it } from "vitest";

import type { HandlerContext } from "./types.ts";

import { handleCertificates } from "./certificates.ts";

function createMockContext(): HandlerContext {
  return {
    executorContext: {
      client: {
        get: async () => ({
          certificates: [
            {
              id: 1,
              domain: "example.com",
              type: "letsencrypt",
              active: true,
              status: "installed",
            },
          ],
          certificate: {
            id: 1,
            server_id: 1,
            site_id: 10,
            domain: "example.com",
            type: "letsencrypt",
            active: true,
            status: "installed",
            request_status: "installed",
            existing: false,
            created_at: "2024-01-01",
          },
        }),
        post: async () => ({
          certificate: {
            id: 2,
            domain: "new.com",
            type: "letsencrypt",
            active: false,
            status: "pending",
          },
        }),
        delete: async () => undefined,
      } as never,
    },
    compact: true,
  };
}

describe("handleCertificates", () => {
  it("should list certificates", async () => {
    const result = await handleCertificates(
      "list",
      { resource: "certificates", action: "list", server_id: "1", site_id: "10" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("example.com");
  });

  it("should get a certificate", async () => {
    const result = await handleCertificates(
      "get",
      { resource: "certificates", action: "get", server_id: "1", site_id: "10", id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("example.com");
  });

  it("should create a certificate", async () => {
    const result = await handleCertificates(
      "create",
      {
        resource: "certificates",
        action: "create",
        server_id: "1",
        site_id: "10",
        domain: "new.com",
      },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("new.com");
  });

  it("should delete a certificate", async () => {
    const result = await handleCertificates(
      "delete",
      { resource: "certificates", action: "delete", server_id: "1", site_id: "10", id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("deleted");
  });

  it("should activate a certificate", async () => {
    const result = await handleCertificates(
      "activate",
      { resource: "certificates", action: "activate", server_id: "1", site_id: "10", id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("activated");
  });

  it("should require server_id and site_id for list", async () => {
    const result = await handleCertificates(
      "list",
      { resource: "certificates", action: "list" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
  });

  it("should handle unknown action", async () => {
    const result = await handleCertificates(
      "unknown",
      { resource: "certificates", action: "unknown", server_id: "1", site_id: "10" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("Unknown action");
  });

  it("should inject hints on get when includeHints=true", async () => {
    const ctx = createMockContext();
    ctx.compact = false;
    ctx.includeHints = true;

    const result = await handleCertificates(
      "get",
      { resource: "certificates", action: "get", server_id: "1", site_id: "10", id: "1" },
      ctx,
    );
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0]!.text);
    expect(parsed._hints).toBeDefined();
    expect(parsed._hints.related_resources).toBeDefined();
  });
});
