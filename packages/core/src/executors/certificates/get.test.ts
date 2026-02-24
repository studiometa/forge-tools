import { describe, expect, it } from "vitest";

import type { CertificateResponse } from "@studiometa/forge-api";

import { createTestExecutorContext } from "../../context.ts";
import { getCertificate } from "./get.ts";

describe("getCertificate", () => {
  it("should get a certificate and format output", async () => {
    const cert = {
      id: 10,
      domain: "example.com",
      type: "letsencrypt",
      status: "installed",
      active: true,
    };

    const ctx = createTestExecutorContext({
      client: {
        get: async () => ({ certificate: cert }) as CertificateResponse,
      } as never,
    });

    const result = await getCertificate({ server_id: "1", site_id: "2", id: "10" }, ctx);

    expect(result.data.domain).toBe("example.com");
    expect(result.text).toContain("example.com");
    expect(result.text).toContain("letsencrypt");
    expect(result.text).toContain("installed");
  });
});
