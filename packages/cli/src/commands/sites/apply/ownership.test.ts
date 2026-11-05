import { describe, expect, it } from "vitest";

import {
  canonicalCommand,
  commandUsesPath,
  daemonOwnership,
  isPathInside,
  normalizePath,
  quoteWord,
  resolvePath,
  scheduledJobOwnership,
  siteOfPath,
  sitesOfCommand,
  splitCommand,
} from "./ownership.ts";

const sites = [
  { id: 1, roots: ["/home/forge/a.com"] },
  { id: 2, roots: ["/home/forge/a.com-staging"] },
  { id: 3, roots: ["/home/forge/a.com.old"] },
  { id: 4, roots: ["/home/forge/b.com", "/home/forge/b.com/current"] },
  { id: 5, roots: ["/home/forge/a.com/admin"] },
];

describe("normalizePath", () => {
  it("drops trailing slashes and repeated slashes", () => {
    expect(normalizePath("/home/forge/a.com/")).toBe("/home/forge/a.com");
    expect(normalizePath("/home//forge///a.com//")).toBe("/home/forge/a.com");
    expect(normalizePath("/home/forge/a.com/./current/../")).toBe("/home/forge/a.com");
    expect(normalizePath("/")).toBe("/");
  });
});

describe("isPathInside", () => {
  it("accepts the root and its children", () => {
    expect(isPathInside("/home/forge/a.com", "/home/forge/a.com")).toBe(true);
    expect(isPathInside("/home/forge/a.com/", "/home/forge/a.com")).toBe(true);
    expect(isPathInside("/home/forge/a.com", "/home/forge/a.com/")).toBe(true);
    expect(isPathInside("/home/forge/a.com/current/", "/home/forge/a.com")).toBe(true);
  });

  it("rejects sibling sites with a shared prefix", () => {
    expect(isPathInside("/home/forge/a.com-staging", "/home/forge/a.com")).toBe(false);
    expect(isPathInside("/home/forge/a.com-staging/", "/home/forge/a.com/")).toBe(false);
    expect(isPathInside("/home/forge/a.com.old", "/home/forge/a.com")).toBe(false);
    expect(isPathInside("/home/forge", "/home/forge/a.com")).toBe(false);
  });

  it("treats / as the parent of every absolute path", () => {
    expect(isPathInside("/home", "/")).toBe(true);
  });
});

describe("resolvePath", () => {
  it("joins a relative path and keeps an absolute one", () => {
    expect(resolvePath("/home/forge/a.com", "current/")).toBe("/home/forge/a.com/current");
    expect(resolvePath("/home/forge/a.com", "/srv/app/")).toBe("/srv/app");
  });
});

describe("commandUsesPath", () => {
  it("finds the root as a whole path", () => {
    expect(commandUsesPath("php /home/forge/a.com/artisan schedule:run", "/home/forge/a.com")).toBe(
      true,
    );
    expect(commandUsesPath("cd /home/forge/a.com && php artisan x", "/home/forge/a.com/")).toBe(
      true,
    );
    expect(commandUsesPath("rsync '/home/forge/a.com' /backup", "/home/forge/a.com")).toBe(true);
    expect(commandUsesPath("tool --path=/home/forge/a.com/storage", "/home/forge/a.com")).toBe(
      true,
    );
    expect(commandUsesPath("/home/forge/a.com/bin/run", "/home/forge/a.com")).toBe(true);
  });

  it("ignores sibling sites and globs", () => {
    expect(
      commandUsesPath("php /home/forge/a.com-staging/artisan schedule:run", "/home/forge/a.com"),
    ).toBe(false);
    expect(commandUsesPath("php /home/forge/a.com.old/artisan x", "/home/forge/a.com")).toBe(false);
    expect(commandUsesPath("restic backup /home/forge/*", "/home/forge/a.com")).toBe(false);
    expect(commandUsesPath("ls /srv/home/forge/a.com", "/home/forge/a.com")).toBe(false);
    expect(commandUsesPath("anything", "/")).toBe(false);
  });
});

describe("splitCommand", () => {
  it("splits on spaces and removes quotes", () => {
    expect(splitCommand(`php  artisan queue:work 'database' --queue="default"`)).toEqual([
      "php",
      "artisan",
      "queue:work",
      "database",
      "--queue=default",
    ]);
  });

  it("keeps quoted spaces and escapes", () => {
    expect(splitCommand(`echo "a b" 'c "d"' e\\ f "g\\"h" "i\\j" ''`)).toEqual([
      "echo",
      "a b",
      'c "d"',
      "e f",
      'g"h',
      "i\\j",
      "",
    ]);
  });
});

describe("quoteWord", () => {
  it("quotes only when needed", () => {
    expect(quoteWord("--queue=default")).toBe("--queue=default");
    expect(quoteWord("a b")).toBe("'a b'");
    expect(quoteWord("it's")).toBe(`'it'\\''s'`);
    expect(quoteWord("")).toBe("''");
  });
});

describe("canonicalCommand", () => {
  it("gives one form for quoting, spaces and a relative artisan", () => {
    const real =
      "php8.3 /home/forge/a.com/artisan queue:work 'database' --sleep=10 --daemon --timeout=120 --queue='default'";
    const declared =
      "php8.3  artisan queue:work database --sleep=10 --daemon --timeout=120 --queue=default";
    expect(canonicalCommand(real, "/home/forge/a.com/")).toBe(
      canonicalCommand(declared, "/home/forge/a.com"),
    );
    expect(canonicalCommand("php ./artisan schedule:run", "/home/forge/a.com")).toBe(
      "php /home/forge/a.com/artisan schedule:run",
    );
  });

  it("keeps artisan relative without a directory", () => {
    expect(canonicalCommand("php artisan x", null)).toBe("php artisan x");
  });
});

describe("siteOfPath", () => {
  it("picks the most specific root", () => {
    expect(siteOfPath("/home/forge/a.com/", sites)).toBe(1);
    expect(siteOfPath("/home/forge/a.com/admin/", sites)).toBe(5);
    expect(siteOfPath("/home/forge/a.com-staging", sites)).toBe(2);
    expect(siteOfPath("/home/forge/b.com/current/", sites)).toBe(4);
    expect(siteOfPath("/home/forge", sites)).toBeNull();
  });
});

describe("sitesOfCommand", () => {
  it("lists every site whose root the command uses", () => {
    expect(sitesOfCommand("cp /home/forge/a.com/x /home/forge/b.com/y", sites)).toEqual([1, 4]);
    expect(sitesOfCommand("php /home/forge/a.com-staging/artisan x", sites)).toEqual([2]);
  });
});

describe("daemonOwnership", () => {
  it("uses the directory when there is one", () => {
    const command = "php artisan queue:work";
    expect(daemonOwnership({ directory: "/home/forge/a.com/", command }, 1, sites, false)).toBe(
      "site",
    );
    expect(daemonOwnership({ directory: "/home/forge/a.com", command }, 1, sites, false)).toBe(
      "site",
    );
    expect(
      daemonOwnership({ directory: "/home/forge/a.com-staging/", command }, 1, sites, true),
    ).toBe("other");
    expect(daemonOwnership({ directory: "/home/forge/a.com.old", command }, 1, sites, true)).toBe(
      "other",
    );
    expect(daemonOwnership({ directory: "/home/forge/a.com/admin", command }, 1, sites, true)).toBe(
      "other",
    );
    expect(daemonOwnership({ directory: "/etc", command }, 1, sites, true)).toBe("other");
  });

  it("needs the site path and the Forge association without a directory", () => {
    const command = "php8.3 /home/forge/a.com/artisan queue:work";
    expect(daemonOwnership({ directory: null, command }, 1, sites, true)).toBe("site");
    expect(daemonOwnership({ directory: null, command }, 1, sites, false)).toBe("ambiguous");
    expect(daemonOwnership({ directory: " ", command }, 1, sites, false)).toBe("ambiguous");
    expect(
      daemonOwnership(
        { directory: null, command: "sync /home/forge/a.com /home/forge/b.com" },
        1,
        sites,
        true,
      ),
    ).toBe("ambiguous");
    expect(
      daemonOwnership({ directory: null, command: "litestream replicate" }, 1, sites, true),
    ).toBe("other");
    expect(
      daemonOwnership(
        { directory: null, command: "php /home/forge/a.com-staging/artisan x" },
        1,
        sites,
        true,
      ),
    ).toBe("other");
  });
});

describe("scheduledJobOwnership", () => {
  it("trusts the site route of Forge", () => {
    expect(scheduledJobOwnership({ command: "php artisan x" }, 1, sites, true)).toBe("site");
  });

  it("needs the site path, and only it, for a job of the server", () => {
    expect(
      scheduledJobOwnership(
        { command: "php /home/forge/a.com/artisan schedule:run" },
        1,
        sites,
        false,
      ),
    ).toBe("site");
    expect(
      scheduledJobOwnership(
        { command: "php /home/forge/a.com-staging/artisan schedule:run" },
        1,
        sites,
        false,
      ),
    ).toBe("other");
    expect(
      scheduledJobOwnership({ command: "/usr/local/bin/composer self-update" }, 1, sites, false),
    ).toBe("other");
    expect(scheduledJobOwnership({ command: "restic backup /home/forge/*" }, 1, sites, false)).toBe(
      "other",
    );
    expect(
      scheduledJobOwnership(
        { command: "cp -r /home/forge/a.com/storage /home/forge/b.com/" },
        1,
        sites,
        false,
      ),
    ).toBe("ambiguous");
  });
});
