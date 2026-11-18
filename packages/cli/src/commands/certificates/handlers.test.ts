import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import type { CertificateAttributes } from "@studiometa/forge-api";

import { createTestContext } from "../../context.ts";
import { certificatesActivate, certificatesGet, certificatesList } from "./handlers.ts";

vi.mock("@studiometa/forge-core", () => ({
  listCertificates: vi.fn(),
  getCertificate: vi.fn(),
  activateCertificate: vi.fn(),
}));

const mockCert: CertificateAttributes & { id: number } = {
  id: 1,
  type: "letsencrypt",
  verification_method: null,
  key_type: null,
  preferred_chain: null,
  request_status: "created",
  status: "installed",
  active: true,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

function context(options: Record<string, unknown>) {
  return createTestContext({ token: "test", mockClient: {} as never, options });
}

let processExitSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("certificatesList", () => {
  it("should list the certificates of a domain", async () => {
    const { listCertificates } = await import("@studiometa/forge-core");
    vi.mocked(listCertificates).mockResolvedValue({ data: [mockCert] });

    await certificatesList(context({ format: "json", server: "10", site: "100", domain: "200" }));

    expect(vi.mocked(listCertificates)).toHaveBeenCalledWith(
      { server_id: "10", site_id: "100", domain_id: "200" },
      expect.anything(),
    );
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(expect.stringContaining('"letsencrypt"'));
  });

  it("should list the certificates of a site without --domain, in human format", async () => {
    const { listCertificates } = await import("@studiometa/forge-core");
    vi.mocked(listCertificates).mockResolvedValue({
      data: [mockCert, { ...mockCert, id: 2, active: false }],
    });

    await certificatesList(context({ format: "human", server: "10", site: "100" }));

    expect(vi.mocked(listCertificates)).toHaveBeenCalledWith(
      { server_id: "10", site_id: "100" },
      expect.anything(),
    );
    const lines = vi.mocked(console.log).mock.calls.map(([line]) => String(line));
    expect(lines.some((line) => line.startsWith("1 ") && line.endsWith("active"))).toBe(true);
    expect(lines.some((line) => line.startsWith("2 ") && !line.endsWith("active"))).toBe(true);
  });

  it("should exit with error when no site_id", async () => {
    await certificatesList(context({ format: "json", server: "10" })).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});

describe("certificatesGet", () => {
  it("should get the active certificate of a domain", async () => {
    const { getCertificate } = await import("@studiometa/forge-core");
    vi.mocked(getCertificate).mockResolvedValue({ data: mockCert });

    await certificatesGet(
      [],
      context({ format: "json", server: "10", site: "100", domain: "200" }),
    );

    expect(vi.mocked(getCertificate)).toHaveBeenCalledWith(
      { server_id: "10", site_id: "100", domain_id: "200" },
      expect.anything(),
    );
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(expect.stringContaining('"letsencrypt"'));
  });

  it("should get a certificate by id", async () => {
    const { getCertificate } = await import("@studiometa/forge-core");
    vi.mocked(getCertificate).mockResolvedValue({ data: mockCert });

    await certificatesGet(
      ["1"],
      context({ format: "json", server: "10", site: "100", domain: "200" }),
    );

    expect(vi.mocked(getCertificate)).toHaveBeenCalledWith(
      { server_id: "10", site_id: "100", domain_id: "200", id: "1" },
      expect.anything(),
    );
  });

  it("should exit with error when no server_id", async () => {
    await certificatesGet([], context({ format: "json", site: "100", domain: "200" })).catch(
      () => {},
    );
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no site_id", async () => {
    await certificatesGet([], context({ format: "json", server: "10", domain: "200" })).catch(
      () => {},
    );
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no domain_id", async () => {
    await certificatesGet([], context({ format: "json", server: "10", site: "100" })).catch(
      () => {},
    );
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});

describe("certificatesActivate", () => {
  it("should activate a certificate", async () => {
    const { activateCertificate } = await import("@studiometa/forge-core");
    vi.mocked(activateCertificate).mockResolvedValue({ data: undefined as never });

    await certificatesActivate(
      ["1"],
      context({ format: "human", server: "10", site: "100", domain: "200" }),
    );

    expect(vi.mocked(activateCertificate)).toHaveBeenCalledWith(
      { server_id: "10", site_id: "100", domain_id: "200", id: "1" },
      expect.anything(),
    );
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(
      expect.stringContaining("Certificate 1 of domain 200 activated."),
    );
  });

  it("should exit with error when no certificate id", async () => {
    await certificatesActivate(
      [],
      context({ format: "json", server: "10", site: "100", domain: "200" }),
    ).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no domain_id", async () => {
    await certificatesActivate(["1"], context({ format: "json", server: "10", site: "100" })).catch(
      () => {},
    );
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});
