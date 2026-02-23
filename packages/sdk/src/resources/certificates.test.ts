import { describe, expect, it } from "vitest";

import { HttpClient } from "@studiometa/forge-api";

import { CertificatesCollection } from "./certificates.ts";

function createTrackingClient(): {
  client: HttpClient;
  calls: Array<{ method: string; url: string; body?: unknown }>;
} {
  const calls: Array<{ method: string; url: string; body?: unknown }> = [];

  const client = new HttpClient({
    token: "test",
    fetch: async (url: string | URL | Request, init?: RequestInit) => {
      calls.push({
        method: init?.method ?? "GET",
        url: url.toString(),
        body: init?.body ? JSON.parse(init.body as string) : undefined,
      });
      return {
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ certificate: { id: 1 }, certificates: [] }),
        text: async () => "{}",
      } as Response;
    },
  });

  return { client, calls };
}

describe("CertificatesCollection", () => {
  it("should list certificates", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new CertificatesCollection(client, 123, 456);

    await collection.list();
    expect(calls[0]!.url).toContain("/servers/123/sites/456/certificates");
  });

  it("should get a certificate", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new CertificatesCollection(client, 123, 456);

    await collection.get(789);
    expect(calls[0]!.url).toContain("/servers/123/sites/456/certificates/789");
  });

  it("should create a certificate", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new CertificatesCollection(client, 123, 456);

    await collection.create({ type: "new", domain: "example.com" });
    expect(calls[0]!.method).toBe("POST");
    expect(calls[0]!.body).toEqual({ type: "new", domain: "example.com" });
  });

  it("should install Let's Encrypt certificate", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new CertificatesCollection(client, 123, 456);

    await collection.letsEncrypt(["example.com", "www.example.com"]);
    expect(calls[0]!.url).toContain("/certificates/letsencrypt");
    expect(calls[0]!.body).toEqual({ domains: ["example.com", "www.example.com"] });
  });

  it("should delete a certificate", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new CertificatesCollection(client, 123, 456);

    await collection.delete(789);
    expect(calls[0]!.method).toBe("DELETE");
  });

  it("should activate a certificate", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new CertificatesCollection(client, 123, 456);

    await collection.activate(789);
    expect(calls[0]!.method).toBe("POST");
    expect(calls[0]!.url).toContain("/certificates/789/activate");
  });
});
