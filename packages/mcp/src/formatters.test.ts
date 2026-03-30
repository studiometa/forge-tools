import { describe, expect, it } from "vitest";

import type {
  BackupConfigAttributes,
  CertificateAttributes,
  CommandAttributes,
  BackgroundProcessAttributes,
  DatabaseAttributes,
  DatabaseUserAttributes,
  DeploymentAttributes,
  FirewallRuleAttributes,
  MonitorAttributes,
  NginxTemplateAttributes,
  RecipeAttributes,
  RedirectRuleAttributes,
  ScheduledJobAttributes,
  SecurityRuleAttributes,
  ServerAttributes,
  SiteAttributes,
  SshKeyAttributes,
  UserAttributes,
} from "@studiometa/forge-api";

import {
  formatBackupConfig,
  formatBackupConfigList,
  formatCertificate,
  formatCommand,
  formatCommandList,
  formatCreated,
  formatDaemon,
  formatDaemonList,
  formatDatabase,
  formatDatabaseList,
  formatDatabaseUser,
  formatDatabaseUserList,
  formatDeleted,
  formatDeployAction,
  formatDeploymentList,
  formatDeploymentOutput,
  formatDeploymentScript,
  formatDeploymentScriptUpdated,
  formatEnv,
  formatFirewallRule,
  formatFirewallRuleList,
  formatMonitor,
  formatMonitorList,
  formatNginxConfig,
  formatNginxTemplate,
  formatNginxTemplateList,
  formatRecipe,
  formatRecipeList,
  formatRedirectRule,
  formatRedirectRuleList,
  formatScheduledJob,
  formatScheduledJobList,
  formatSecurityRule,
  formatSecurityRuleList,
  formatServer,
  formatServerList,
  formatSite,
  formatSiteList,
  formatSshKey,
  formatSshKeyList,
  formatUser,
} from "./formatters.ts";

// ── Servers ──────────────────────────────────────────

describe("formatServerList", () => {
  it("should format a list of servers", () => {
    const servers: (ServerAttributes & { id: number })[] = [
      {
        id: 1,
        name: "web-1",
        provider: "ocean2",
        region: "ams3",
        ip_address: "1.2.3.4",
        is_ready: true,
        credential_id: 1,
        type: "app",
        identifier: "123",
        size: "01",
        ubuntu_version: "22.04",
        db_status: null,
        redis_status: null,
        php_version: "php83",
        php_cli_version: "php83",
        opcache_status: null,
        database_type: "mysql8",
        ssh_port: 22,
        private_ip_address: "10.0.0.1",
        local_public_key: "ssh-rsa ...",
        revoked: false,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
        connection_status: "connected",
        timezone: "UTC",
      },
    ];

    const result = formatServerList(servers);
    expect(result).toContain("1 server(s):");
    expect(result).toContain("web-1");
    expect(result).toContain("ready");
    expect(result).toContain("1.2.3.4");
  });

  it("should format empty server list", () => {
    const result = formatServerList([]);
    expect(result).toBe("No servers found.");
  });

  it("should show provisioning for not-ready servers", () => {
    const servers: (ServerAttributes & { id: number })[] = [
      {
        id: 1,
        name: "new-server",
        provider: "ocean2",
        region: "ams3",
        ip_address: "1.2.3.4",
        is_ready: false,
        credential_id: null,
        type: "app",
        identifier: null,
        size: "01",
        ubuntu_version: null,
        db_status: null,
        redis_status: null,
        php_version: null,
        php_cli_version: null,
        opcache_status: null,
        database_type: null,
        ssh_port: 22,
        private_ip_address: null,
        local_public_key: null,
        revoked: false,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
        connection_status: "connected",
        timezone: "UTC",
      },
    ];
    const result = formatServerList(servers);
    expect(result).toContain("provisioning");
  });
});

describe("formatServer", () => {
  it("should format a single server", () => {
    const server: ServerAttributes & { id: number } = {
      id: 1,
      name: "web-1",
      provider: "ocean2",
      region: "ams3",
      ip_address: "1.2.3.4",
      is_ready: true,
      php_version: "php83",
      ubuntu_version: "22.04",
      created_at: "2024-01-01",
      credential_id: null,
      type: "app",
      identifier: null,
      size: "01",
      php_cli_version: null,
      opcache_status: null,
      database_type: null,
      db_status: null,
      redis_status: null,
      private_ip_address: null,
      local_public_key: null,
      revoked: false,
      updated_at: "2024-01-01",
      connection_status: "connected",
      timezone: "UTC",
      ssh_port: 22,
    };

    const result = formatServer(server);
    expect(result).toContain("Server: web-1 (ID: 1)");
    expect(result).toContain("Provider: ocean2 (ams3)");
    expect(result).toContain("IP: 1.2.3.4");
    expect(result).toContain("PHP: php83");
    expect(result).toContain("Ubuntu: 22.04");
    expect(result).toContain("Status: ready");
    expect(result).toContain("Created: 2024-01-01");
  });

  it("should show provisioning status", () => {
    const server = {
      id: 1,
      name: "web-1",
      is_ready: false,
    } as ServerAttributes & { id: number };
    const result = formatServer(server);
    expect(result).toContain("provisioning");
  });
});

// ── Sites ────────────────────────────────────────────

describe("formatSiteList", () => {
  it("should format a list of sites", () => {
    const sites: (SiteAttributes & { id: number })[] = [
      {
        id: 1,
        name: "example.com",
        app_type: "php",
        status: "installed",
        aliases: [],
        root_directory: "/public",
        web_directory: "/public",
        wildcards: false,
        repository: null,
        quick_deploy: false,
        deployment_status: null,
        deployment_url: "",
        deployment_script: null,
        php_version: "php84",
        url: "",
        https: false,
        isolated: false,
        user: null,
        database: null,
        shared_paths: [],
        uses_envoyer: false,
        zero_downtime_deployments: false,
        maintenance_mode: false,
        healthcheck_url: null,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      },
    ];

    const result = formatSiteList(sites, "123");
    expect(result).toContain("1 site(s) on server 123:");
    expect(result).toContain("example.com");
    expect(result).toContain("php");
    expect(result).toContain("installed");
  });

  it("should format empty site list with server_id", () => {
    const result = formatSiteList([], "123");
    expect(result).toBe("No sites on server 123.");
  });

  it("should format empty site list without server_id", () => {
    const result = formatSiteList([]);
    expect(result).toBe("No sites found.");
  });

  it("should format list without server_id header", () => {
    const sites: (SiteAttributes & { id: number })[] = [
      {
        id: 1,
        name: "example.com",
        app_type: "php",
        status: "installed",
        aliases: [],
        root_directory: "/public",
        web_directory: "/public",
        wildcards: false,
        repository: null,
        quick_deploy: false,
        deployment_status: null,
        deployment_url: "",
        deployment_script: null,
        php_version: "php84",
        url: "",
        https: false,
        isolated: false,
        user: null,
        database: null,
        shared_paths: [],
        uses_envoyer: false,
        zero_downtime_deployments: false,
        maintenance_mode: false,
        healthcheck_url: null,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      },
    ];
    const result = formatSiteList(sites);
    expect(result).toContain("1 site(s):");
    expect(result).not.toContain("on server");
  });
});

describe("formatSite", () => {
  it("should format a single site", () => {
    const site: SiteAttributes & { id: number } = {
      id: 1,
      name: "example.com",
      app_type: "php",
      root_directory: "/public",
      web_directory: "/public",
      wildcards: false,
      aliases: [],
      repository: "git@github.com:user/repo.git",
      quick_deploy: true,
      status: "installed",
      deployment_status: "finished",
      deployment_url: "",
      deployment_script: null,
      php_version: "php84",
      url: "",
      https: false,
      isolated: false,
      user: null,
      database: null,
      shared_paths: [],
      uses_envoyer: false,
      zero_downtime_deployments: false,
      maintenance_mode: false,
      healthcheck_url: null,
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    };

    const result = formatSite(site);
    expect(result).toContain("Site: example.com (ID: 1)");
    expect(result).toContain("Type: php");
    expect(result).toContain("Repository: git@github.com:user/repo.git");
    expect(result).toContain("Quick deploy: enabled");
  });

  it("should show none for null fields", () => {
    const site: SiteAttributes & { id: number } = {
      id: 1,
      name: "example.com",
      app_type: "php",
      root_directory: "/public",
      web_directory: "/public",
      wildcards: false,
      aliases: [],
      repository: null,
      quick_deploy: false,
      status: "installed",
      deployment_status: null,
      deployment_url: "",
      deployment_script: null,
      php_version: "php84",
      url: "",
      https: false,
      isolated: false,
      user: null,
      database: null,
      shared_paths: [],
      uses_envoyer: false,
      zero_downtime_deployments: false,
      maintenance_mode: false,
      healthcheck_url: null,
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    };

    const result = formatSite(site);
    expect(result).toContain("Repository: none");
    expect(result).toContain("Deploy status: none");
    expect(result).toContain("Quick deploy: disabled");
  });
});

// ── Databases ────────────────────────────────────────

describe("formatDatabaseList", () => {
  it("should format a list of databases", () => {
    const databases: (DatabaseAttributes & { id: number })[] = [
      {
        id: 1,
        name: "myapp",
        status: "installed",
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      },
    ];

    const result = formatDatabaseList(databases);
    expect(result).toContain("1 database(s):");
    expect(result).toContain("myapp");
    expect(result).toContain("installed");
  });

  it("should handle empty list", () => {
    expect(formatDatabaseList([])).toBe("No databases found.");
  });
});

describe("formatDatabase", () => {
  it("should format a single database", () => {
    const db: DatabaseAttributes & { id: number } = {
      id: 1,
      name: "myapp",
      status: "installed",
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    };

    const result = formatDatabase(db);
    expect(result).toContain("Database: myapp (ID: 1)");
    expect(result).toContain("Status: installed");
    expect(result).toContain("Created: 2024-01-01");
  });
});

// ── Database Users ────────────────────────────────────

describe("formatDatabaseUserList", () => {
  it("should format a list of database users", () => {
    const users: (DatabaseUserAttributes & { id: number })[] = [
      {
        id: 1,
        name: "forge",
        status: "installed",
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      },
    ];
    const result = formatDatabaseUserList(users);
    expect(result).toContain("forge");
    expect(result).toContain("ID: 1");
  });

  it("should handle empty list", () => {
    expect(formatDatabaseUserList([])).toBe("No database users found.");
  });
});

describe("formatDatabaseUser", () => {
  it("should format a single database user", () => {
    const user: DatabaseUserAttributes & { id: number } = {
      id: 1,
      name: "forge",
      status: "installed",
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    };

    const result = formatDatabaseUser(user);
    expect(result).toContain("Database User: forge (ID: 1)");
    expect(result).toContain("Status: installed");
    expect(result).toContain("Created: 2024-01-01");
  });
});

// ── Deployments ──────────────────────────────────────

describe("formatDeploymentList", () => {
  it("should format a list of deployments", () => {
    const deployments: (DeploymentAttributes & { id: number })[] = [
      {
        id: 1,
        status: "finished",
        commit: { hash: "abc1234def", author: "user", message: "deploy", branch: "main" },
        started_at: "2024-01-01",
        ended_at: "2024-01-01",
        type: "push",
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      },
    ];

    const result = formatDeploymentList(deployments);
    expect(result).toContain("1 deployment(s):");
    expect(result).toContain("finished");
    expect(result).toContain("abc1234"); // first 7 chars
  });

  it("should handle null commit hash", () => {
    const deployments: (DeploymentAttributes & { id: number })[] = [
      {
        id: 1,
        status: "finished",
        commit: { hash: null, author: null, message: null, branch: null },
        started_at: "2024-01-01",
        ended_at: null,
        type: "push",
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      },
    ];

    const result = formatDeploymentList(deployments);
    expect(result).toContain("no commit");
  });

  it("should handle empty list", () => {
    expect(formatDeploymentList([])).toBe("No deployments found.");
  });
});

describe("formatDeployAction", () => {
  it("should format a deploy action confirmation (legacy, no result)", () => {
    const result = formatDeployAction("10", "1");
    expect(result).toContain("Deployment triggered for site 10 on server 1.");
  });

  it("should format a successful deploy result with log", () => {
    const result = formatDeployAction("10", "1", {
      status: "success",
      log: "Build succeeded.",
      elapsed_ms: 5000,
    });
    expect(result).toContain("succeeded");
    expect(result).toContain("site 10");
    expect(result).toContain("server 1");
    expect(result).toContain("5.0s");
    expect(result).toContain("Build succeeded.");
  });

  it("should format a failed deploy result", () => {
    const result = formatDeployAction("10", "1", {
      status: "failed",
      log: "Error: npm install failed.",
      elapsed_ms: 2500,
    });
    expect(result).toContain("failed");
    expect(result).toContain("2.5s");
    expect(result).toContain("Error: npm install failed.");
  });

  it("should format a deploy result with empty log gracefully", () => {
    const result = formatDeployAction("10", "1", {
      status: "success",
      log: "",
      elapsed_ms: 1000,
    });
    expect(result).toContain("succeeded");
    expect(result).not.toContain("Deployment log:");
  });
});

describe("formatDeploymentScript", () => {
  it("should format deployment script content", () => {
    const result = formatDeploymentScript("cd /var/www && php artisan");
    expect(result).toContain("Deployment script:");
    expect(result).toContain("cd /var/www");
  });
});

describe("formatDeploymentOutput", () => {
  it("should format deployment output", () => {
    const result = formatDeploymentOutput("42", "Build succeeded");
    expect(result).toContain("Deployment 42 output:");
    expect(result).toContain("Build succeeded");
  });
});

describe("formatDeploymentScriptUpdated", () => {
  it("should format deployment script updated confirmation", () => {
    const result = formatDeploymentScriptUpdated("10", "1");
    expect(result).toContain("Deployment script updated for site 10 on server 1.");
  });
});

// ── Certificates ─────────────────────────────────────

describe("formatCertificate", () => {
  it("should format a single certificate", () => {
    const cert: CertificateAttributes & { id: number } = {
      id: 1,
      type: "letsencrypt",
      verification_method: null,
      key_type: null,
      preferred_chain: null,
      status: "installed",
      request_status: "complete",
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    };

    const result = formatCertificate(cert);
    expect(result).toContain("Certificate (ID: 1)");
    expect(result).toContain("Type: letsencrypt");
    expect(result).toContain("Status: installed");
    expect(result).toContain("Request: complete");
  });
});

// ── Daemons ──────────────────────────────────────────

describe("formatDaemonList", () => {
  it("should format a list of daemons", () => {
    const daemons: (BackgroundProcessAttributes & { id: number })[] = [
      {
        id: 1,
        command: "php artisan queue:work",
        user: "forge",
        directory: null,
        processes: 1,
        status: "running",
        created_at: "2024-01-01",
      },
    ];

    const result = formatDaemonList(daemons);
    expect(result).toContain("1 daemon(s):");
    expect(result).toContain("queue:work");
    expect(result).toContain("forge");
  });

  it("should handle empty list", () => {
    expect(formatDaemonList([])).toBe("No daemons found.");
  });
});

describe("formatDaemon", () => {
  it("should format a single daemon", () => {
    const daemon: BackgroundProcessAttributes & { id: number } = {
      id: 1,
      command: "php artisan queue:work",
      user: "forge",
      directory: null,
      processes: 2,
      status: "running",
      created_at: "2024-01-01",
    };

    const result = formatDaemon(daemon);
    expect(result).toContain("Daemon: php artisan queue:work (ID: 1)");
    expect(result).toContain("User: forge");
    expect(result).toContain("Processes: 2");
    expect(result).toContain("Status: running");
  });
});

// ── Firewall Rules ───────────────────────────────────

describe("formatFirewallRuleList", () => {
  it("should format a list of firewall rules", () => {
    const rules: (FirewallRuleAttributes & { id: number })[] = [
      {
        id: 1,
        name: "SSH",
        port: 22,
        type: "allow",
        ip_address: "0.0.0.0",
        status: "created",
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      },
    ];

    const result = formatFirewallRuleList(rules);
    expect(result).toContain("1 firewall rule(s):");
    expect(result).toContain("SSH");
    expect(result).toContain("22");
  });

  it("should handle empty list", () => {
    expect(formatFirewallRuleList([])).toBe("No firewall rules found.");
  });
});

describe("formatFirewallRule", () => {
  it("should format a single firewall rule", () => {
    const rule: FirewallRuleAttributes & { id: number } = {
      id: 1,
      name: "SSH",
      port: 22,
      type: "allow",
      ip_address: "1.2.3.4",
      status: "created",
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    };

    const result = formatFirewallRule(rule);
    expect(result).toContain("Firewall Rule: SSH (ID: 1)");
    expect(result).toContain("Port: 22");
    expect(result).toContain("Type: allow");
    expect(result).toContain("IP: 1.2.3.4");
    expect(result).toContain("Status: created");
  });
});

// ── Monitors ─────────────────────────────────────────

describe("formatMonitorList", () => {
  it("should format a list of monitors", () => {
    const monitors: (MonitorAttributes & { id: number })[] = [
      {
        id: 1,
        type: "cpu_load",
        operator: ">",
        threshold: 80,
        minutes: 5,
        notify: "email",
        status: "installed",
        state: "OK",
        state_changed_at: "2024-01-01",
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      },
    ];

    const result = formatMonitorList(monitors);
    expect(result).toContain("1 monitor(s):");
    expect(result).toContain("cpu_load");
    expect(result).toContain("80");
  });

  it("should handle empty list", () => {
    expect(formatMonitorList([])).toBe("No monitors found.");
  });
});

describe("formatMonitor", () => {
  it("should format a single monitor", () => {
    const monitor: MonitorAttributes & { id: number } = {
      id: 1,
      type: "cpu_load",
      operator: ">",
      threshold: 80,
      minutes: 5,
      notify: "email",
      status: "installed",
      state: "OK",
      state_changed_at: "2024-01-01",
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    };

    const result = formatMonitor(monitor);
    expect(result).toContain("Monitor: cpu_load > 80 (ID: 1)");
    expect(result).toContain("State: OK");
    expect(result).toContain("Minutes: 5");
  });
});

// ── SSH Keys ─────────────────────────────────────────

describe("formatSshKeyList", () => {
  it("should format a list of SSH keys", () => {
    const keys: (SshKeyAttributes & { id: number })[] = [
      {
        id: 1,
        name: "deploy-key",
        user: "forge",
        status: "installed",
        created_by: null,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      },
    ];

    const result = formatSshKeyList(keys);
    expect(result).toContain("1 SSH key(s):");
    expect(result).toContain("deploy-key");
    expect(result).toContain("installed");
  });

  it("should handle empty list", () => {
    expect(formatSshKeyList([])).toBe("No SSH keys found.");
  });
});

describe("formatSshKey", () => {
  it("should format a single SSH key", () => {
    const key: SshKeyAttributes & { id: number } = {
      id: 1,
      name: "deploy-key",
      user: "forge",
      status: "installed",
      created_by: null,
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    };

    const result = formatSshKey(key);
    expect(result).toContain("SSH Key: deploy-key (ID: 1)");
    expect(result).toContain("Status: installed");
    expect(result).toContain("Created: 2024-01-01");
  });
});

// ── Scheduled Jobs ───────────────────────────────────

describe("formatScheduledJobList", () => {
  it("should format a list of scheduled jobs", () => {
    const jobs: (ScheduledJobAttributes & { id: number })[] = [
      {
        id: 1,
        name: null,
        command: "php artisan schedule:run",
        user: "forge",
        frequency: "minutely",
        cron: "* * * * *",
        next_run_time: "2024-01-02",
        status: "running",
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      },
    ];

    const result = formatScheduledJobList(jobs);
    expect(result).toContain("1 scheduled job(s):");
    expect(result).toContain("schedule:run");
    expect(result).toContain("minutely");
  });

  it("should handle empty list", () => {
    expect(formatScheduledJobList([])).toBe("No scheduled jobs found.");
  });
});

describe("formatScheduledJob", () => {
  it("should format a single scheduled job", () => {
    const job: ScheduledJobAttributes & { id: number } = {
      id: 1,
      name: null,
      command: "php artisan schedule:run",
      user: "forge",
      frequency: "minutely",
      cron: "* * * * *",
      next_run_time: "2024-01-02",
      status: "running",
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    };

    const result = formatScheduledJob(job);
    expect(result).toContain("Job: php artisan schedule:run (ID: 1)");
    expect(result).toContain("User: forge");
    expect(result).toContain("Frequency: minutely");
    expect(result).toContain("Cron: * * * * *");
    expect(result).toContain("Status: running");
  });
});

// ── Security Rules ───────────────────────────────────

describe("formatSecurityRuleList", () => {
  it("should format a list of security rules", () => {
    const rules: (SecurityRuleAttributes & { id: number })[] = [
      {
        id: 1,
        name: "admin",
        path: "/admin",
        status: null,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      },
    ];

    const result = formatSecurityRuleList(rules);
    expect(result).toContain("1 security rule(s):");
    expect(result).toContain("admin");
    expect(result).toContain("/admin");
  });

  it("should show default path for null path", () => {
    const rules: (SecurityRuleAttributes & { id: number })[] = [
      {
        id: 1,
        name: "root",
        path: null,
        status: null,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      },
    ];
    const result = formatSecurityRuleList(rules);
    expect(result).toContain("path: /");
  });

  it("should handle empty list", () => {
    expect(formatSecurityRuleList([])).toBe("No security rules found.");
  });
});

describe("formatSecurityRule", () => {
  it("should format a single security rule", () => {
    const rule: SecurityRuleAttributes & { id: number } = {
      id: 1,
      name: "admin",
      path: "/admin",
      status: null,
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    };

    const result = formatSecurityRule(rule);
    expect(result).toContain("Security Rule: admin (ID: 1)");
    expect(result).toContain("Path: /admin");
  });

  it("should show default path when null", () => {
    const rule: SecurityRuleAttributes & { id: number } = {
      id: 1,
      name: "root",
      path: null,
      status: null,
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    };
    const result = formatSecurityRule(rule);
    expect(result).toContain("Path: /");
  });
});

// ── Redirect Rules ───────────────────────────────────

describe("formatRedirectRuleList", () => {
  it("should format a list of redirect rules", () => {
    const rules: (RedirectRuleAttributes & { id: number })[] = [
      {
        id: 1,
        from: "/old",
        to: "/new",
        type: "301",
        status: "installed",
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      },
    ];

    const result = formatRedirectRuleList(rules);
    expect(result).toContain("1 redirect rule(s):");
    expect(result).toContain("/old");
    expect(result).toContain("/new");
    expect(result).toContain("301");
  });

  it("should handle empty list", () => {
    expect(formatRedirectRuleList([])).toBe("No redirect rules found.");
  });
});

describe("formatRedirectRule", () => {
  it("should format a single redirect rule", () => {
    const rule: RedirectRuleAttributes & { id: number } = {
      id: 1,
      from: "/old",
      to: "/new",
      type: "301",
      status: "installed",
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    };

    const result = formatRedirectRule(rule);
    expect(result).toContain("Redirect Rule: /old → /new (ID: 1)");
    expect(result).toContain("Type: 301");
  });
});

// ── Nginx ────────────────────────────────────────────

describe("formatNginxConfig", () => {
  it("should format nginx configuration content", () => {
    const result = formatNginxConfig("server { listen 80; }");
    expect(result).toContain("Nginx configuration:");
    expect(result).toContain("server { listen 80; }");
  });
});

// ── Nginx Templates ──────────────────────────────────

describe("formatNginxTemplateList", () => {
  it("should format a list of nginx templates", () => {
    const templates: (NginxTemplateAttributes & { id: number })[] = [
      {
        id: 1,
        name: "wordpress",
        content: "# WP config",
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      },
    ];

    const result = formatNginxTemplateList(templates);
    expect(result).toContain("1 nginx template(s):");
    expect(result).toContain("wordpress");
  });

  it("should handle empty list", () => {
    expect(formatNginxTemplateList([])).toBe("No nginx templates found.");
  });
});

describe("formatNginxTemplate", () => {
  it("should format a single nginx template", () => {
    const template: NginxTemplateAttributes & { id: number } = {
      id: 1,
      name: "wordpress",
      content: "server { root /var/www; }",
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    };

    const result = formatNginxTemplate(template);
    expect(result).toContain("Nginx Template: wordpress (ID: 1)");
    expect(result).toContain("server { root /var/www; }");
  });
});

// ── Backup Configs ───────────────────────────────────

describe("formatBackupConfigList", () => {
  it("should format a list of backup configurations", () => {
    const backups: (BackupConfigAttributes & { id: number })[] = [
      {
        id: 1,
        name: "S3 Backup",
        storage_provider_id: null,
        provider: "s3",
        bucket: null,
        directory: "/backups",
        schedule: "daily",
        displayable_schedule: "Daily at 00:00",
        next_run_time: "2024-01-16",
        status: "active",
        day_of_week: null,
        time: null,
        cron_schedule: null,
        retention: 7,
        notify_email: null,
      },
    ];

    const result = formatBackupConfigList(backups);
    expect(result).toContain("1 backup config(s):");
    expect(result).toContain("S3 Backup");
    expect(result).toContain("daily");
    expect(result).toContain("2024-01-16");
  });

  it("should show dash when next_run_time is null", () => {
    const backups: (BackupConfigAttributes & { id: number })[] = [
      {
        id: 1,
        name: "S3 Backup",
        storage_provider_id: null,
        provider: "s3",
        bucket: null,
        directory: "/backups",
        schedule: "daily",
        displayable_schedule: "Daily at 00:00",
        next_run_time: null as unknown as string,
        status: "active",
        day_of_week: null,
        time: null,
        cron_schedule: null,
        retention: 7,
        notify_email: null,
      },
    ];

    const result = formatBackupConfigList(backups);
    expect(result).toContain("—");
  });

  it("should handle empty list", () => {
    expect(formatBackupConfigList([])).toBe("No backup configurations found.");
  });
});

describe("formatBackupConfig", () => {
  it("should format a single backup configuration", () => {
    const backup: BackupConfigAttributes & { id: number } = {
      id: 1,
      name: "S3 Backup",
      storage_provider_id: null,
      provider: "s3",
      bucket: null,
      directory: "/backups",
      schedule: "daily",
      displayable_schedule: "Daily at 00:00",
      next_run_time: "2024-01-16",
      status: "active",
      day_of_week: null,
      time: null,
      cron_schedule: null,
      retention: 7,
      notify_email: null,
    };

    const result = formatBackupConfig(backup);
    expect(result).toContain("Backup Config: S3 Backup (ID: 1)");
    expect(result).toContain("Schedule: Daily at 00:00");
    expect(result).toContain("Status: active");
    expect(result).toContain("Retention: 7 backups");
    expect(result).toContain("Next run: 2024-01-16");
  });

  it("should show dash for null next_run_time", () => {
    const backup = {
      id: 1,
      name: "S3 Backup",
      next_run_time: null,
      displayable_schedule: "Daily",
    } as unknown as BackupConfigAttributes & { id: number };
    const result = formatBackupConfig(backup);
    expect(result).toContain("Next run: —");
  });
});

// ── Recipes ──────────────────────────────────────────

describe("formatRecipeList", () => {
  it("should format a list of recipes", () => {
    const recipes: (RecipeAttributes & { id: number })[] = [
      {
        id: 1,
        name: "deploy",
        user: "root",
        script: "cd /app",
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      },
    ];

    const result = formatRecipeList(recipes);
    expect(result).toContain("1 recipe(s):");
    expect(result).toContain("deploy");
    expect(result).toContain("root");
  });

  it("should handle empty list", () => {
    expect(formatRecipeList([])).toBe("No recipes found.");
  });
});

describe("formatRecipe", () => {
  it("should format a single recipe", () => {
    const recipe: RecipeAttributes & { id: number } = {
      id: 1,
      name: "deploy",
      user: "root",
      script: "cd /app && npm install",
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    };

    const result = formatRecipe(recipe);
    expect(result).toContain("Recipe: deploy (ID: 1)");
    expect(result).toContain("User: root");
    expect(result).toContain("Script:");
    expect(result).toContain("npm install");
  });
});

// ── Commands ─────────────────────────────────────────

describe("formatCommandList", () => {
  it("should format a list of commands", () => {
    const commands: (CommandAttributes & { id: number })[] = [
      {
        id: 1,
        command: "php artisan migrate",
        status: "finished",
        duration: "2s",
        user_id: 1,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      },
    ];

    const result = formatCommandList(commands);
    expect(result).toContain("1 command(s):");
    expect(result).toContain("migrate");
    expect(result).toContain("finished");
  });

  it("should truncate long command to 60 chars", () => {
    const longCommand = "a".repeat(100);
    const commands: (CommandAttributes & { id: number })[] = [
      {
        id: 1,
        command: longCommand,
        status: "finished",
        duration: "2s",
        user_id: 1,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      },
    ];
    const result = formatCommandList(commands);
    // The command is sliced to 60 chars in the list
    expect(result).toContain("a".repeat(60));
    expect(result).not.toContain("a".repeat(61));
  });

  it("should handle empty list", () => {
    expect(formatCommandList([])).toBe("No commands found.");
  });
});

describe("formatCommand", () => {
  it("should format a single command", () => {
    const command: CommandAttributes & { id: number } = {
      id: 1,
      command: "php artisan migrate",
      status: "finished",
      duration: "2s",
      user_id: 1,
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    };

    const result = formatCommand(command);
    expect(result).toContain("Command #1");
    expect(result).toContain("Command: php artisan migrate");
    expect(result).toContain("Status: finished");
    expect(result).toContain("User ID: 1");
    expect(result).toContain("Duration: 2s");
    expect(result).toContain("Created: 2024-01-01");
  });
});

// ── Env ──────────────────────────────────────────────

describe("formatEnv", () => {
  it("should format environment variables content", () => {
    const result = formatEnv("APP_ENV=production\nAPP_KEY=abc123");
    expect(result).toContain("Environment variables:");
    expect(result).toContain("APP_ENV=production");
  });
});

// ── User ─────────────────────────────────────────────

describe("formatUser", () => {
  it("should format the authenticated user", () => {
    const user: UserAttributes & { id: number } = {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    };

    const result = formatUser(user);
    expect(result).toContain("User: John Doe (ID: 1)");
    expect(result).toContain("Email: john@example.com");
    expect(result).toContain("Created: 2024-01-01");
  });
});

// ── Generic helpers ──────────────────────────────────

describe("formatDeleted", () => {
  it("should format a deleted confirmation", () => {
    const result = formatDeleted("Server", "123");
    expect(result).toBe("Server 123 deleted.");
  });
});

describe("formatCreated", () => {
  it("should format a created confirmation", () => {
    const result = formatCreated("Database", "myapp", 42);
    expect(result).toBe("Database created: myapp (ID: 42)");
  });
});
