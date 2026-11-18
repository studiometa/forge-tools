import { describe, expect, it } from "vitest";

import { listQuery } from "./list-options.ts";

describe("listQuery", () => {
  it("returns an empty string without options", () => {
    expect(listQuery({})).toBe("");
  });

  it("builds the cursor, page size, filters, sort and includes", () => {
    expect(
      listQuery({
        cursor: "a b",
        pageSize: 50,
        filter: { name: "web 1", region: undefined },
        sort: ["name", "-created_at"],
        include: ["site", "initiator"],
      }),
    ).toBe(
      "?page[cursor]=a%20b&page[size]=50&filter[name]=web%201&sort=name,-created_at&include=site,initiator",
    );
  });

  it("uses the given cursor instead of the cursor of the options", () => {
    expect(listQuery({ cursor: "first" }, "next")).toBe("?page[cursor]=next");
    expect(listQuery({ cursor: "first" }, null)).toBe("");
  });
});
