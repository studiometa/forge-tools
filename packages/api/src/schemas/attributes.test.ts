import { describe, expect, it } from "vitest";
import * as v from "valibot";

import {
  UserAttributesSchema,
  ServerAttributesSchema,
  SiteAttributesSchema,
  DeploymentAttributesSchema,
  DeploymentStatusAttributesSchema,
  DeploymentOutputAttributesSchema,
  DeploymentScriptAttributesSchema,
  DatabaseAttributesSchema,
  DatabaseUserAttributesSchema,
  BackgroundProcessAttributesSchema,
  CertificateAttributesSchema,
  FirewallRuleAttributesSchema,
  SshKeyAttributesSchema,
  SecurityRuleAttributesSchema,
  RedirectRuleAttributesSchema,
  MonitorAttributesSchema,
  NginxTemplateAttributesSchema,
  RecipeAttributesSchema,
  ScheduledJobAttributesSchema,
  CommandAttributesSchema,
  BackupConfigAttributesSchema,
  BackupAttributesSchema,
  OrganizationAttributesSchema,
  EnvironmentAttributesSchema,
  SiteRepositorySchema,
  DeploymentCommitSchema,
} from "./attributes.ts";

// Helper to test schema validation
function testSchema(
  name: string,
  schema: v.GenericSchema,
  validFixture: unknown,
  invalidFixture: unknown,
) {
  describe(name, () => {
    it("should validate a valid fixture", () => {
      expect(() => v.parse(schema, validFixture)).not.toThrow();
    });

    it("should reject an invalid fixture", () => {
      expect(() => v.parse(schema, invalidFixture)).toThrow();
    });
  });
}

testSchema(
  "UserAttributesSchema",
  UserAttributesSchema,
  { name: "John", email: "john@example.com", created_at: null, updated_at: null },
  { name: 123 },
);

testSchema(
  "ServerAttributesSchema",
  ServerAttributesSchema,
  {
    id: 1,
    credential_id: null,
    name: "web-1",
    type: "app",
    ubuntu_version: "22.04",
    ssh_port: 22,
    provider: "ocean2",
    identifier: null,
    size: "1gb",
    region: "nyc1",
    php_version: "8.2",
    php_cli_version: "8.2",
    opcache_status: null,
    database_type: "mysql8",
    db_status: "installed",
    redis_status: null,
    ip_address: "1.2.3.4",
    private_ip_address: null,
    revoked: false,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    connection_status: "connected",
    timezone: "UTC",
    local_public_key: null,
    is_ready: true,
  },
  { name: "web-1" },
);

testSchema(
  "SiteRepositorySchema",
  SiteRepositorySchema,
  { provider: "github", url: "org/repo", branch: "main", status: "installed" },
  { provider: 123 },
);

testSchema(
  "SiteAttributesSchema",
  SiteAttributesSchema,
  {
    name: "example.com",
    aliases: [],
    root_directory: null,
    web_directory: "/public",
    wildcards: null,
    status: "installed",
    repository: null,
    quick_deploy: null,
    deployment_status: null,
    deployment_url: "https://example.com",
    deployment_script: null,
    php_version: "8.2",
    app_type: "php",
    url: "https://example.com",
    https: true,
    isolated: false,
    user: "forge",
    database: null,
    shared_paths: null,
    uses_envoyer: false,
    zero_downtime_deployments: false,
    maintenance_mode: null,
    healthcheck_url: null,
    created_at: null,
    updated_at: null,
  },
  { name: 123 },
);

describe("SiteAttributesSchema — nullable aliases", () => {
  it("should accept null aliases (API returns null for some sites)", () => {
    const fixture = {
      name: "example.com",
      aliases: null,
      root_directory: null,
      web_directory: "/public",
      wildcards: null,
      status: "installed",
      repository: null,
      quick_deploy: null,
      deployment_status: null,
      deployment_url: "https://example.com",
      deployment_script: null,
      php_version: "8.2",
      app_type: "php",
      url: "https://example.com",
      https: true,
      isolated: false,
      user: "forge",
      database: null,
      shared_paths: null,
      uses_envoyer: false,
      zero_downtime_deployments: false,
      maintenance_mode: null,
      healthcheck_url: null,
      created_at: null,
      updated_at: null,
    };
    expect(() => v.parse(SiteAttributesSchema, fixture)).not.toThrow();
  });

  it("should accept aliases with values", () => {
    const fixture = {
      name: "example.com",
      aliases: ["www.example.com", "app.example.com"],
      root_directory: null,
      web_directory: "/public",
      wildcards: null,
      status: "installed",
      repository: null,
      quick_deploy: null,
      deployment_status: null,
      deployment_url: "https://example.com",
      deployment_script: null,
      php_version: "8.2",
      app_type: "php",
      url: "https://example.com",
      https: true,
      isolated: false,
      user: "forge",
      database: null,
      shared_paths: null,
      uses_envoyer: false,
      zero_downtime_deployments: false,
      maintenance_mode: null,
      healthcheck_url: null,
      created_at: null,
      updated_at: null,
    };
    expect(() => v.parse(SiteAttributesSchema, fixture)).not.toThrow();
  });
});

testSchema(
  "DeploymentCommitSchema",
  DeploymentCommitSchema,
  { hash: "abc123", author: "John", message: "fix", branch: "main" },
  { hash: 123 },
);

testSchema(
  "DeploymentAttributesSchema",
  DeploymentAttributesSchema,
  {
    commit: { hash: null, author: null, message: null, branch: null },
    status: "finished",
    type: "default",
    started_at: "2024-01-01T00:00:00Z",
    ended_at: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  { status: 123 },
);

testSchema(
  "DeploymentStatusAttributesSchema",
  DeploymentStatusAttributesSchema,
  { status: "deploying", started_at: "2024-01-01T00:00:00Z" },
  { status: 123 },
);

testSchema(
  "DeploymentOutputAttributesSchema",
  DeploymentOutputAttributesSchema,
  { output: "Deployment finished." },
  { output: 123 },
);

testSchema(
  "DeploymentScriptAttributesSchema",
  DeploymentScriptAttributesSchema,
  { content: "cd /home/forge && git pull", auto_source: "source .env" },
  { content: 123 },
);

testSchema(
  "DatabaseAttributesSchema",
  DatabaseAttributesSchema,
  {
    name: "myapp",
    status: "installed",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  { name: 123 },
);

testSchema(
  "DatabaseUserAttributesSchema",
  DatabaseUserAttributesSchema,
  {
    name: "forge",
    status: "installed",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  { name: 123 },
);

testSchema(
  "BackgroundProcessAttributesSchema",
  BackgroundProcessAttributesSchema,
  {
    command: "php artisan queue:work",
    user: "forge",
    directory: null,
    processes: 1,
    status: "active",
    created_at: "2024-01-01T00:00:00Z",
  },
  { command: 123 },
);

testSchema(
  "CertificateAttributesSchema",
  CertificateAttributesSchema,
  {
    type: "letsencrypt",
    verification_method: null,
    key_type: null,
    preferred_chain: null,
    request_status: "created",
    status: "active",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  { type: 123 },
);

testSchema(
  "FirewallRuleAttributesSchema",
  FirewallRuleAttributesSchema,
  {
    name: "SSH",
    port: "22",
    type: "allow",
    ip_address: null,
    status: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  { name: 123 },
);

testSchema(
  "SshKeyAttributesSchema",
  SshKeyAttributesSchema,
  {
    name: "my-key",
    user: "forge",
    status: "installed",
    created_by: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  { name: 123 },
);

testSchema(
  "SecurityRuleAttributesSchema",
  SecurityRuleAttributesSchema,
  {
    name: "admin",
    path: "/admin",
    status: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  { name: 123 },
);

testSchema(
  "RedirectRuleAttributesSchema",
  RedirectRuleAttributesSchema,
  {
    from: "/old",
    to: "/new",
    type: "permanent",
    status: "installed",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  { from: 123 },
);

testSchema(
  "MonitorAttributesSchema",
  MonitorAttributesSchema,
  {
    type: "disk",
    operator: "gte",
    threshold: 80,
    minutes: null,
    notify: "email",
    status: "active",
    state: "OK",
    state_changed_at: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  { type: 123 },
);

testSchema(
  "NginxTemplateAttributesSchema",
  NginxTemplateAttributesSchema,
  { name: "default", content: "server { ... }", created_at: null, updated_at: null },
  { name: 123 },
);

testSchema(
  "RecipeAttributesSchema",
  RecipeAttributesSchema,
  {
    name: "deploy",
    user: "forge",
    script: "git pull",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  { name: 123 },
);

testSchema(
  "ScheduledJobAttributesSchema",
  ScheduledJobAttributesSchema,
  {
    name: null,
    command: "php artisan schedule:run",
    user: "forge",
    frequency: "minutely",
    cron: "* * * * *",
    next_run_time: "2024-01-01T00:01:00Z",
    status: "active",
    created_at: null,
    updated_at: null,
  },
  { command: 123 },
);

testSchema(
  "CommandAttributesSchema",
  CommandAttributesSchema,
  {
    command: "ls -la",
    status: "finished",
    duration: "2s",
    user_id: 1,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  { command: 123 },
);

testSchema(
  "BackupConfigAttributesSchema",
  BackupConfigAttributesSchema,
  {
    name: "daily",
    storage_provider_id: null,
    provider: "s3",
    bucket: null,
    directory: "/backups",
    schedule: "daily",
    displayable_schedule: "Daily",
    next_run_time: "2024-01-02T00:00:00Z",
    status: "active",
    day_of_week: null,
    time: null,
    cron_schedule: null,
    retention: 7,
    notify_email: null,
  },
  { name: 123 },
);

testSchema(
  "BackupAttributesSchema",
  BackupAttributesSchema,
  { status: "completed", is_partial: "false", size: 1024, finished_at: "2024-01-01T00:00:00Z" },
  { status: 123 },
);

testSchema(
  "OrganizationAttributesSchema",
  OrganizationAttributesSchema,
  { name: "My Org", slug: "my-org", created_at: null, updated_at: null },
  { name: 123 },
);

testSchema(
  "EnvironmentAttributesSchema",
  EnvironmentAttributesSchema,
  { content: "APP_ENV=production" },
  { content: 123 },
);
