import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import type { CertificateAttributes } from "@studiometa/forge-api";

import { createTestContext } from "../../context.ts";
import { certificatesList, certificatesGet, certificatesActivate } from "./handlers.ts";

vi.mock("@studiometa/forge-core", () => ({
  listCertificates: vi.fn(),
  getCertificate: vi.fn(),
  activateCertificate: vi.fn(),
}));

const mockCert: CertificateAttributes & { id: number } = {
  id: 1,
  domain: "example.com",
  request_status: "complete",
  status: "installed",
  type: "letsencrypt",
  existing: false,
  active: true,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

describe("certificatesList", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should list certificates", async () => {
    const { listCertificates } = await import("@studiometa/forge-core");
    vi.mocked(listCertificates).mockResolvedValue({ data: [mockCert] });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10", site: "100" },
    });

    await certificatesList(ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(expect.stringContaining('"example.com"'));
  });

  it("should exit with error when no server_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", site: "100" },
    });

    await certificatesList(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no site_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await certificatesList(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});

describe("certificatesGet", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should get certificate", async () => {
    const { getCertificate } = await import("@studiometa/forge-core");
    vi.mocked(getCertificate).mockResolvedValue({ data: mockCert });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10", site: "100" },
    });

    await certificatesGet(["1"], ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(expect.stringContaining('"example.com"'));
  });

  it("should exit with error when no certificate_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10", site: "100" },
    });

    await certificatesGet([], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no server_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", site: "100" },
    });

    await certificatesGet(["1"], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});

describe("certificatesActivate", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should activate certificate", async () => {
    const { activateCertificate } = await import("@studiometa/forge-core");
    vi.mocked(activateCertificate).mockResolvedValue({ data: undefined as never });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human", server: "10", site: "100" },
    });

    await certificatesActivate(["1"], ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(expect.stringContaining("activated"));
  });

  it("should exit with error when no certificate_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10", site: "100" },
    });

    await certificatesActivate([], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});

describe("certificatesList — human format lineFormat", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it("should render human format with active certificate", async () => {
    const { listCertificates } = await import("@studiometa/forge-core");
    vi.mocked(listCertificates).mockResolvedValue({ data: [mockCert] });
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human", server: "10", site: "100" },
    });
    await certificatesList(ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalled();
  });

  it("should render '—' for inactive certificate", async () => {
    const { listCertificates } = await import("@studiometa/forge-core");
    vi.mocked(listCertificates).mockResolvedValue({ data: [{ ...mockCert, active: false }] });
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human", server: "10", site: "100" },
    });
    await certificatesList(ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalled();
  });
});
