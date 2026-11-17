import { describe, expect, it } from "vitest";

import { ValidationError } from "../../../errors.ts";
import { assertTemplate, renderTemplate, templateVariables } from "./template.ts";

describe("templateVariables", () => {
  it("lists each variable once, with or without spaces in the braces", () => {
    expect(templateVariables("{{SITE}} {{ SITE }} {{  PROXY_PASS  }} $uri {x}")).toEqual([
      "SITE",
      "PROXY_PASS",
    ]);
  });
});

describe("assertTemplate", () => {
  it("refuses an unknown variable, names it and lists the known ones", () => {
    let error: unknown;
    try {
      assertTemplate("{{ A }} {{ C }}", ["A", "B"], "Text x", "field");
    } catch (caught) {
      error = caught;
    }
    expect(error).toBeInstanceOf(ValidationError);
    expect((error as ValidationError).message).toBe("Text x has unknown variables: {{C}}");
    expect((error as ValidationError).field).toBe("field");
  });
});

describe("renderTemplate", () => {
  it("replaces the variables only, and reads only the values in use", () => {
    const values = {
      A: "1",
      get B(): string {
        throw new Error("not read");
      },
    };
    expect(renderTemplate("{{A}}-{{ A }} ${A} {{ C }}", values)).toBe("1-1 ${A} {{ C }}");
  });
});
