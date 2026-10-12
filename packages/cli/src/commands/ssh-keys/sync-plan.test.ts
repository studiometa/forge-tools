import { describe, it, expect } from "vitest";

import { ValidationError } from "../../errors.ts";
import { managedKeyName, parseAuthorizedKeys, planSync, slugify } from "./sync-plan.ts";

const ED25519 = "AAAAC3NzaC1lZDI1NTE5AAAAIA";
const RSA = "AAAAB3NzaC1yc2EAAAADAQAB";

describe("slugify", () => {
  it("keeps lowercase letters, digits and dashes", () => {
    expect(slugify("Titouan@Studio Meta.fr")).toBe("titouan-studio-meta-fr");
  });

  it("collapses and trims separators", () => {
    expect(slugify("--a__b--")).toBe("a-b");
  });

  it("returns 'key' when nothing is left", () => {
    expect(slugify("")).toBe("key");
    expect(slugify("@@@")).toBe("key");
  });

  it("truncates long comments without a trailing dash", () => {
    const slug = slugify(`${"a".repeat(39)} b`);
    expect(slug).toBe("a".repeat(39));
  });
});

describe("managedKeyName", () => {
  it("appends the first 8 hex chars of the SHA-256 of the decoded blob", () => {
    expect(managedKeyName("alice@laptop", ED25519)).toBe("alice-laptop-c4689bdf");
    expect(managedKeyName("", RSA)).toBe("key-162139dc");
  });
});

describe("parseAuthorizedKeys", () => {
  it("parses keys and ignores blank lines and comments", () => {
    const content = [
      "# team keys",
      "",
      `ssh-ed25519 ${ED25519} alice@laptop`,
      `  ssh-rsa ${RSA}  `,
      `ecdsa-sha2-nistp256 AAAAE2Vj bob  work laptop\r`,
    ].join("\n");

    expect(parseAuthorizedKeys(content)).toEqual([
      { name: "alice-laptop-c4689bdf", key: `ssh-ed25519 ${ED25519} alice@laptop`, line: 3 },
      { name: "key-162139dc", key: `ssh-rsa ${RSA}`, line: 4 },
      {
        name: expect.stringMatching(/^bob-work-laptop-[0-9a-f]{8}$/),
        key: "ecdsa-sha2-nistp256 AAAAE2Vj bob work laptop",
        line: 5,
      },
    ]);
  });

  it("returns no keys for an empty file", () => {
    expect(parseAuthorizedKeys("\n# nothing\n")).toEqual([]);
  });

  it.each([
    ["an unknown key type", `rsa ${RSA}`],
    ["a missing blob", "ssh-ed25519"],
    ["an invalid blob", "ssh-ed25519 not*base64"],
    ["an options prefix", `no-pty ssh-ed25519 ${ED25519}`],
  ])("rejects %s with the line number", (_label, line) => {
    expect(() => parseAuthorizedKeys(`# header\n${line}`)).toThrow(/^Line 2: expected/);
  });

  it("throws a ValidationError on the file field", () => {
    try {
      parseAuthorizedKeys("bad");
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).field).toBe("file");
    }
  });

  it("rejects a key given twice", () => {
    const content = `ssh-ed25519 ${ED25519} a\nssh-ed25519 ${ED25519} b`;
    expect(() => parseAuthorizedKeys(content)).toThrow("Line 2: duplicate of the key on line 1");
  });
});

describe("planSync", () => {
  const fileKeys = parseAuthorizedKeys(`ssh-ed25519 ${ED25519} alice\nssh-rsa ${RSA} bob`);
  const [alice, bob] = fileKeys;

  it("adds missing keys, removes extra keys and keeps matching keys", () => {
    const plan = planSync(
      fileKeys,
      [
        { id: 1, name: alice.name, user: "forge" },
        { id: 2, name: "old-key", user: "forge" },
      ],
      "forge",
    );

    expect(plan).toEqual({
      add: [bob],
      remove: [{ id: 2, name: "old-key", user: "forge" }],
      unchanged: [alice],
    });
  });

  it("ignores keys of other users", () => {
    const plan = planSync(
      fileKeys,
      [
        { id: 1, name: alice.name, user: "root" },
        { id: 2, name: "other", user: "root" },
      ],
      "forge",
    );

    expect(plan).toEqual({ add: [alice, bob], remove: [], unchanged: [] });
  });

  it("returns an empty plan when the server matches the file", () => {
    const plan = planSync(
      fileKeys,
      fileKeys.map((k, i) => ({ id: i, name: k.name, user: "deploy" })),
      "deploy",
    );

    expect(plan).toEqual({ add: [], remove: [], unchanged: [alice, bob] });
  });
});
