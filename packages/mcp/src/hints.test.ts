import { describe, expect, it } from "vitest";

import { getServerHints, getSiteHints } from "./hints.ts";

describe("getServerHints", () => {
  it("should return related resources and common actions for a server", () => {
    const hints = getServerHints("123");

    expect(hints.related_resources).toBeDefined();
    expect(hints.related_resources!.length).toBeGreaterThan(0);
    expect(hints.related_resources![0]!.resource).toBe("sites");
    expect(hints.related_resources![0]!.example.server_id).toBe("123");

    expect(hints.common_actions).toBeDefined();
    expect(hints.common_actions![0]!.example.id).toBe("123");
  });
});

describe("getSiteHints", () => {
  it("should return related resources and common actions for a site", () => {
    const hints = getSiteHints("123", "456");

    expect(hints.related_resources).toBeDefined();
    expect(hints.related_resources!.length).toBeGreaterThan(0);
    expect(hints.related_resources![0]!.resource).toBe("deployments");
    expect(hints.related_resources![0]!.example.server_id).toBe("123");
    expect(hints.related_resources![0]!.example.site_id).toBe("456");

    expect(hints.common_actions).toBeDefined();
    expect(hints.common_actions![0]!.example.server_id).toBe("123");
  });
});
