import { describe, it, expect } from "vitest";

import { ValidationError } from "../../errors.ts";
import {
  isValidKeyBlob,
  managedKeyName,
  parseAuthorizedKeys,
  planSync,
  slugify,
} from "./sync-plan.ts";

// Real public keys (generated with ssh-keygen for these tests).
const ED25519 = "AAAAC3NzaC1lZDI1NTE5AAAAIOZj9JBXmdLF38UFVJYooSYlEjxnx+J2ipceaMAPqoyx";
const ECDSA =
  "AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBCCrsmBJHOA+zxFC3Yv/sGWuEUp2UcOpcmrIZPrsx/lEZEk5klePS4mPyiPJqP6f/NaC0cHBsX43yzg/BxYg5MA=";
const RSA =
  "AAAAB3NzaC1yc2EAAAADAQABAAAAgQDDLT3wOmgU0XsevYrD19e5cTxGA4W9V4nhoyPE9IbqWkueNxMDO5kzTFS1dVRX7DaY0lRs7sQfLJKb288N3NKocTgilTMT+PkLdKNhjLBq1Bv+tL7bXd0uGsv1w/44x0P1jK/Ve5qG33lt2q/DXHFDYhyErCMiBtWJsRQqmphVnw==";

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
    expect(managedKeyName("alice@laptop", ED25519)).toBe("alice-laptop-dfa9a93b");
    expect(managedKeyName("", RSA)).toBe("key-0d15360f");
  });
});

describe("isValidKeyBlob", () => {
  it("accepts real public keys", () => {
    expect(isValidKeyBlob("ssh-ed25519", ED25519)).toBe(true);
    expect(isValidKeyBlob("ssh-rsa", RSA)).toBe(true);
    expect(isValidKeyBlob("ecdsa-sha2-nistp256", ECDSA)).toBe(true);
  });

  it.each([
    ["an empty value", ""],
    ["characters outside base64", "not*base64"],
    ["an invalid length", "A"],
    ["padding with an invalid length", "A="],
    ["non-canonical padding bits", `${RSA.slice(0, -3)}x==`],
    ["data shorter than the type length", "AAA="],
    ["a type length beyond the data", "AAAAZA=="],
    [
      "a type that differs from the declared type",
      ED25519.replace("C3NzaC1lZDI1NTE5", "B3NzaC1yc2EAAAAD"),
    ],
  ])("rejects %s", (_label, blob) => {
    expect(isValidKeyBlob("ssh-ed25519", blob)).toBe(false);
  });
});

describe("parseAuthorizedKeys", () => {
  it("parses keys and ignores blank lines and comments", () => {
    const content = [
      "# team keys",
      "",
      `ssh-ed25519 ${ED25519} alice@laptop`,
      `  ssh-rsa ${RSA}  `,
      `ecdsa-sha2-nistp256 ${ECDSA} bob  work laptop\r`,
    ].join("\n");

    expect(parseAuthorizedKeys(content)).toEqual([
      { name: "alice-laptop-dfa9a93b", key: `ssh-ed25519 ${ED25519} alice@laptop`, line: 3 },
      { name: "key-0d15360f", key: `ssh-rsa ${RSA}`, line: 4 },
      {
        name: expect.stringMatching(/^bob-work-laptop-[0-9a-f]{8}$/),
        key: `ecdsa-sha2-nistp256 ${ECDSA} bob work laptop`,
        line: 5,
      },
    ]);
  });

  it("returns no keys for an empty file", () => {
    expect(parseAuthorizedKeys("\n# nothing\n")).toEqual([]);
  });

  it.each([
    ["an unknown key type", `rsa ${RSA}`, "unknown key type"],
    ["a missing blob", "ssh-ed25519", "missing or invalid base64 key data"],
    ["an invalid blob", "ssh-ed25519 not*base64", "missing or invalid base64 key data"],
    ["a blob with an invalid length", "ssh-ed25519 A", "missing or invalid base64 key data"],
    ["a blob of another key type", `ssh-rsa ${ED25519}`, "missing or invalid base64 key data"],
    ["an options prefix", `no-pty ssh-ed25519 ${ED25519}`, "unknown key type"],
  ])("rejects %s with the line number", (_label, line, problem) => {
    expect(() => parseAuthorizedKeys(`# header\n${line}`)).toThrow(
      `Line 2: ${problem}, expected "<type> <base64> [comment]"`,
    );
  });

  it("does not repeat the content of a malformed line", () => {
    expect(() => parseAuthorizedKeys("DB_PASSWORD=secret-value")).toThrow(
      expect.objectContaining({ message: expect.not.stringContaining("secret") }),
    );
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
