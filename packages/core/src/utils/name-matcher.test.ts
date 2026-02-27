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
  { id: 4, name: "production" },
];

const getName = (item: Item) => item.name;

describe("matchByName", () => {
  it("returns exact match in exact array", () => {
    const { exact } = matchByName(items, "production", getName);
    expect(exact).toHaveLength(1);
    expect(exact[0]!.id).toBe(4);
  });

  it("returns partial matches in partial array", () => {
    const { partial } = matchByName(items, "prod", getName);
    expect(partial).toHaveLength(3); // prod-web-1, prod-web-2, production
  });

  it("includes exact matches in partial array", () => {
    const { exact, partial } = matchByName(items, "production", getName);
    expect(exact).toHaveLength(1);
    expect(partial).toContainEqual(exact[0]);
  });

  it("is case insensitive for exact match", () => {
    const { exact } = matchByName(items, "PRODUCTION", getName);
    expect(exact).toHaveLength(1);
    expect(exact[0]!.name).toBe("production");
  });

  it("is case insensitive for partial match", () => {
    const { partial } = matchByName(items, "PROD", getName);
    expect(partial).toHaveLength(3);
  });

  it("matches all items with empty query", () => {
    const { exact, partial } = matchByName(items, "", getName);
    // Every name includes "" and equals "" is false → exact empty, partial all
    expect(exact).toHaveLength(0);
    expect(partial).toHaveLength(items.length);
  });

  it("returns empty arrays when no matches", () => {
    const { exact, partial } = matchByName(items, "nonexistent", getName);
    expect(exact).toHaveLength(0);
    expect(partial).toHaveLength(0);
  });

  it("works with a custom getName function", () => {
    const data = [
      { id: 1, label: "Alpha" },
      { id: 2, label: "Beta" },
      { id: 3, label: "alpha-extra" },
    ];
    const { exact, partial } = matchByName(data, "alpha", (d) => d.label);
    expect(exact).toHaveLength(1);
    expect(exact[0]!.id).toBe(1);
    expect(partial).toHaveLength(2);
  });

  it("returns empty arrays for empty items array", () => {
    const { exact, partial } = matchByName([], "prod", getName);
    expect(exact).toHaveLength(0);
    expect(partial).toHaveLength(0);
  });

  it("returns multiple exact matches when names are duplicated", () => {
    const dupes: Item[] = [
      { id: 1, name: "prod" },
      { id: 2, name: "prod" },
    ];
    const { exact, partial } = matchByName(dupes, "prod", getName);
    expect(exact).toHaveLength(2);
    expect(partial).toHaveLength(2);
  });
});
