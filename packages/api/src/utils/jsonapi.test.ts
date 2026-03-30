import { describe, expect, it } from "vitest";

import type { JsonApiDocument, JsonApiListDocument, JsonApiResource } from "../types/jsonapi.ts";

import { unwrapResource, unwrapDocument, unwrapListDocument } from "./jsonapi.ts";

interface TestAttributes {
  name: string;
  status: string;
}

const mockResource: JsonApiResource<TestAttributes> = {
  id: "42",
  type: "servers",
  attributes: {
    name: "web-1",
    status: "active",
  },
  links: {
    self: { href: "/api/orgs/my-org/servers/42" },
  },
};

describe("unwrapResource", () => {
  it("should return attributes with numeric id", () => {
    const result = unwrapResource(mockResource);
    expect(result).toEqual({
      id: 42,
      name: "web-1",
      status: "active",
    });
  });

  it("should convert string id to number", () => {
    const result = unwrapResource(mockResource);
    expect(typeof result.id).toBe("number");
  });
});

describe("unwrapDocument", () => {
  it("should unwrap a single-resource document", () => {
    const doc: JsonApiDocument<TestAttributes> = { data: mockResource };
    const result = unwrapDocument(doc);
    expect(result).toEqual({
      id: 42,
      name: "web-1",
      status: "active",
    });
  });
});

describe("unwrapListDocument", () => {
  it("should unwrap a list document to an array", () => {
    const doc: JsonApiListDocument<TestAttributes> = {
      data: [
        mockResource,
        {
          id: "43",
          type: "servers",
          attributes: { name: "web-2", status: "installing" },
        },
      ],
      links: { next: null, prev: null },
      meta: { per_page: 30, next_cursor: null, prev_cursor: null },
    };

    const result = unwrapListDocument(doc);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ id: 42, name: "web-1", status: "active" });
    expect(result[1]).toEqual({ id: 43, name: "web-2", status: "installing" });
  });

  it("should return empty array for empty data", () => {
    const doc: JsonApiListDocument<TestAttributes> = {
      data: [],
      links: { next: null, prev: null },
      meta: { per_page: 30, next_cursor: null, prev_cursor: null },
    };

    expect(unwrapListDocument(doc)).toEqual([]);
  });
});
