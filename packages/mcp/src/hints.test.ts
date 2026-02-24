import { describe, expect, it } from "vitest";

import {
  getCertificateHints,
  getDatabaseHints,
  getDaemonHints,
  getFirewallRuleHints,
  getNginxTemplateHints,
  getRecipeHints,
  getServerHints,
  getSiteHints,
  getSshKeyHints,
} from "./hints.ts";

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

  it("should include ssh-keys and firewall-rules as related resources", () => {
    const hints = getServerHints("42");
    const resources = hints.related_resources!.map((r) => r.resource);
    expect(resources).toContain("ssh-keys");
    expect(resources).toContain("firewall-rules");
    expect(resources).toContain("databases");
    expect(resources).toContain("daemons");
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

  it("should include certificates, env and nginx as related resources", () => {
    const hints = getSiteHints("1", "2");
    const resources = hints.related_resources!.map((r) => r.resource);
    expect(resources).toContain("certificates");
    expect(resources).toContain("env");
    expect(resources).toContain("nginx");
  });
});

describe("getDatabaseHints", () => {
  it("should return hints for a database", () => {
    const hints = getDatabaseHints("10", "99");

    expect(hints.related_resources).toBeDefined();
    expect(hints.related_resources![0]!.resource).toBe("databases");
    expect(hints.related_resources![0]!.example.server_id).toBe("10");

    expect(hints.common_actions).toBeDefined();
    expect(hints.common_actions![0]!.example.server_id).toBe("10");
    expect(hints.common_actions![0]!.example.id).toBe("99");
  });
});

describe("getDaemonHints", () => {
  it("should return hints for a daemon", () => {
    const hints = getDaemonHints("5", "77");

    expect(hints.related_resources).toBeDefined();
    expect(hints.related_resources![0]!.resource).toBe("daemons");
    expect(hints.related_resources![0]!.example.server_id).toBe("5");

    expect(hints.common_actions).toBeDefined();
    // Should have restart and delete actions
    const actions = hints.common_actions!.map((a) => a.example);
    const hasRestart = actions.some((a) => (a as Record<string, unknown>).action === "restart");
    const hasDelete = actions.some((a) => (a as Record<string, unknown>).action === "delete");
    expect(hasRestart).toBe(true);
    expect(hasDelete).toBe(true);
  });
});

describe("getCertificateHints", () => {
  it("should return hints for a certificate", () => {
    const hints = getCertificateHints("3", "7", "55");

    expect(hints.related_resources).toBeDefined();
    expect(hints.related_resources![0]!.resource).toBe("certificates");
    expect(hints.related_resources![0]!.example.server_id).toBe("3");
    expect(hints.related_resources![0]!.example.site_id).toBe("7");

    expect(hints.common_actions).toBeDefined();
    const actions = hints.common_actions!.map((a) => a.example);
    const hasActivate = actions.some((a) => (a as Record<string, unknown>).action === "activate");
    const hasDelete = actions.some((a) => (a as Record<string, unknown>).action === "delete");
    expect(hasActivate).toBe(true);
    expect(hasDelete).toBe(true);
  });
});

describe("getFirewallRuleHints", () => {
  it("should return hints for a firewall rule", () => {
    const hints = getFirewallRuleHints("8", "33");

    expect(hints.related_resources).toBeDefined();
    expect(hints.related_resources![0]!.resource).toBe("firewall-rules");
    expect(hints.related_resources![0]!.example.server_id).toBe("8");

    expect(hints.common_actions).toBeDefined();
    expect(hints.common_actions![0]!.example.id).toBe("33");
    expect(hints.common_actions![0]!.example.server_id).toBe("8");
  });
});

describe("getSshKeyHints", () => {
  it("should return hints for an SSH key", () => {
    const hints = getSshKeyHints("9", "44");

    expect(hints.related_resources).toBeDefined();
    expect(hints.related_resources![0]!.resource).toBe("ssh-keys");
    expect(hints.related_resources![0]!.example.server_id).toBe("9");

    expect(hints.common_actions).toBeDefined();
    expect(hints.common_actions![0]!.example.id).toBe("44");
  });
});

describe("getRecipeHints", () => {
  it("should return hints for a recipe", () => {
    const hints = getRecipeHints("66");

    expect(hints.related_resources).toBeDefined();
    expect(hints.related_resources![0]!.resource).toBe("recipes");

    expect(hints.common_actions).toBeDefined();
    const actions = hints.common_actions!.map((a) => a.example);
    const hasRun = actions.some((a) => (a as Record<string, unknown>).action === "run");
    const hasDelete = actions.some((a) => (a as Record<string, unknown>).action === "delete");
    expect(hasRun).toBe(true);
    expect(hasDelete).toBe(true);
    expect((hints.common_actions![0]!.example as Record<string, unknown>).id).toBe("66");
  });
});

describe("getNginxTemplateHints", () => {
  it("should return hints for an nginx template", () => {
    const hints = getNginxTemplateHints("11", "22");

    expect(hints.related_resources).toBeDefined();
    expect(hints.related_resources![0]!.resource).toBe("nginx-templates");
    expect(hints.related_resources![0]!.example.server_id).toBe("11");

    expect(hints.common_actions).toBeDefined();
    const actions = hints.common_actions!.map((a) => a.example);
    const hasUpdate = actions.some((a) => (a as Record<string, unknown>).action === "update");
    const hasDelete = actions.some((a) => (a as Record<string, unknown>).action === "delete");
    expect(hasUpdate).toBe(true);
    expect(hasDelete).toBe(true);
  });
});
