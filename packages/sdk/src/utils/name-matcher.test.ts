import { describe, expect, it } from "vitest";

import { matchByName } from "./name-matcher.ts";

interface Item {
  id: number;
  name: string;
}

const items: Item[] = [
  { id: 1, name: "prod-web-1" },
  { id: 2, name: "prod-web-2" },
  { id: 3, name: "staging-web-1" },
  { id: 4, name: "prod" },
];

describe("matchByName", () => {
  it("should return partial matches", () => {
    const { partial } = matchByName(items, "prod", (i) => i.name);
    expect(partial).toHaveLength(3);
    expect(partial.map((i) => i.id)).toEqual([1, 2, 4]);
  });

  it("should return exact matches", () => {
    const { exact } = matchByName(items, "prod", (i) => i.name);
    expect(exact).toHaveLength(1);
    expect(exact[0]!.id).toBe(4);
  });

  it("should be case-insensitive", () => {
    const { exact, partial } = matchByName(items, "PROD", (i) => i.name);
    expect(exact).toHaveLength(1);
    expect(exact[0]!.id).toBe(4);
    expect(partial).toHaveLength(3);
  });

  it("should return empty arrays for no matches", () => {
    const { exact, partial } = matchByName(items, "unknown", (i) => i.name);
    expect(exact).toHaveLength(0);
    expect(partial).toHaveLength(0);
  });

  it("should work with custom getName function", () => {
    const domainItems = [
      { id: 1, domain: "example.com" },
      { id: 2, domain: "example.org" },
      { id: 3, domain: "test.com" },
    ];
    const { partial } = matchByName(domainItems, "example", (i) => i.domain);
    expect(partial).toHaveLength(2);
  });

  it("should handle empty items array", () => {
    const { exact, partial } = matchByName([], "prod", (i: Item) => i.name);
    expect(exact).toHaveLength(0);
    expect(partial).toHaveLength(0);
  });
});
