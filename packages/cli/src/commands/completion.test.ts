import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { handleCompletionCommand, showCompletionHelp } from "./completion.ts";

vi.mock("node:fs", () => ({
  mkdirSync: vi.fn(),
  writeFileSync: vi.fn(),
}));

vi.mock("node:os", () => ({
  homedir: vi.fn().mockReturnValue("/home/testuser"),
}));

describe("showCompletionHelp", () => {
  it("should print help text", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    showCompletionHelp();
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("forge-cli completion"));
    spy.mockRestore();
  });

  it("should mention supported shells", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    showCompletionHelp();
    const output = spy.mock.calls.map((c) => c.join("")).join("");
    expect(output).toContain("bash");
    expect(output).toContain("zsh");
    expect(output).toContain("fish");
    spy.mockRestore();
  });
});

describe("handleCompletionCommand", () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let processExitSpy: ReturnType<typeof vi.spyOn>;
  let stdoutWriteSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    stdoutWriteSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("--print flag", () => {
    it("should print bash script to stdout without installing", () => {
      handleCompletionCommand("bash", { print: true });
      expect(stdoutWriteSpy).toHaveBeenCalledWith(expect.stringContaining("forge-cli"));
      expect(stdoutWriteSpy).toHaveBeenCalledWith(
        expect.stringContaining("_forge_cli_completions"),
      );
    });

    it("should print zsh script to stdout without installing", () => {
      handleCompletionCommand("zsh", { print: true });
      expect(stdoutWriteSpy).toHaveBeenCalledWith(expect.stringContaining("#compdef forge-cli"));
    });

    it("should print fish script to stdout without installing", () => {
      handleCompletionCommand("fish", { print: true });
      expect(stdoutWriteSpy).toHaveBeenCalledWith(
        expect.stringContaining("# Completions for forge-cli"),
      );
    });

    it("should not write any file when --print is used", async () => {
      const { writeFileSync } = await import("node:fs");
      handleCompletionCommand("bash", { print: true });
      expect(writeFileSync).not.toHaveBeenCalled();
    });
  });

  describe("installation without --print", () => {
    it("should install bash completion to correct path", async () => {
      const { mkdirSync, writeFileSync } = await import("node:fs");
      handleCompletionCommand("bash", {});
      expect(mkdirSync).toHaveBeenCalledWith(
        expect.stringContaining(".local/share/bash-completion/completions"),
        { recursive: true },
      );
      expect(writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("forge-cli"),
        expect.any(String),
        "utf8",
      );
    });

    it("should install zsh completion to correct path", async () => {
      const { mkdirSync, writeFileSync } = await import("node:fs");
      handleCompletionCommand("zsh", {});
      expect(mkdirSync).toHaveBeenCalledWith(expect.stringContaining(".zfunc"), {
        recursive: true,
      });
      expect(writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("_forge-cli"),
        expect.any(String),
        "utf8",
      );
    });

    it("should install fish completion to correct path", async () => {
      const { mkdirSync, writeFileSync } = await import("node:fs");
      handleCompletionCommand("fish", {});
      expect(mkdirSync).toHaveBeenCalledWith(expect.stringContaining("fish/completions"), {
        recursive: true,
      });
      expect(writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("forge-cli.fish"),
        expect.any(String),
        "utf8",
      );
    });

    it("should log success message after installing", async () => {
      handleCompletionCommand("bash", {});
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("Installed bash"));
    });

    it("should log next steps after installing", async () => {
      handleCompletionCommand("bash", {});
      const output = consoleLogSpy.mock.calls.map((c) => c.join("")).join("");
      expect(output).toContain("Next steps");
    });

    it("should show zsh fpath instructions", async () => {
      handleCompletionCommand("zsh", {});
      const output = consoleLogSpy.mock.calls.map((c) => c.join("")).join("");
      expect(output).toContain("fpath");
    });

    it("should handle write errors gracefully", async () => {
      const { writeFileSync } = await import("node:fs");
      vi.mocked(writeFileSync).mockImplementationOnce(() => {
        throw new Error("Permission denied");
      });
      handleCompletionCommand("bash", {});
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Failed to install completion"),
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe("unknown shell", () => {
    it("should show error for unknown shell", () => {
      handleCompletionCommand("powershell", {});
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Unknown shell: powershell"),
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it("should suggest supported shells on error", () => {
      handleCompletionCommand("csh", {});
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining("bash, zsh, fish"));
    });
  });

  describe("script content - bash", () => {
    it("should contain all main commands", () => {
      handleCompletionCommand("bash", { print: true });
      const script = stdoutWriteSpy.mock.calls[0]![0] as string;
      expect(script).toContain("servers");
      expect(script).toContain("sites");
      expect(script).toContain("deployments");
      expect(script).toContain("databases");
      expect(script).toContain("database-users");
      expect(script).toContain("daemons");
      expect(script).toContain("env");
      expect(script).toContain("nginx");
      expect(script).toContain("certificates");
      expect(script).toContain("firewall-rules");
      expect(script).toContain("ssh-keys");
      expect(script).toContain("backups");
      expect(script).toContain("commands");
      expect(script).toContain("scheduled-jobs");
      expect(script).toContain("user");
      expect(script).toContain("monitors");
      expect(script).toContain("nginx-templates");
      expect(script).toContain("security-rules");
      expect(script).toContain("redirect-rules");
      expect(script).toContain("recipes");
      expect(script).toContain("completion");
    });

    it("should contain aliases", () => {
      handleCompletionCommand("bash", { print: true });
      const script = stdoutWriteSpy.mock.calls[0]![0] as string;
      expect(script).toContain(" s ");
      expect(script).toContain(" d ");
      expect(script).toContain(" db ");
      expect(script).toContain(" certs ");
      expect(script).toContain(" fw ");
    });

    it("should contain subcommands", () => {
      handleCompletionCommand("bash", { print: true });
      const script = stdoutWriteSpy.mock.calls[0]![0] as string;
      expect(script).toContain("list");
      expect(script).toContain("ls");
      expect(script).toContain("get");
      expect(script).toContain("create");
      expect(script).toContain("delete");
      expect(script).toContain("deploy");
      expect(script).toContain("reboot");
      expect(script).toContain("restart");
      expect(script).toContain("activate");
      expect(script).toContain("update");
      expect(script).toContain("run");
    });

    it("should contain all flags", () => {
      handleCompletionCommand("bash", { print: true });
      const script = stdoutWriteSpy.mock.calls[0]![0] as string;
      expect(script).toContain("--token");
      expect(script).toContain("--server");
      expect(script).toContain("--site");
      expect(script).toContain("--format");
      expect(script).toContain("--no-color");
      expect(script).toContain("--name");
      expect(script).toContain("--command");
      expect(script).toContain("--content");
      expect(script).toContain("--from");
      expect(script).toContain("--to");
      expect(script).toContain("--provider");
      expect(script).toContain("--frequency");
      expect(script).toContain("--type");
      expect(script).toContain("--operator");
      expect(script).toContain("--threshold");
      expect(script).toContain("--minutes");
    });

    it("should contain format enum values", () => {
      handleCompletionCommand("bash", { print: true });
      const script = stdoutWriteSpy.mock.calls[0]![0] as string;
      expect(script).toContain("json");
      expect(script).toContain("human");
      expect(script).toContain("table");
    });
  });

  describe("script content - zsh", () => {
    it("should contain all main commands", () => {
      handleCompletionCommand("zsh", { print: true });
      const script = stdoutWriteSpy.mock.calls[0]![0] as string;
      expect(script).toContain("servers");
      expect(script).toContain("sites");
      expect(script).toContain("deployments");
      expect(script).toContain("databases");
      expect(script).toContain("database-users");
      expect(script).toContain("daemons");
      expect(script).toContain("env");
      expect(script).toContain("nginx");
      expect(script).toContain("certificates");
      expect(script).toContain("firewall-rules");
      expect(script).toContain("ssh-keys");
      expect(script).toContain("backups");
      expect(script).toContain("commands");
      expect(script).toContain("scheduled-jobs");
      expect(script).toContain("user");
      expect(script).toContain("monitors");
      expect(script).toContain("nginx-templates");
      expect(script).toContain("security-rules");
      expect(script).toContain("redirect-rules");
      expect(script).toContain("recipes");
      expect(script).toContain("completion");
    });

    it("should contain flags", () => {
      handleCompletionCommand("zsh", { print: true });
      const script = stdoutWriteSpy.mock.calls[0]![0] as string;
      expect(script).toContain("--token");
      expect(script).toContain("--server");
      expect(script).toContain("--site");
      expect(script).toContain("--format");
      expect(script).toContain("--no-color");
    });

    it("should contain format enum values", () => {
      handleCompletionCommand("zsh", { print: true });
      const script = stdoutWriteSpy.mock.calls[0]![0] as string;
      expect(script).toContain("json");
      expect(script).toContain("human");
      expect(script).toContain("table");
    });
  });

  describe("script content - fish", () => {
    it("should contain all main commands", () => {
      handleCompletionCommand("fish", { print: true });
      const script = stdoutWriteSpy.mock.calls[0]![0] as string;
      expect(script).toContain("servers");
      expect(script).toContain("sites");
      expect(script).toContain("deployments");
      expect(script).toContain("databases");
      expect(script).toContain("database-users");
      expect(script).toContain("daemons");
      expect(script).toContain("env");
      expect(script).toContain("nginx");
      expect(script).toContain("certificates");
      expect(script).toContain("firewall-rules");
      expect(script).toContain("ssh-keys");
      expect(script).toContain("backups");
      expect(script).toContain("commands");
      expect(script).toContain("scheduled-jobs");
      expect(script).toContain("user");
      expect(script).toContain("monitors");
      expect(script).toContain("nginx-templates");
      expect(script).toContain("security-rules");
      expect(script).toContain("redirect-rules");
      expect(script).toContain("recipes");
      expect(script).toContain("completion");
    });

    it("should contain subcommands", () => {
      handleCompletionCommand("fish", { print: true });
      const script = stdoutWriteSpy.mock.calls[0]![0] as string;
      expect(script).toContain("list");
      expect(script).toContain("ls");
      expect(script).toContain("get");
      expect(script).toContain("create");
      expect(script).toContain("delete");
      expect(script).toContain("deploy");
      expect(script).toContain("reboot");
      expect(script).toContain("restart");
      expect(script).toContain("activate");
      expect(script).toContain("run");
    });

    it("should contain flags", () => {
      handleCompletionCommand("fish", { print: true });
      const script = stdoutWriteSpy.mock.calls[0]![0] as string;
      // fish uses -l flag-name syntax for long options
      expect(script).toContain("-l token");
      expect(script).toContain("-l server");
      expect(script).toContain("-l site");
      expect(script).toContain("-l format");
      expect(script).toContain("-l no-color");
      expect(script).toContain("-l name");
      expect(script).toContain("-l command");
    });

    it("should contain format enum values", () => {
      handleCompletionCommand("fish", { print: true });
      const script = stdoutWriteSpy.mock.calls[0]![0] as string;
      expect(script).toContain("json");
      expect(script).toContain("human");
      expect(script).toContain("table");
    });
  });
});
