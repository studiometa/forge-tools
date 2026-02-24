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
}

describe("BaseCollection", () => {
  it("should store the client as a protected property", () => {
    const client = createClient();
    const collection = new TestCollection(client);

    expect(collection.getClient()).toBe(client);
  });

  it("should allow subclasses to use the client", async () => {
    const client = createClient();
    const collection = new TestCollection(client);

    expect(collection.getClient()).toBeInstanceOf(HttpClient);
  });
});
