import { describe, expect, it } from "vitest";

import { Forge } from "../forge.ts";
import { createMockFetch } from "../test-utils.ts";

const ORG = "test-org";
const SERVER_ID = 123;
const SITE_ID = 456;
const DOMAIN_ID = 789;

const SITE_PATH = `/orgs/${ORG}/servers/${SERVER_ID}/sites/${SITE_ID}`;
const BASE_PATH = `${SITE_PATH}/domains/${DOMAIN_ID}/certificates`;

function mockDocument<T>(id: string | number, attributes: T) {
  return { data: { id: String(id), type: "certificates", attributes } };
}

const CERT_ATTRS = {
  type: "letsencrypt",
  verification_method: "http-01",
  key_type: "ecdsa",
  preferred_chain: null,
  request_status: "created",
  status: "installed",
  active: true,
  created_at: "",
  updated_at: "",
};

function certificates(mockFetch: typeof fetch) {
  return new Forge("test-token", ORG, { fetch: mockFetch }).server(SERVER_ID).site(SITE_ID)
    .certificates;
}

describe("CertificatesCollection", () => {
  it("should list the certificates of a domain", async () => {
    const mockFetch = createMockFetch((url, init) => {
      expect(url).toMatch(new RegExp(`${BASE_PATH}$`));
      expect(init?.method).toBe("GET");
      return { data: [mockDocument("1", CERT_ATTRS).data] };
    });

    const certs = await certificates(mockFetch).list(DOMAIN_ID);

    expect(certs).toEqual([{ id: 1, ...CERT_ATTRS }]);
  });

  it("should list the certificates of every domain of the site", async () => {
    const mockFetch = createMockFetch((url) => {
      expect(url).toMatch(new RegExp(`${SITE_PATH}/certificates$`));
      return { data: [] };
    });

    expect(await certificates(mockFetch).list()).toEqual([]);
  });

  it("should get the active certificate of a domain", async () => {
    const mockFetch = createMockFetch((url) => {
      expect(url).toMatch(new RegExp(`${BASE_PATH}/active$`));
      return mockDocument("1", CERT_ATTRS);
    });

    const cert = await certificates(mockFetch).active(DOMAIN_ID);

    expect(cert).toMatchObject({ id: 1, active: true });
  });

  it("should get a certificate of a domain", async () => {
    const mockFetch = createMockFetch((url) => {
      expect(url).toMatch(new RegExp(`${BASE_PATH}/12$`));
      return mockDocument("12", { ...CERT_ATTRS, active: false });
    });

    const cert = await certificates(mockFetch).get(DOMAIN_ID, 12);

    expect(cert).toMatchObject({ id: 12, active: false });
  });

  it("should create a certificate for a domain", async () => {
    const mockFetch = createMockFetch((url, init) => {
      expect(url).toMatch(new RegExp(`${BASE_PATH}$`));
      expect(init?.method).toBe("POST");
      expect(JSON.parse(init?.body as string)).toEqual({ type: "letsencrypt" });
      return mockDocument("2", CERT_ATTRS);
    });

    const cert = await certificates(mockFetch).create(DOMAIN_ID, { type: "letsencrypt" });

    expect(cert.id).toBe(2);
  });

  it("should delete a certificate of a domain", async () => {
    const mockFetch = createMockFetch((url, init) => {
      expect(url).toMatch(new RegExp(`${BASE_PATH}/12$`));
      expect(init?.method).toBe("DELETE");
      return {};
    });

    await certificates(mockFetch).delete(DOMAIN_ID, 12);

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("should activate a certificate of a domain", async () => {
    const mockFetch = createMockFetch((url, init) => {
      expect(url).toMatch(new RegExp(`${BASE_PATH}/12/actions$`));
      expect(init?.method).toBe("POST");
      expect(JSON.parse(init?.body as string)).toEqual({ action: "enable" });
      return {};
    });

    await certificates(mockFetch).activate(DOMAIN_ID, 12);

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
