import { describe, expect, it } from "vitest";
import * as v from "valibot";

import {
  CreateServerDataSchema,
  CreateSiteDataSchema,
  CreateCertificateDataSchema,
  CreateDatabaseDataSchema,
  CreateDatabaseUserDataSchema,
  CreateDaemonDataSchema,
  CreateBackupConfigDataSchema,
  CreateCommandDataSchema,
  CreateScheduledJobDataSchema,
  CreateFirewallRuleDataSchema,
  CreateSshKeyDataSchema,
  CreateSecurityRuleDataSchema,
  CreateRedirectRuleDataSchema,
  CreateMonitorDataSchema,
  CreateNginxTemplateDataSchema,
  CreateRecipeDataSchema,
} from "./types.ts";

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
  "CreateServerDataSchema",
  CreateServerDataSchema,
  {
    name: "web-1",
    provider: "ocean2",
    type: "app",
    ubuntu_version: "22.04",
    custom: { ip_address: "1.2.3.4", private_ip_address: "10.0.0.1" },
    laravel: { region_id: "nyc1", size_id: "s-1vcpu-1gb" },
  },
  { name: 123 },
);

testSchema("CreateSiteDataSchema", CreateSiteDataSchema, { type: "php" }, { type: 123 });

testSchema(
  "CreateCertificateDataSchema",
  CreateCertificateDataSchema,
  { type: "letsencrypt" },
  { type: "invalid_type" },
);

testSchema("CreateDatabaseDataSchema", CreateDatabaseDataSchema, { name: "mydb" }, { name: 123 });

testSchema(
  "CreateDatabaseUserDataSchema",
  CreateDatabaseUserDataSchema,
  { name: "forge", password: "secret" },
  { name: 123 },
);

testSchema(
  "CreateDaemonDataSchema",
  CreateDaemonDataSchema,
  { name: "queue", command: "php artisan queue:work", user: "forge", processes: 1 },
  { name: 123 },
);

testSchema(
  "CreateBackupConfigDataSchema",
  CreateBackupConfigDataSchema,
  { storage_provider_id: 1, frequency: "daily", retention: 7, database_ids: [1] },
  { storage_provider_id: "not-a-number" },
);

testSchema(
  "CreateCommandDataSchema",
  CreateCommandDataSchema,
  { command: "ls -la" },
  { command: 123 },
);

testSchema(
  "CreateScheduledJobDataSchema",
  CreateScheduledJobDataSchema,
  { command: "php artisan schedule:run", user: "forge", frequency: "minutely" },
  { command: 123 },
);

testSchema(
  "CreateFirewallRuleDataSchema",
  CreateFirewallRuleDataSchema,
  { name: "SSH", type: "allow" },
  { name: 123 },
);

testSchema(
  "CreateSshKeyDataSchema",
  CreateSshKeyDataSchema,
  { name: "my-key", key: "ssh-rsa AAAA..." },
  { name: 123 },
);

testSchema(
  "CreateSecurityRuleDataSchema",
  CreateSecurityRuleDataSchema,
  { name: "admin", credentials: [{ username: "admin", password: "secret" }] },
  { name: 123 },
);

testSchema(
  "CreateRedirectRuleDataSchema",
  CreateRedirectRuleDataSchema,
  { from: "/old", to: "/new", type: "permanent" },
  { from: 123 },
);

testSchema(
  "CreateMonitorDataSchema",
  CreateMonitorDataSchema,
  { type: "disk", operator: "gte", threshold: 80, notify: "email" },
  { type: 123 },
);

testSchema(
  "CreateNginxTemplateDataSchema",
  CreateNginxTemplateDataSchema,
  { name: "default", content: "server { ... }" },
  { name: 123 },
);

testSchema(
  "CreateRecipeDataSchema",
  CreateRecipeDataSchema,
  { name: "deploy", user: "forge", script: "git pull" },
  { name: 123 },
);
