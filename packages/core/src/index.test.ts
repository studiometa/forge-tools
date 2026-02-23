import { describe, expect, it } from "vitest";

import * as core from "./index.ts";

describe("@studiometa/forge-core", () => {
  it("should export constants", () => {
    expect(core.RESOURCES).toBeDefined();
    expect(core.ACTIONS).toBeDefined();
    expect(core.RESOURCES.length).toBeGreaterThan(10);
    expect(core.ACTIONS.length).toBeGreaterThan(5);
  });

  it("should export context utilities", () => {
    expect(core.createTestExecutorContext).toBeTypeOf("function");
  });

  it("should export server executors", () => {
    expect(core.listServers).toBeTypeOf("function");
    expect(core.getServer).toBeTypeOf("function");
    expect(core.createServer).toBeTypeOf("function");
    expect(core.deleteServer).toBeTypeOf("function");
    expect(core.rebootServer).toBeTypeOf("function");
  });

  it("should export site executors", () => {
    expect(core.listSites).toBeTypeOf("function");
    expect(core.getSite).toBeTypeOf("function");
    expect(core.createSite).toBeTypeOf("function");
    expect(core.deleteSite).toBeTypeOf("function");
  });

  it("should export deployment executors", () => {
    expect(core.listDeployments).toBeTypeOf("function");
    expect(core.deploySite).toBeTypeOf("function");
    expect(core.getDeploymentOutput).toBeTypeOf("function");
    expect(core.getDeploymentScript).toBeTypeOf("function");
    expect(core.updateDeploymentScript).toBeTypeOf("function");
  });

  it("should export certificate executors", () => {
    expect(core.listCertificates).toBeTypeOf("function");
    expect(core.getCertificate).toBeTypeOf("function");
    expect(core.createCertificate).toBeTypeOf("function");
    expect(core.deleteCertificate).toBeTypeOf("function");
    expect(core.activateCertificate).toBeTypeOf("function");
  });

  it("should export database executors", () => {
    expect(core.listDatabases).toBeTypeOf("function");
    expect(core.getDatabase).toBeTypeOf("function");
    expect(core.createDatabase).toBeTypeOf("function");
    expect(core.deleteDatabase).toBeTypeOf("function");
  });

  it("should export daemon executors", () => {
    expect(core.listDaemons).toBeTypeOf("function");
    expect(core.getDaemon).toBeTypeOf("function");
    expect(core.createDaemon).toBeTypeOf("function");
    expect(core.deleteDaemon).toBeTypeOf("function");
    expect(core.restartDaemon).toBeTypeOf("function");
  });

  it("should export firewall rule executors", () => {
    expect(core.listFirewallRules).toBeTypeOf("function");
    expect(core.getFirewallRule).toBeTypeOf("function");
    expect(core.createFirewallRule).toBeTypeOf("function");
    expect(core.deleteFirewallRule).toBeTypeOf("function");
  });

  it("should export SSH key executors", () => {
    expect(core.listSshKeys).toBeTypeOf("function");
    expect(core.getSshKey).toBeTypeOf("function");
    expect(core.createSshKey).toBeTypeOf("function");
    expect(core.deleteSshKey).toBeTypeOf("function");
  });

  it("should export security rule executors", () => {
    expect(core.listSecurityRules).toBeTypeOf("function");
    expect(core.getSecurityRule).toBeTypeOf("function");
    expect(core.createSecurityRule).toBeTypeOf("function");
    expect(core.deleteSecurityRule).toBeTypeOf("function");
  });

  it("should export redirect rule executors", () => {
    expect(core.listRedirectRules).toBeTypeOf("function");
    expect(core.getRedirectRule).toBeTypeOf("function");
    expect(core.createRedirectRule).toBeTypeOf("function");
    expect(core.deleteRedirectRule).toBeTypeOf("function");
  });

  it("should export monitor executors", () => {
    expect(core.listMonitors).toBeTypeOf("function");
    expect(core.getMonitor).toBeTypeOf("function");
    expect(core.createMonitor).toBeTypeOf("function");
    expect(core.deleteMonitor).toBeTypeOf("function");
  });

  it("should export nginx template executors", () => {
    expect(core.listNginxTemplates).toBeTypeOf("function");
    expect(core.getNginxTemplate).toBeTypeOf("function");
    expect(core.createNginxTemplate).toBeTypeOf("function");
    expect(core.updateNginxTemplate).toBeTypeOf("function");
    expect(core.deleteNginxTemplate).toBeTypeOf("function");
  });

  it("should export recipe executors", () => {
    expect(core.listRecipes).toBeTypeOf("function");
    expect(core.getRecipe).toBeTypeOf("function");
    expect(core.createRecipe).toBeTypeOf("function");
    expect(core.deleteRecipe).toBeTypeOf("function");
    expect(core.runRecipe).toBeTypeOf("function");
  });
});
