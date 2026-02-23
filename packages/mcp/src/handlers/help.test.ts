import { describe, expect, it } from "vitest";

import { handleHelp, handleHelpOverview } from "./help.ts";

describe("handleHelp", () => {
  it("should return help for servers", () => {
    const result = handleHelp("servers");
    expect(result.content[0]!.text).toContain("Servers");
    expect(result.content[0]!.text).toContain("list");
    expect(result.content[0]!.text).toContain("reboot");
  });

  it("should return help for sites", () => {
    const result = handleHelp("sites");
    expect(result.content[0]!.text).toContain("Sites");
    expect(result.content[0]!.text).toContain("server_id");
  });

  it("should return help for deployments", () => {
    const result = handleHelp("deployments");
    expect(result.content[0]!.text).toContain("Deployments");
    expect(result.content[0]!.text).toContain("deploy");
  });

  it("should return overview for unknown resource", () => {
    const result = handleHelp("unknown");
    expect(result.content[0]!.text).toContain("Available Resources");
  });
});

describe("handleHelpOverview", () => {
  it("should return a global overview", () => {
    const result = handleHelpOverview();
    expect(result.content[0]!.text).toContain("servers");
    expect(result.content[0]!.text).toContain("sites");
    expect(result.content[0]!.text).toContain("deployments");
  });
});
