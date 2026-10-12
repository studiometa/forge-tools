import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import type { ServerAttributes, SshKeyAttributes } from "@studiometa/forge-api";

import { createTestContext } from "../../context.ts";
import { setColorEnabled } from "../../utils/colors.ts";
import { parseAuthorizedKeys } from "./sync-plan.ts";
import { sshKeysSync } from "./sync.ts";

vi.mock("node:fs", () => ({
  readFileSync: vi.fn(),
}));

const ED25519 = "AAAAC3NzaC1lZDI1NTE5AAAAIA";
const RSA = "AAAAB3NzaC1yc2EAAAADAQAB";
const FILE = `# team\nssh-ed25519 ${ED25519} alice\nssh-rsa ${RSA} bob\n`;
const [ALICE, BOB] = parseAuthorizedKeys(FILE).map((k) => k.name);

function listDocument<T>(type: string, items: Array<{ id: number } & T>) {
  return {
    data: items.map((attributes) => ({ id: String(attributes.id), type, attributes })),
    links: { next: null, prev: null },
    meta: { per_page: 30, next_cursor: null, prev_cursor: null },
  };
}

function server(id: number, name: string): { id: number } & ServerAttributes {
  return {
    id,
    credential_id: null,
    name,
    type: "app",
    ubuntu_version: "24.04",
    ssh_port: 22,
    provider: "ocean2",
    identifier: null,
    size: "s-1vcpu-1gb",
    region: "fra1",
    php_version: "php84",
    php_cli_version: "php84",
    opcache_status: null,
    database_type: null,
    db_status: null,
    redis_status: null,
    ip_address: "1.2.3.4",
    private_ip_address: null,
    revoked: false,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    connection_status: "successful",
    timezone: "UTC",
    local_public_key: null,
    is_ready: true,
  };
}

function key(id: number, name: string, user = "forge"): { id: number } & SshKeyAttributes {
  return {
    id,
    name,
    user,
    status: "installed",
    created_by: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  };
}

/**
 * A fake HTTP client: servers 1 and 2 exist, keys come from `keys` (an Error value fails the list).
 */
function createClient(keys: Record<number, Array<ReturnType<typeof key>> | Error>) {
  const servers = [server(1, "web-1"), server(2, "web-2")];
  return {
    get: vi.fn(async (url: string) => {
      const match = /\/servers\/(\d+)\/ssh-keys$/.exec(url);
      if (!match) return listDocument("servers", servers);
      const result = keys[Number(match[1])] ?? [];
      if (result instanceof Error) throw result;
      return listDocument("ssh-keys", result);
    }),
    post: vi.fn(async () => {}),
    delete: vi.fn(async () => {}),
  };
}

async function run(
  options: Record<string, string | boolean | string[]>,
  client = createClient({}),
) {
  const ctx = createTestContext({
    token: "test",
    mockClient: client as never,
    options: { format: "json", ...options },
  });
  await sshKeysSync(ctx).catch(() => {});
  return client;
}

function jsonOutput(): unknown {
  const calls = vi.mocked(console.log).mock.calls.map(([text]) => String(text));
  const doc = calls.find((text) => text.includes('"servers"'));
  return doc ? JSON.parse(doc) : undefined;
}

function textOutput(): string {
  return vi
    .mocked(console.log)
    .mock.calls.map(([text]) => String(text))
    .join("\n");
}

describe("sshKeysSync", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    setColorEnabled(false);
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { readFileSync } = await import("node:fs");
    vi.mocked(readFileSync).mockReturnValue(FILE);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("validation", () => {
    it("requires --file", async () => {
      await run({ server: "1" });
      expect(processExitSpy).toHaveBeenCalledWith(3);
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining("file is required"));
    });

    it("requires a target", async () => {
      await run({ file: "keys" });
      expect(processExitSpy).toHaveBeenCalledWith(3);
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining("A target is required"));
    });

    it("rejects --server with --all-servers", async () => {
      await run({ file: "keys", server: "1", "all-servers": true });
      expect(processExitSpy).toHaveBeenCalledWith(3);
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining("not both"));
    });

    it("rejects a malformed file with the line number", async () => {
      const { readFileSync } = await import("node:fs");
      vi.mocked(readFileSync).mockReturnValue("# keys\nnot a key\n");
      const client = await run({ file: "keys", server: "1" });
      expect(processExitSpy).toHaveBeenCalledWith(3);
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining("Line 2: expected"));
      expect(client.get).not.toHaveBeenCalled();
    });

    it("rejects a file without keys", async () => {
      const { readFileSync } = await import("node:fs");
      vi.mocked(readFileSync).mockReturnValue("# nothing yet\n");
      await run({ file: "keys", server: "1", prune: true });
      expect(processExitSpy).toHaveBeenCalledWith(3);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("No SSH keys found in keys"),
      );
    });

    it("reads the keys from stdin with --file -", async () => {
      const { readFileSync } = await import("node:fs");
      await run({ file: "-", server: "1", "dry-run": true });
      expect(readFileSync).toHaveBeenCalledWith(0, "utf8");
    });
  });

  describe("--dry-run", () => {
    it("writes nothing and exits zero", async () => {
      const client = await run(
        { file: "keys", server: "1", "dry-run": true, prune: true },
        createClient({ 1: [key(11, "old")] }),
      );
      expect(client.post).not.toHaveBeenCalled();
      expect(client.delete).not.toHaveBeenCalled();
      expect(processExitSpy).not.toHaveBeenCalled();
    });

    it("reports adds, prune removals and unchanged keys as JSON", async () => {
      const client = createClient({ 1: [key(10, ALICE), key(11, "old"), key(12, "x", "root")] });
      await run({ file: "keys", server: "1", "dry-run": true, prune: true }, client);

      expect(client.post).not.toHaveBeenCalled();
      expect(client.delete).not.toHaveBeenCalled();
      expect(jsonOutput()).toEqual({
        servers: [
          { id: 1, name: "web-1", added: [BOB], removed: ["old"], unchanged: [ALICE], errors: [] },
        ],
      });
    });

    it("does not plan removals without --prune", async () => {
      const client = createClient({ 1: [key(11, "old")] });
      await run({ file: "keys", server: "1", "dry-run": true }, client);

      expect(jsonOutput()).toEqual({
        servers: [
          { id: 1, name: "web-1", added: [ALICE, BOB], removed: [], unchanged: [], errors: [] },
        ],
      });
    });

    it("prints a human plan with + / - / = lines", async () => {
      const client = createClient({ 1: [key(10, ALICE), key(11, "old")] });
      await run(
        { file: "keys", server: "1", "dry-run": true, prune: true, format: "human" },
        client,
      );

      const text = textOutput();
      expect(text).toContain("web-1 (1)");
      expect(text).toContain(`  + ${BOB}`);
      expect(text).toContain("  - old");
      expect(text).toContain(`  = ${ALICE}`);
      expect(text).toContain("Dry run: no changes made.");
      expect(client.post).not.toHaveBeenCalled();
    });

    it("tells how many keys are kept without --prune", async () => {
      const client = createClient({ 1: [key(11, "old")] });
      await run({ file: "keys", server: "1", "dry-run": true, format: "human" }, client);

      const text = textOutput();
      expect(text).not.toContain("  - old");
      expect(text).toContain('1 key(s) of user "forge" not in the file are kept');
    });
  });

  describe("apply", () => {
    it("adds missing keys with the user and keeps extra keys without --prune", async () => {
      const client = createClient({ 1: [key(10, ALICE), key(11, "old")] });
      await run({ file: "keys", server: "1" }, client);

      expect(client.post).toHaveBeenCalledTimes(1);
      expect(client.post).toHaveBeenCalledWith("/orgs/test-org/servers/1/ssh-keys", {
        name: BOB,
        key: `ssh-rsa ${RSA} bob`,
        user: "forge",
      });
      expect(client.delete).not.toHaveBeenCalled();
      expect(processExitSpy).not.toHaveBeenCalled();
      expect(jsonOutput()).toEqual({
        servers: [
          { id: 1, name: "web-1", added: [BOB], removed: [], unchanged: [ALICE], errors: [] },
        ],
      });
    });

    it("removes extra keys of the user with --prune", async () => {
      const client = createClient({
        1: [key(10, ALICE), key(11, BOB), key(12, "old"), key(13, "other", "root")],
      });
      await run({ file: "keys", server: "1", prune: true }, client);

      expect(client.post).not.toHaveBeenCalled();
      expect(client.delete).toHaveBeenCalledTimes(1);
      expect(client.delete).toHaveBeenCalledWith("/orgs/test-org/servers/1/ssh-keys/12");
    });

    it("only considers keys of --user", async () => {
      const client = createClient({ 1: [key(10, ALICE, "deploy"), key(11, ALICE, "forge")] });
      await run({ file: "keys", server: "1", user: "deploy" }, client);

      expect(client.post).toHaveBeenCalledWith("/orgs/test-org/servers/1/ssh-keys", {
        name: BOB,
        key: `ssh-rsa ${RSA} bob`,
        user: "deploy",
      });
    });

    it("syncs repeated and comma separated servers once each, in order", async () => {
      const client = createClient({});
      await run({ file: "keys", server: ["2,1", "web-2"] }, client);

      const ids = (jsonOutput() as { servers: Array<{ id: number }> }).servers.map((s) => s.id);
      expect(ids).toEqual([2, 1]);
      expect(client.post).toHaveBeenCalledTimes(4);
    });

    it("uses the server id as name when the server is not listed", async () => {
      await run({ file: "keys", server: "99", "dry-run": true });
      expect(jsonOutput()).toMatchObject({ servers: [{ id: 99, name: "99" }] });
    });

    it("syncs every server with --all-servers", async () => {
      const client = createClient({});
      await run({ file: "keys", "all-servers": true }, client);

      expect((jsonOutput() as { servers: unknown[] }).servers).toHaveLength(2);
      expect(client.post).toHaveBeenCalledWith(
        "/orgs/test-org/servers/2/ssh-keys",
        expect.anything(),
      );
    });

    it("prints a human result per server", async () => {
      const client = createClient({ 1: [key(10, ALICE), key(11, "old")] });
      await run({ file: "keys", server: "1", prune: true, format: "human" }, client);

      expect(textOutput()).toContain("✓ web-1 (1): 1 added, 1 removed, 1 unchanged");
    });
  });

  describe("failures", () => {
    it("continues with other servers and exits non-zero", async () => {
      const client = createClient({ 1: new Error("Server unreachable"), 2: [key(11, "old")] });
      client.post.mockImplementation(async (url: string, body: unknown) => {
        if ((body as { name: string }).name === ALICE) throw new Error("Name taken");
        return url as never;
      });
      client.delete.mockImplementation(async () => {
        // oxlint-disable-next-line no-throw-literal
        throw "boom";
      });

      await run({ file: "keys", server: "1,2", prune: true }, client);

      expect(jsonOutput()).toEqual({
        servers: [
          {
            id: 1,
            name: "web-1",
            added: [],
            removed: [],
            unchanged: [],
            errors: ["list keys: Server unreachable"],
          },
          {
            id: 2,
            name: "web-2",
            added: [BOB],
            removed: [],
            unchanged: [],
            errors: [`add ${ALICE}: Name taken`, "remove old: boom"],
          },
        ],
      });
      expect(processExitSpy).toHaveBeenCalledWith(1);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("3 SSH key operation(s) failed"),
      );
    });

    it("prints failures in human format", async () => {
      const client = createClient({ 1: new Error("Server unreachable"), 2: [] });
      client.post.mockRejectedValue(new Error("Name taken"));

      await run({ file: "keys", server: "1,2", format: "human" }, client);

      const text = textOutput();
      expect(text).toContain("  ✗ list keys: Server unreachable");
      expect(text).toContain("✗ web-2 (2): 0 added, 0 removed, 0 unchanged, 2 failed");
      expect(text).toContain(`  add ${ALICE}: Name taken`);
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it("exits non-zero in dry-run when a server cannot be read", async () => {
      const client = createClient({ 1: new Error("Server unreachable") });
      await run({ file: "keys", server: "1", "dry-run": true }, client);
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });
});
