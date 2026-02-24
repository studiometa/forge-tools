import { describe, expect, it } from "vitest";

import type { CertificateResponse } from "@studiometa/forge-api";

import { createTestExecutorContext } from "../../context.ts";
import { createCertificate } from "./create.ts";

describe("createCertificate", () => {
  it("should create a certificate and format output", async () => {
    const ctx = createTestExecutorContext({
      client: {
        post: async () =>
          ({
            certificate: { id: 10, domain: "example.com" },
          }) as CertificateResponse,
      } as never,
    });

    const result = await createCertificate(
      { server_id: "1", site_id: "2", domain: "example.com", type: "new" },
      ctx,
    );

    expect(result.data.domain).toBe("example.com");
    expect(result.text).toContain("example.com");
    expect(result.text).toContain("10");
  });
});
