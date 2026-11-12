import { describe, expect, it } from "vitest";

import { HttpClient } from "@studiometa/forge-api";

import { toUrlString } from "../test-utils.ts";

import { AsyncPaginatedIterator } from "../pagination.ts";
import { TeamResource, TeamServersCollection, TeamsCollection } from "./teams.ts";

const ORG = "test-org";

const teamAttrs = { name: "studiometa", created_at: null, updated_at: null };
const serverAttrs = { name: "web-1" };

interface Call {
  method: string;
  url: string;
  body?: unknown;
}

/**
 * Create a client whose fetch answers list requests with one item per page, using the given
 * next cursors in order, and write requests with the given response.
 */
function createTrackingClient(
  options: {
    nextCursors?: Array<string | null>;
    attributes?: unknown;
    write?: () => Response;
  } = {},
): { client: HttpClient; calls: Call[] } {
  const { nextCursors = [null], attributes = teamAttrs, write } = options;
  const calls: Call[] = [];

  const client = new HttpClient({
    token: "test",
    fetch: async (url: string | URL | Request, init?: RequestInit) => {
      const method = init?.method ?? "GET";
      calls.push({
        method,
        url: toUrlString(url),
        body: init?.body ? JSON.parse(init.body as string) : undefined,
      });

      if (method !== "GET" && write) {
        return write();
      }

      const nextCursor = nextCursors[calls.length - 1] ?? null;
      return new Response(
        JSON.stringify({
          data: [{ id: String(calls.length), type: "teams", attributes }],
          links: {},
          meta: { per_page: 30, next_cursor: nextCursor },
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    },
  });

  return { client, calls };
}

describe("TeamsCollection", () => {
  it("should list teams with numeric ids", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new TeamsCollection(client, ORG);

    const teams = await collection.list();
    expect(calls[0].method).toBe("GET");
    expect(calls[0].url).toMatch(new RegExp(`/orgs/${ORG}/teams$`));
    expect(teams).toEqual([{ id: 1, ...teamAttrs }]);
  });

  it("should list teams with cursor option", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new TeamsCollection(client, ORG);

    await collection.list({ cursor: "abc123" });
    expect(calls[0].url).toContain(`/orgs/${ORG}/teams?page[cursor]=abc123`);
  });

  it("should iterate all teams across pages via all()", async () => {
    const { client, calls } = createTrackingClient({ nextCursors: ["cursor-2", null] });
    const collection = new TeamsCollection(client, ORG);

    const iter = collection.all();
    expect(iter).toBeInstanceOf(AsyncPaginatedIterator);
    const results = await iter.toArray();
    expect(results.map((team) => team.id)).toEqual([1, 2]);
    expect(calls).toHaveLength(2);
    expect(calls[0].url).toMatch(new RegExp(`/orgs/${ORG}/teams$`));
    expect(calls[1].url).toContain(`/orgs/${ORG}/teams?page[cursor]=cursor-2`);
  });
});

describe("TeamServersCollection", () => {
  it("should list the servers of a team with numeric ids", async () => {
    const { client, calls } = createTrackingClient({ attributes: serverAttrs });
    const collection = new TeamServersCollection(client, ORG, 17);

    const servers = await collection.list();
    expect(calls[0].method).toBe("GET");
    expect(calls[0].url).toMatch(new RegExp(`/orgs/${ORG}/teams/17/servers$`));
    expect(servers).toEqual([{ id: 1, ...serverAttrs }]);
  });

  it("should list the servers of a team with cursor option", async () => {
    const { client, calls } = createTrackingClient({ attributes: serverAttrs });
    const collection = new TeamServersCollection(client, ORG, 17);

    await collection.list({ cursor: "abc123" });
    expect(calls[0].url).toContain(`/orgs/${ORG}/teams/17/servers?page[cursor]=abc123`);
  });

  it("should iterate all the servers of a team across pages via all()", async () => {
    const { client, calls } = createTrackingClient({
      attributes: serverAttrs,
      nextCursors: ["cursor-2", null],
    });
    const collection = new TeamServersCollection(client, ORG, 17);

    const iter = collection.all();
    expect(iter).toBeInstanceOf(AsyncPaginatedIterator);
    const results = await iter.toArray();
    expect(results.map((server) => server.id)).toEqual([1, 2]);
    expect(calls).toHaveLength(2);
    expect(calls[0].url).toMatch(new RegExp(`/orgs/${ORG}/teams/17/servers$`));
    expect(calls[1].url).toContain(`/orgs/${ORG}/teams/17/servers?page[cursor]=cursor-2`);
  });

  it("should add a server to a team when Forge answers 201 with the server", async () => {
    const { client, calls } = createTrackingClient({
      write: () =>
        new Response(
          JSON.stringify({ data: { id: "123", type: "servers", attributes: serverAttrs } }),
          { status: 201, headers: { "content-type": "application/vnd.api+json" } },
        ),
    });
    const collection = new TeamServersCollection(client, ORG, 17);

    await expect(collection.add(123)).resolves.toBeUndefined();
    expect(calls[0].method).toBe("POST");
    expect(calls[0].url).toMatch(new RegExp(`/orgs/${ORG}/teams/17/servers$`));
    expect(calls[0].body).toEqual({ server_id: 123 });
  });

  it("should add a server to a team when Forge answers without a body", async () => {
    const { client } = createTrackingClient({
      write: () => new Response(null, { status: 204 }),
    });
    const collection = new TeamServersCollection(client, ORG, 17);

    await expect(collection.add(123)).resolves.toBeUndefined();
  });

  it("should remove a server from a team", async () => {
    const { client, calls } = createTrackingClient({
      write: () => new Response(null, { status: 204 }),
    });
    const collection = new TeamServersCollection(client, ORG, 17);

    await expect(collection.remove(123)).resolves.toBeUndefined();
    expect(calls[0].method).toBe("DELETE");
    expect(calls[0].url).toMatch(new RegExp(`/orgs/${ORG}/teams/17/servers/123$`));
    expect(calls[0].body).toBeUndefined();
  });
});

describe("TeamResource", () => {
  it("should expose the servers of the team", async () => {
    const { client, calls } = createTrackingClient({ attributes: serverAttrs });
    const team = new TeamResource(client, ORG, 17);

    expect(team.servers).toBeInstanceOf(TeamServersCollection);
    await team.servers.list();
    expect(calls[0].url).toContain(`/orgs/${ORG}/teams/17/servers`);
  });
});
