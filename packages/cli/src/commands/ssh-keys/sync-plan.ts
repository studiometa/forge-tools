/**
 * Pure logic for `forge ssh-keys sync`: parse an authorized_keys file, give each key
 * a stable managed name, and compare the file with the keys on a server.
 *
 * The Forge API does not return public keys, so keys are matched by name. The name
 * ends with a fingerprint of the key, so a changed key gets a new name.
 */

import { createHash } from "node:crypto";

import { ValidationError } from "../../errors.ts";

/** The Forge API documents no name limit: keep names short enough to read in a list. */
const MAX_SLUG_LENGTH = 40;

const KEY_TYPE = /^(ssh-|ecdsa-sha2-|sk-)[a-z0-9@.-]+$/;
const BASE64 = /^[A-Za-z0-9+/]+={0,2}$/;

/**
 * Check the base64 key data of a public key, as OpenSSH does: it must be canonical
 * base64, and the decoded key must start with its own type as a length-prefixed string.
 */
export function isValidKeyBlob(type: string, blob: string): boolean {
  if (!BASE64.test(blob) || blob.length % 4 !== 0) {
    return false;
  }
  const data = Buffer.from(blob, "base64");
  if (data.toString("base64") !== blob || data.length < 4) {
    return false;
  }
  const typeLength = data.readUInt32BE(0);
  return 4 + typeLength <= data.length && data.toString("latin1", 4, 4 + typeLength) === type;
}

/** A public key from the file, with the name it gets on Forge. */
export interface FileKey {
  name: string;
  /** Public key as sent to Forge: "<type> <base64> [comment]". */
  key: string;
  /** Line number in the file (1-based). */
  line: number;
}

/** A key that exists on a server. */
export interface ServerKey {
  id: number;
  name: string;
  user: string;
}

export interface SyncPlan {
  /** File keys that are not on the server. */
  add: FileKey[];
  /** Keys of the user on the server that are not in the file. */
  remove: ServerKey[];
  /** File keys that are already on the server. */
  unchanged: FileKey[];
}

/**
 * Convert a key comment to a name prefix: lowercase, `[a-z0-9-]` only, "key" when empty.
 */
export function slugify(comment: string): string {
  const slug = comment
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .slice(0, MAX_SLUG_LENGTH)
    .replaceAll(/^-+|-+$/g, "");
  return slug || "key";
}

/**
 * Managed name of a key: "<slug(comment)>-<first 8 hex chars of the SHA-256 of the key blob>".
 * The blob is the decoded base64 field, as in an OpenSSH fingerprint.
 */
export function managedKeyName(comment: string, blob: string): string {
  const hash = createHash("sha256").update(Buffer.from(blob, "base64")).digest("hex");
  return `${slugify(comment)}-${hash.slice(0, 8)}`;
}

/**
 * Parse an authorized_keys file: one "<type> <base64> [comment]" per line.
 * Blank lines and "#" comments are ignored.
 *
 * @throws ValidationError for a malformed or duplicate key, with its line number.
 */
export function parseAuthorizedKeys(content: string): FileKey[] {
  const keys: FileKey[] = [];
  const seen = new Map<string, number>();

  for (const [index, raw] of content.split(/\r?\n/).entries()) {
    const line = index + 1;
    const text = raw.trim();
    if (!text || text.startsWith("#")) {
      continue;
    }

    // The error never repeats the line: a wrong --file (a .env, a secret) must not leak to logs.
    const [type, blob = "", ...rest] = text.split(/\s+/);
    const problem = !KEY_TYPE.test(type)
      ? "unknown key type"
      : !isValidKeyBlob(type, blob)
        ? "missing or invalid base64 key data"
        : undefined;
    if (problem) {
      throw new ValidationError(
        `Line ${line}: ${problem}, expected "<type> <base64> [comment]"`,
        "file",
        ["Use one public key per line, as in ~/.ssh/authorized_keys (no options prefix)"],
      );
    }

    const first = seen.get(blob);
    if (first !== undefined) {
      throw new ValidationError(`Line ${line}: duplicate of the key on line ${first}`, "file");
    }
    seen.set(blob, line);

    const comment = rest.join(" ");
    keys.push({
      name: managedKeyName(comment, blob),
      key: [type, blob, comment].filter(Boolean).join(" "),
      line,
    });
  }

  return keys;
}

/**
 * Compare the file keys with the keys on a server, for one user.
 * Keys of other users are ignored.
 */
export function planSync(fileKeys: FileKey[], serverKeys: ServerKey[], user: string): SyncPlan {
  const userKeys = serverKeys.filter((k) => k.user === user);
  const serverNames = new Set(userKeys.map((k) => k.name));
  const fileNames = new Set(fileKeys.map((k) => k.name));

  return {
    add: fileKeys.filter((k) => !serverNames.has(k.name)),
    remove: userKeys.filter((k) => !fileNames.has(k.name)),
    unchanged: fileKeys.filter((k) => serverNames.has(k.name)),
  };
}
