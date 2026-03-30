import { describe, expect, it } from "vitest";

import { HttpClient } from "@studiometa/forge-api";

import { BaseCollection } from "./base.ts";

function createClient(): HttpClient {
  return new HttpClient({
    token: "test",
    fetch: async () =>
      ({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({}),
        text: async () => "{}",
      }) as Response,
  });
}

class TestCollection extends BaseCollection {
  getClient(): HttpClient {
    return this.client;
  }

  getOrgSlug(): string {
    return this.orgSlug;
  }
}

describe("BaseCollection", () => {
  it("should store the client as a protected property", () => {
    const client = createClient();
    const collection = new TestCollection(client, "my-org");

    expect(collection.getClient()).toBe(client);
  });

  it("should store the orgSlug as a protected property", () => {
    const client = createClient();
    const collection = new TestCollection(client, "my-org");

    expect(collection.getOrgSlug()).toBe("my-org");
  });

  it("should allow subclasses to use the client", async () => {
    const client = createClient();
    const collection = new TestCollection(client, "my-org");

    expect(collection.getClient()).toBeInstanceOf(HttpClient);
  });
});
