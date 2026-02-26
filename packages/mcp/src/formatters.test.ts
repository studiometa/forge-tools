import { describe, expect, it } from "vitest";

import type {
  ForgeBackupConfig,
  ForgeCertificate,
  ForgeCommand,
  ForgeDaemon,
  ForgeDatabase,
  ForgeDatabaseUser,
  ForgeDeployment,
  ForgeFirewallRule,
  ForgeMonitor,
  ForgeNginxTemplate,
  ForgeRecipe,
  ForgeRedirectRule,
  ForgeScheduledJob,
  ForgeSecurityRule,
  ForgeServer,
  ForgeSite,
  ForgeSshKey,
  ForgeUser,
} from "@studiometa/forge-api";

import {
  formatBackupConfig,
  formatBackupConfigList,
  formatCertificate,
  formatCertificateList,
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
    const servers: ForgeServer[] = [
      {
        id: 1,
        name: "web-1",
        provider: "ocean2",
        region: "ams3",
        ip_address: "1.2.3.4",
        is_ready: true,
        credential_id: 1,
        type: "app",
        provider_id: "123",
        size: "01",
        ubuntu_version: "22.04",
        db_status: null,
        redis_status: null,
        php_version: "php83",
        php_cli_version: "php83",
        database_type: "mysql8",
        ssh_port: 22,
        private_ip_address: "10.0.0.1",
        local_public_key: "ssh-rsa ...",
        revoked: false,
        created_at: "2024-01-01",
        network: [],
        tags: [],
      },
    ] as ForgeServer[];

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
    const servers = [
      {
        id: 1,
        name: "new-server",
        provider: "ocean2",
        region: "ams3",
        ip_address: "1.2.3.4",
        is_ready: false,
      } as ForgeServer,
    ];
    const result = formatServerList(servers);
    expect(result).toContain("provisioning");
  });
});

describe("formatServer", () => {
  it("should format a single server", () => {
    const server: ForgeServer = {
      id: 1,
      name: "web-1",
      provider: "ocean2",
      region: "ams3",
      ip_address: "1.2.3.4",
      is_ready: true,
      php_version: "php83",
      ubuntu_version: "22.04",
      created_at: "2024-01-01",
    } as ForgeServer;

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
    const server = { id: 1, name: "web-1", is_ready: false } as ForgeServer;
    const result = formatServer(server);
    expect(result).toContain("provisioning");
  });
});

// ── Sites ────────────────────────────────────────────

describe("formatSiteList", () => {
  it("should format a list of sites", () => {
    const sites: ForgeSite[] = [
      { id: 1, name: "example.com", project_type: "php", status: "installed" } as ForgeSite,
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
    const sites: ForgeSite[] = [
      { id: 1, name: "example.com", project_type: "php", status: "installed" } as ForgeSite,
    ];
    const result = formatSiteList(sites);
    expect(result).toContain("1 site(s):");
    expect(result).not.toContain("on server");
  });
});

describe("formatSite", () => {
  it("should format a single site", () => {
    const site: ForgeSite = {
      id: 1,
      name: "example.com",
      project_type: "php",
      directory: "/public",
      repository: "git@github.com:user/repo.git",
      repository_branch: "main",
      status: "installed",
      deployment_status: "finished",
      quick_deploy: true,
      php_version: "php84",
      created_at: "2024-01-01",
    } as ForgeSite;

    const result = formatSite(site);
    expect(result).toContain("Site: example.com (ID: 1)");
    expect(result).toContain("Type: php");
    expect(result).toContain("Repository: git@github.com:user/repo.git");
    expect(result).toContain("Branch: main");
    expect(result).toContain("Quick deploy: enabled");
  });

  it("should show none for null fields", () => {
    const site: ForgeSite = {
      id: 1,
      name: "example.com",
      project_type: "php",
      directory: "/public",
      repository: null,
      repository_branch: null,
      status: "installed",
      deployment_status: null,
      quick_deploy: false,
      php_version: "php84",
      created_at: "2024-01-01",
    } as ForgeSite;

    const result = formatSite(site);
    expect(result).toContain("Repository: none");
    expect(result).toContain("Branch: none");
    expect(result).toContain("Deploy status: none");
    expect(result).toContain("Quick deploy: disabled");
  });
});

// ── Databases ────────────────────────────────────────

describe("formatDatabaseList", () => {
  it("should format a list of databases", () => {
    const databases: ForgeDatabase[] = [
      { id: 1, name: "myapp", status: "installed", server_id: 1, created_at: "2024-01-01" },
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
    const db: ForgeDatabase = {
      id: 1,
      name: "myapp",
      status: "installed",
      server_id: 1,
      created_at: "2024-01-01",
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
    const users: ForgeDatabaseUser[] = [
      {
        id: 1,
        name: "forge",
        status: "installed",
        server_id: 1,
        databases: [],
        created_at: "2024-01-01",
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
  it("should format a single database user with databases", () => {
    const user: ForgeDatabaseUser = {
      id: 1,
      name: "forge",
      status: "installed",
      server_id: 1,
      databases: [1, 2],
      created_at: "2024-01-01",
    };

    const result = formatDatabaseUser(user);
    expect(result).toContain("Database User: forge (ID: 1)");
    expect(result).toContain("Status: installed");
    expect(result).toContain("Databases: 1, 2");
    expect(result).toContain("Created: 2024-01-01");
  });

  it("should show 'none' when no databases are assigned", () => {
    const user: ForgeDatabaseUser = {
      id: 2,
      name: "readonly",
      status: "installed",
      server_id: 1,
      databases: [],
      created_at: "2024-01-01",
    };

    const result = formatDatabaseUser(user);
    expect(result).toContain("Databases: none");
  });
});

// ── Deployments ──────────────────────────────────────

describe("formatDeploymentList", () => {
  it("should format a list of deployments", () => {
    const deployments: ForgeDeployment[] = [
      {
        id: 1,
        status: "deployed",
        commit_hash: "abc1234def",
        started_at: "2024-01-01",
        server_id: 1,
        site_id: 10,
        type: 1,
        commit_author: "user",
        commit_message: "deploy",
        ended_at: "2024-01-01",
        displayable_type: "Deploy",
      },
    ];

    const result = formatDeploymentList(deployments);
    expect(result).toContain("1 deployment(s):");
    expect(result).toContain("deployed");
    expect(result).toContain("abc1234"); // first 7 chars
  });

  it("should handle null commit_hash", () => {
    const deployments: ForgeDeployment[] = [
      { id: 1, status: "deployed", commit_hash: null, started_at: "2024-01-01" } as ForgeDeployment,
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

describe("formatCertificateList", () => {
  it("should format a list of certificates", () => {
    const certificates: ForgeCertificate[] = [
      {
        id: 1,
        domain: "example.com",
        type: "letsencrypt",
        active: true,
        status: "installed",
        server_id: 1,
        site_id: 10,
        request_status: "complete",
        created_at: "2024-01-01",
        existing: false,
      },
    ];

    const result = formatCertificateList(certificates);
    expect(result).toContain("1 certificate(s):");
    expect(result).toContain("example.com");
    expect(result).toContain("active");
  });

  it("should handle inactive certificate", () => {
    const certificates: ForgeCertificate[] = [
      {
        id: 1,
        domain: "example.com",
        type: "existing",
        active: false,
        status: "pending",
      } as ForgeCertificate,
    ];
    const result = formatCertificateList(certificates);
    expect(result).toContain("inactive");
  });

  it("should handle empty list", () => {
    expect(formatCertificateList([])).toBe("No certificates found.");
  });
});

describe("formatCertificate", () => {
  it("should format a single certificate", () => {
    const cert: ForgeCertificate = {
      id: 1,
      domain: "example.com",
      type: "letsencrypt",
      status: "installed",
      active: true,
    } as ForgeCertificate;

    const result = formatCertificate(cert);
    expect(result).toContain("Certificate: example.com (ID: 1)");
    expect(result).toContain("Type: letsencrypt");
    expect(result).toContain("Status: installed");
    expect(result).toContain("Active: true");
  });
});

// ── Daemons ──────────────────────────────────────────

describe("formatDaemonList", () => {
  it("should format a list of daemons", () => {
    const daemons: ForgeDaemon[] = [
      {
        id: 1,
        command: "php artisan queue:work",
        user: "forge",
        processes: 1,
        status: "running",
      } as ForgeDaemon,
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
    const daemon: ForgeDaemon = {
      id: 1,
      command: "php artisan queue:work",
      user: "forge",
      processes: 2,
      status: "running",
    } as ForgeDaemon;

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
    const rules: ForgeFirewallRule[] = [
      {
        id: 1,
        name: "SSH",
        port: 22,
        type: "allow",
        ip_address: "0.0.0.0",
        status: "created",
      } as ForgeFirewallRule,
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
    const rule: ForgeFirewallRule = {
      id: 1,
      name: "SSH",
      port: 22,
      type: "allow",
      ip_address: "1.2.3.4",
      status: "created",
    } as ForgeFirewallRule;

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
    const monitors: ForgeMonitor[] = [
      { id: 1, type: "cpu_load", operator: ">", threshold: 80, state: "OK" } as ForgeMonitor,
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
    const monitor: ForgeMonitor = {
      id: 1,
      type: "cpu_load",
      operator: ">",
      threshold: 80,
      minutes: 5,
      state: "OK",
    } as ForgeMonitor;

    const result = formatMonitor(monitor);
    expect(result).toContain("Monitor: cpu_load > 80 (ID: 1)");
    expect(result).toContain("State: OK");
    expect(result).toContain("Minutes: 5");
  });
});

// ── SSH Keys ─────────────────────────────────────────

describe("formatSshKeyList", () => {
  it("should format a list of SSH keys", () => {
    const keys: ForgeSshKey[] = [
      { id: 1, name: "deploy-key", status: "installed", server_id: 1, created_at: "2024-01-01" },
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
    const key: ForgeSshKey = {
      id: 1,
      name: "deploy-key",
      status: "installed",
      server_id: 1,
      created_at: "2024-01-01",
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
    const jobs: ForgeScheduledJob[] = [
      {
        id: 1,
        command: "php artisan schedule:run",
        user: "forge",
        frequency: "minutely",
        cron: "* * * * *",
        status: "running",
        created_at: "2024-01-01",
        server_id: 1,
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
    const job: ForgeScheduledJob = {
      id: 1,
      command: "php artisan schedule:run",
      user: "forge",
      frequency: "minutely",
      cron: "* * * * *",
      status: "running",
      created_at: "2024-01-01",
      server_id: 1,
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
    const rules: ForgeSecurityRule[] = [
      {
        id: 1,
        name: "admin",
        path: "/admin",
        credentials: [],
        server_id: 1,
        site_id: 10,
        created_at: "2024-01-01",
      },
    ];

    const result = formatSecurityRuleList(rules);
    expect(result).toContain("1 security rule(s):");
    expect(result).toContain("admin");
    expect(result).toContain("/admin");
  });

  it("should show default path for null path", () => {
    const rules: ForgeSecurityRule[] = [
      {
        id: 1,
        name: "root",
        path: null,
        credentials: [],
        server_id: 1,
        site_id: 10,
        created_at: "2024-01-01",
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
    const rule: ForgeSecurityRule = {
      id: 1,
      name: "admin",
      path: "/admin",
      credentials: [],
      server_id: 1,
      site_id: 10,
      created_at: "2024-01-01",
    };

    const result = formatSecurityRule(rule);
    expect(result).toContain("Security Rule: admin (ID: 1)");
    expect(result).toContain("Path: /admin");
  });

  it("should show default path when null", () => {
    const rule: ForgeSecurityRule = {
      id: 1,
      name: "root",
      path: null,
      credentials: [],
      server_id: 1,
      site_id: 10,
      created_at: "2024-01-01",
    };
    const result = formatSecurityRule(rule);
    expect(result).toContain("Path: /");
  });
});

// ── Redirect Rules ───────────────────────────────────

describe("formatRedirectRuleList", () => {
  it("should format a list of redirect rules", () => {
    const rules: ForgeRedirectRule[] = [
      {
        id: 1,
        from: "/old",
        to: "/new",
        type: "301",
        server_id: 1,
        site_id: 10,
        created_at: "2024-01-01",
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
    const rule: ForgeRedirectRule = {
      id: 1,
      from: "/old",
      to: "/new",
      type: "301",
      server_id: 1,
      site_id: 10,
      created_at: "2024-01-01",
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
    const templates: ForgeNginxTemplate[] = [
      { id: 1, name: "wordpress", content: "# WP config", server_id: 1, created_at: "2024-01-01" },
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
    const template: ForgeNginxTemplate = {
      id: 1,
      name: "wordpress",
      content: "server { root /var/www; }",
      server_id: 1,
      created_at: "2024-01-01",
    };

    const result = formatNginxTemplate(template);
    expect(result).toContain("Nginx Template: wordpress (ID: 1)");
    expect(result).toContain("server { root /var/www; }");
  });
});

// ── Backup Configs ───────────────────────────────────

describe("formatBackupConfigList", () => {
  it("should format a list of backup configurations", () => {
    const backups: ForgeBackupConfig[] = [
      {
        id: 1,
        provider_name: "S3",
        frequency: "daily",
        status: "active",
        last_backup_time: "2024-01-15",
        provider: "s3",
        server_id: 1,
        day_of_week: null,
        time: null,
        databases: [],
        directory: null,
        email: null,
        retention: 7,
      },
    ];

    const result = formatBackupConfigList(backups);
    expect(result).toContain("1 backup config(s):");
    expect(result).toContain("S3");
    expect(result).toContain("daily");
    expect(result).toContain("2024-01-15");
  });

  it("should show never when last_backup_time is null", () => {
    const backups: ForgeBackupConfig[] = [
      {
        id: 1,
        provider_name: "S3",
        frequency: "daily",
        status: "active",
        last_backup_time: null,
        provider: "s3",
        server_id: 1,
        day_of_week: null,
        time: null,
        databases: [],
        directory: null,
        email: null,
        retention: 7,
      },
    ];

    const result = formatBackupConfigList(backups);
    expect(result).toContain("never");
  });

  it("should handle empty list", () => {
    expect(formatBackupConfigList([])).toBe("No backup configurations found.");
  });
});

describe("formatBackupConfig", () => {
  it("should format a single backup configuration", () => {
    const backup: ForgeBackupConfig = {
      id: 1,
      provider_name: "S3",
      provider: "s3",
      frequency: "daily",
      status: "active",
      retention: 7,
      databases: [{ id: 1, name: "myapp" }],
      last_backup_time: "2024-01-15",
      server_id: 1,
      day_of_week: null,
      time: null,
      directory: null,
      email: null,
    };

    const result = formatBackupConfig(backup);
    expect(result).toContain("Backup Config: S3 (ID: 1)");
    expect(result).toContain("Frequency: daily");
    expect(result).toContain("Status: active");
    expect(result).toContain("Retention: 7 backups");
    expect(result).toContain("Databases: myapp");
    expect(result).toContain("Last backup: 2024-01-15");
  });

  it("should show never for null last_backup_time", () => {
    const backup = {
      id: 1,
      provider_name: "S3",
      databases: [],
      last_backup_time: null,
    } as ForgeBackupConfig;
    const result = formatBackupConfig(backup);
    expect(result).toContain("Last backup: never");
  });

  it("should show none for empty databases", () => {
    const backup = {
      id: 1,
      provider_name: "S3",
      databases: [],
      last_backup_time: null,
    } as ForgeBackupConfig;
    const result = formatBackupConfig(backup);
    expect(result).toContain("Databases: none");
  });
});

// ── Recipes ──────────────────────────────────────────

describe("formatRecipeList", () => {
  it("should format a list of recipes", () => {
    const recipes: ForgeRecipe[] = [
      { id: 1, name: "deploy", user: "root", script: "cd /app", created_at: "2024-01-01" },
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
    const recipe: ForgeRecipe = {
      id: 1,
      name: "deploy",
      user: "root",
      script: "cd /app && npm install",
      created_at: "2024-01-01",
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
    const commands: ForgeCommand[] = [
      {
        id: 1,
        command: "php artisan migrate",
        status: "finished",
        user_name: "John",
        created_at: "2024-01-01",
      } as ForgeCommand,
    ];

    const result = formatCommandList(commands);
    expect(result).toContain("1 command(s):");
    expect(result).toContain("migrate");
    expect(result).toContain("finished");
  });

  it("should truncate long command to 60 chars", () => {
    const longCommand = "a".repeat(100);
    const commands: ForgeCommand[] = [
      {
        id: 1,
        command: longCommand,
        status: "finished",
        user_name: "user",
        created_at: "2024-01-01",
      } as ForgeCommand,
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
    const command: ForgeCommand = {
      id: 1,
      command: "php artisan migrate",
      status: "finished",
      user_name: "John",
      created_at: "2024-01-01",
    } as ForgeCommand;

    const result = formatCommand(command);
    expect(result).toContain("Command #1");
    expect(result).toContain("Command: php artisan migrate");
    expect(result).toContain("Status: finished");
    expect(result).toContain("User: John");
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
  it("should format the authenticated user with connected services", () => {
    const user: ForgeUser = {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      connected_to_github: true,
      connected_to_gitlab: false,
      two_factor_enabled: true,
    } as ForgeUser;

    const result = formatUser(user);
    expect(result).toContain("User: John Doe (ID: 1)");
    expect(result).toContain("Email: john@example.com");
    expect(result).toContain("GitHub: connected");
    expect(result).toContain("GitLab: not connected");
    expect(result).toContain("2FA: enabled");
  });

  it("should format user with disabled 2FA", () => {
    const user: ForgeUser = {
      id: 1,
      name: "Jane",
      email: "jane@example.com",
      connected_to_github: false,
      connected_to_gitlab: false,
      two_factor_enabled: false,
    } as ForgeUser;

    const result = formatUser(user);
    expect(result).toContain("GitHub: not connected");
    expect(result).toContain("2FA: disabled");
  });

  it("should show GitLab as connected when connected_to_gitlab is true", () => {
    const user: ForgeUser = {
      id: 2,
      name: "GitLab User",
      email: "gl@example.com",
      connected_to_github: false,
      connected_to_gitlab: true,
      two_factor_enabled: false,
    } as ForgeUser;

    const result = formatUser(user);
    expect(result).toContain("GitLab: connected");
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
