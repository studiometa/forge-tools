import { describe, expect, it } from "vitest";

import { Forge } from "../forge.ts";
import { createMockFetch } from "../test-utils.ts";
import { CertificatesCollection } from "./certificates.ts";

const ORG = "test-org";
const SERVER_ID = 123;
const SITE_ID = 456;
const DOMAIN_ID = 789;

const BASE_PATH = `/orgs/${ORG}/servers/${SERVER_ID}/sites/${SITE_ID}/domains/${DOMAIN_ID}/certificate`;

function mockDocument<T>(id: string | number, attributes: T) {
  return { data: { id: String(id), type: "resource", attributes } };
}

const CERT_ATTRS = {
  domain: "example.com",
  type: "letsencrypt",
  request_status: "complete",
  status: "active",
  existing: false,
  active: true,
  created_at: "",
  updated_at: "",
};

describe("CertificatesCollection", () => {
  it("should get a certificate for a domain", async () => {
    const mockFetch = createMockFetch((url) => {
      expect(url).toContain(BASE_PATH);
      return mockDocument("1", CERT_ATTRS);
    });
    const forge = new Forge("test-token", ORG, { fetch: mockFetch });
    const cert = await forge.server(SERVER_ID).site(SITE_ID).certificates.get(DOMAIN_ID);

    expect(cert.id).toBe(1);
    expect(cert.domain).toBe("example.com");
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("should create a certificate for a domain", async () => {
    const mockFetch = createMockFetch((url, init) => {
      expect(url).toContain(BASE_PATH);
      expect(init?.method).toBe("POST");
      const body = JSON.parse(init?.body as string);
      expect(body).toEqual({ type: "letsencrypt" });
      return mockDocument("2", CERT_ATTRS);
    });
    const forge = new Forge("test-token", ORG, { fetch: mockFetch });
    const cert = await forge
      .server(SERVER_ID)
      .site(SITE_ID)
      .certificates.create(DOMAIN_ID, { type: "letsencrypt" });

    expect(cert.id).toBe(2);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("should delete a certificate for a domain", async () => {
    const mockFetch = createMockFetch((url, init) => {
      expect(url).toContain(BASE_PATH);
      expect(init?.method).toBe("DELETE");
      return {};
    });
    const forge = new Forge("test-token", ORG, { fetch: mockFetch });
    await forge.server(SERVER_ID).site(SITE_ID).certificates.delete(DOMAIN_ID);

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("should activate a certificate for a domain", async () => {
    const mockFetch = createMockFetch((url, init) => {
      expect(url).toContain(`${BASE_PATH}/actions`);
      expect(init?.method).toBe("POST");
      const body = JSON.parse(init?.body as string);
      expect(body).toEqual({ action: "activate" });
      return {};
    });
    const forge = new Forge("test-token", ORG, { fetch: mockFetch });
    await forge.server(SERVER_ID).site(SITE_ID).certificates.activate(DOMAIN_ID);

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("should build correct domain path", async () => {
    const mockFetch = createMockFetch((url) => {
      expect(url).toContain(
        `/orgs/${ORG}/servers/${SERVER_ID}/sites/${SITE_ID}/domains/999/certificate`,
      );
      return mockDocument("1", CERT_ATTRS);
    });
    const forge = new Forge("test-token", ORG, { fetch: mockFetch });
    await forge.server(SERVER_ID).site(SITE_ID).certificates.get(999);

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
