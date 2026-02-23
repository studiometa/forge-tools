// @studiometa/forge-sdk
// Laravel Forge TypeScript SDK — fluent, chainable, fully-typed API client

export { Forge } from "./forge.ts";
export { CertificatesCollection } from "./resources/certificates.ts";
export { DaemonsCollection } from "./resources/daemons.ts";
export { DatabasesCollection } from "./resources/databases.ts";
export { DeploymentsCollection } from "./resources/deployments.ts";
export { ServersCollection, ServerResource } from "./resources/servers.ts";
export {
  SiteEnvResource,
  SiteNginxResource,
  SiteResource,
  SitesCollection,
} from "./resources/sites.ts";

// Re-export types from forge-api for convenience
export type {
  CreateCertificateData,
  CreateDaemonData,
  CreateDatabaseData,
  CreateFirewallRuleData,
  CreateMonitorData,
  CreateNginxTemplateData,
  CreateRecipeData,
  CreateRedirectRuleData,
  CreateSecurityRuleData,
  CreateServerData,
  CreateSiteData,
  CreateSshKeyData,
  ForgeCertificate,
  ForgeDaemon,
  ForgeDatabase,
  ForgeDeployment,
  ForgeFirewallRule,
  ForgeMonitor,
  ForgeNginxTemplate,
  ForgeOptions,
  ForgeRecipe,
  ForgeRedirectRule,
  ForgeSecurityRule,
  ForgeServer,
  ForgeSite,
  ForgeSshKey,
  ForgeUser,
} from "@studiometa/forge-api";
