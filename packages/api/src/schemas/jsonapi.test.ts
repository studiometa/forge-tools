import { describe, expect, it } from "vitest";
import * as v from "valibot";

import {
  jsonApiResourceSchema,
  jsonApiDocumentSchema,
  jsonApiListDocumentSchema,
} from "./jsonapi.ts";

const TestAttrsSchema = v.object({
  name: v.string(),
  status: v.string(),
});

describe("jsonApiResourceSchema", () => {
  it("should validate a valid resource", () => {
    const schema = jsonApiResourceSchema(TestAttrsSchema);
    const result = v.safeParse(schema, {
      id: "1",
      type: "tests",
      attributes: { name: "test", status: "active" },
    });
    expect(result.success).toBe(true);
  });

  it("should reject a resource with invalid attributes", () => {
    const schema = jsonApiResourceSchema(TestAttrsSchema);
    expect(() =>
      v.parse(schema, {
        id: "1",
        type: "tests",
        attributes: { name: 123 },
      }),
    ).toThrow();
  });

  it("should reject a resource without id", () => {
    const schema = jsonApiResourceSchema(TestAttrsSchema);
    expect(() =>
      v.parse(schema, {
        type: "tests",
        attributes: { name: "test", status: "active" },
      }),
    ).toThrow();
  });
});

describe("jsonApiDocumentSchema", () => {
  it("should validate a valid single-resource document", () => {
    const schema = jsonApiDocumentSchema(TestAttrsSchema);
    const result = v.safeParse(schema, {
      data: {
        id: "1",
        type: "tests",
        attributes: { name: "test", status: "active" },
      },
    });
    expect(result.success).toBe(true);
  });

  it("should reject a document without data", () => {
    const schema = jsonApiDocumentSchema(TestAttrsSchema);
    expect(() => v.parse(schema, {})).toThrow();
  });

  it("should reject a document with invalid resource", () => {
    const schema = jsonApiDocumentSchema(TestAttrsSchema);
    expect(() =>
      v.parse(schema, {
        data: { id: "1", type: "tests", attributes: { name: 123 } },
      }),
    ).toThrow();
  });
});

describe("jsonApiListDocumentSchema", () => {
  it("should validate a valid list document", () => {
    const schema = jsonApiListDocumentSchema(TestAttrsSchema);
    const result = v.safeParse(schema, {
      data: [
        { id: "1", type: "tests", attributes: { name: "a", status: "active" } },
        { id: "2", type: "tests", attributes: { name: "b", status: "inactive" } },
      ],
      links: { next: null, prev: null },
      meta: { per_page: 30, next_cursor: null, prev_cursor: null },
    });
    expect(result.success).toBe(true);
  });

  it("should validate an empty list", () => {
    const schema = jsonApiListDocumentSchema(TestAttrsSchema);
    const result = v.safeParse(schema, {
      data: [],
      links: { next: null, prev: null },
      meta: { per_page: 30 },
    });
    expect(result.success).toBe(true);
  });

  it("should reject a list without meta", () => {
    const schema = jsonApiListDocumentSchema(TestAttrsSchema);
    expect(() =>
      v.parse(schema, {
        data: [],
        links: {},
      }),
    ).toThrow();
  });

  it("should reject a list with invalid resources", () => {
    const schema = jsonApiListDocumentSchema(TestAttrsSchema);
    expect(() =>
      v.parse(schema, {
        data: [{ id: "1", type: "tests", attributes: { name: 123 } }],
        links: {},
        meta: { per_page: 30 },
      }),
    ).toThrow();
  });
});
