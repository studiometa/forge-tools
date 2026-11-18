import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { readFileSync } from "node:fs";

import { createTestContext } from "../../context.ts";
import { certificatesCreate, certificatesDeactivate, certificatesDelete } from "./handlers.ts";

vi.mock("node:fs", () => ({
  readFileSync: vi.fn(),
}));

vi.mock("@studiometa/forge-core", () => ({
  createCertificate: vi.fn(),
  deleteCertificate: vi.fn(),
  deactivateCertificate: vi.fn(),
}));

const domain = { server: "10", site: "100", domain: "200" };
const ids = { server_id: "10", site_id: "100", domain_id: "200" };
const cert = { id: 7, type: "letsencrypt" };

function context(options: Record<string, unknown>) {
  return createTestContext({ token: "test", mockClient: {} as never, options });
}

let exit: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  exit = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("certificatesCreate", () => {
  beforeEach(async () => {
    const { createCertificate } = await import("@studiometa/forge-core");
    vi.mocked(createCertificate).mockResolvedValue({ data: cert as never });
  });

  it("should request a Let's Encrypt certificate by default", async () => {
    const { createCertificate } = await import("@studiometa/forge-core");

    await certificatesCreate(context({ format: "human", ...domain }));

    expect(createCertificate).toHaveBeenLastCalledWith(
      {
        ...ids,
        type: "letsencrypt",
        letsencrypt: { verification_method: "http-01", key_type: "ecdsa" },
      },
      expect.anything(),
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("Certificate 7 (letsencrypt) requested for domain 200."),
    );
  });

  it("should install an existing certificate from files and enable it", async () => {
    const { createCertificate } = await import("@studiometa/forge-core");
    vi.mocked(readFileSync).mockImplementation((path) => `content of ${String(path)}`);

    await certificatesCreate(
      context({
        format: "json",
        ...domain,
        type: "existing",
        "key-file": "key.pem",
        "certificate-file": "cert.pem",
        enable: true,
      }),
    );

    expect(createCertificate).toHaveBeenLastCalledWith(
      {
        ...ids,
        type: "existing",
        enable: true,
        existing: { key: "content of key.pem", certificate: "content of cert.pem" },
      },
      expect.anything(),
    );
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('"letsencrypt"'));
  });

  it("should create a signing request", async () => {
    const { createCertificate } = await import("@studiometa/forge-core");

    await certificatesCreate(
      context({
        format: "json",
        ...domain,
        type: "csr",
        "csr-domain": "example.com",
        sans: "www.example.com",
        country: "FR",
        state: "IDF",
        city: "Paris",
        organization: "Acme",
        department: "IT",
      }),
    );

    expect(vi.mocked(createCertificate).mock.lastCall?.[0]).toMatchObject({
      type: "csr",
      csr: { domain: "example.com", sans: "www.example.com", country: "FR", department: "IT" },
    });
  });

  it("should create a signing request without other domains", async () => {
    const { createCertificate } = await import("@studiometa/forge-core");
    const csr = { country: "FR", state: "IDF", city: "Paris", organization: "A", department: "B" };

    await certificatesCreate(
      context({ format: "json", ...domain, type: "csr", "csr-domain": "example.com", ...csr }),
    );

    expect(vi.mocked(createCertificate).mock.lastCall?.[0].csr).toEqual({
      domain: "example.com",
      ...csr,
    });
  });

  it("should clone a certificate", async () => {
    const { createCertificate } = await import("@studiometa/forge-core");

    await certificatesCreate(
      context({ format: "json", ...domain, type: "clone", "certificate-id": "12" }),
    );

    expect(vi.mocked(createCertificate).mock.lastCall?.[0]).toMatchObject({
      type: "clone",
      clone: { certificate_id: 12 },
    });
  });

  it.each([
    { type: "letsencrypt", "verification-method": "tls" },
    { type: "letsencrypt", "key-type": "dsa" },
    { type: "csr" },
    { type: "csr", "csr-domain": "example.com" },
    { type: "clone", "certificate-id": "x" },
    { type: "other" },
  ])("should refuse invalid options %o", async (options) => {
    await certificatesCreate(context({ format: "json", ...domain, ...options })).catch(() => {});
    expect(exit).toHaveBeenCalledWith(3);
  });
});

describe("certificatesDelete", () => {
  it("should delete a certificate", async () => {
    const { deleteCertificate } = await import("@studiometa/forge-core");
    vi.mocked(deleteCertificate).mockResolvedValue({ data: undefined });

    await certificatesDelete(["7"], context({ format: "human", ...domain }));

    expect(deleteCertificate).toHaveBeenCalledWith({ ...ids, id: "7" }, expect.anything());
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("Certificate 7 of domain 200 deleted."),
    );
  });

  it("should require the certificate ID", async () => {
    await certificatesDelete([], context({ format: "json", ...domain })).catch(() => {});
    expect(exit).toHaveBeenCalledWith(3);
  });
});

describe("certificatesDeactivate", () => {
  it("should deactivate a certificate", async () => {
    const { deactivateCertificate } = await import("@studiometa/forge-core");
    vi.mocked(deactivateCertificate).mockResolvedValue({ data: undefined });

    await certificatesDeactivate(["7"], context({ format: "human", ...domain }));

    expect(deactivateCertificate).toHaveBeenCalledWith({ ...ids, id: "7" }, expect.anything());
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("Certificate 7 of domain 200 deactivated."),
    );
  });

  it("should require the certificate ID", async () => {
    await certificatesDeactivate([], context({ format: "json", ...domain })).catch(() => {});
    expect(exit).toHaveBeenCalledWith(3);
  });
});
