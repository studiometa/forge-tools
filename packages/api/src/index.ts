// @studiometa/forge-api
// Laravel Forge API client — HTTP client, types, config storage, and rate limiting

export { HttpClient } from "./client.ts";
export {
  createConfigStore,
  deleteToken,
  getToken,
  setToken,
  getOrganizationSlug,
  setOrganizationSlug,
} from "./config.ts";
export { ForgeApiError, isForgeApiError } from "./errors.ts";
export { RateLimiter } from "./rate-limiter.ts";
export { ConfigStore } from "./utils/config-store.ts";
export { unwrapResource, unwrapDocument, unwrapListDocument } from "./utils/jsonapi.ts";

export type { ConfigStoreFs } from "./utils/config-store.ts";

// JSON:API types (v2)
export type {
  JsonApiResource,
  JsonApiRelationship,
  JsonApiResourceIdentifier,
  JsonApiLink,
  JsonApiDocument,
  JsonApiListDocument,
  JsonApiPaginationLinks,
  JsonApiPaginationMeta,
} from "./types/jsonapi.ts";

// v2 resource attribute types
export type {
  UserAttributes,
  ServerAttributes,
  SiteAttributes,
  DeploymentAttributes,
  DeploymentCommit,
  DeploymentStatusAttributes,
  DeploymentOutputAttributes,
  DeploymentScriptAttributes,
  DatabaseAttributes,
  DatabaseUserAttributes,
  BackgroundProcessAttributes,
  CertificateAttributes,
  FirewallRuleAttributes,
  SshKeyAttributes,
  SecurityRuleAttributes,
  RedirectRuleAttributes,
  MonitorAttributes,
  NginxTemplateAttributes,
  RecipeAttributes,
  ScheduledJobAttributes,
  CommandAttributes,
  BackupConfigAttributes,
  BackupAttributes,
  OrganizationAttributes,
} from "./types/v2-attributes.ts";

// v1 types (legacy)
export type {
  // Options
  ForgeConfig,
  ForgeOptions,
  RateLimitOptions,
  // User
  ForgeUser,
  UserResponse,
  // Servers
  CreateServerData,
  ForgeServer,
  ForgeServerNetwork,
  ForgeTag,
  ServerResponse,
  ServersResponse,
  // Sites
  CreateSiteData,
  ForgeSite,
  SiteResponse,
  SitesResponse,
  // Deployments
  ForgeDeployment,
  DeploymentResponse,
  DeploymentsResponse,
  // Certificates
  CreateCertificateData,
  ForgeCertificate,
  CertificateResponse,
  CertificatesResponse,
  // Databases
  CreateDatabaseData,
  CreateDatabaseUserData,
  ForgeDatabase,
  ForgeDatabaseUser,
  DatabaseResponse,
  DatabasesResponse,
  DatabaseUserResponse,
  DatabaseUsersResponse,
  // Daemons
  CreateDaemonData,
  ForgeDaemon,
  DaemonResponse,
  DaemonsResponse,
  // Backups
  CreateBackupConfigData,
  ForgeBackup,
  ForgeBackupConfig,
  BackupConfigResponse,
  BackupConfigsResponse,
  // Commands
  CreateCommandData,
  ForgeCommand,
  CommandResponse,
  CommandsResponse,
  // Scheduled Jobs
  CreateScheduledJobData,
  ForgeScheduledJob,
  ScheduledJobResponse,
  ScheduledJobsResponse,
  // Firewall Rules
  CreateFirewallRuleData,
  ForgeFirewallRule,
  FirewallRuleResponse,
  FirewallRulesResponse,
  // SSH Keys
  CreateSshKeyData,
  ForgeSshKey,
  SshKeyResponse,
  SshKeysResponse,
  // Security Rules
  CreateSecurityRuleData,
  ForgeSecurityRule,
  SecurityRuleResponse,
  SecurityRulesResponse,
  // Redirect Rules
  CreateRedirectRuleData,
  ForgeRedirectRule,
  RedirectRuleResponse,
  RedirectRulesResponse,
  // Monitors
  CreateMonitorData,
  ForgeMonitor,
  MonitorResponse,
  MonitorsResponse,
  // Nginx Templates
  CreateNginxTemplateData,
  ForgeNginxTemplate,
  NginxTemplateResponse,
  NginxTemplatesResponse,
  // Recipes
  CreateRecipeData,
  ForgeRecipe,
  RecipeResponse,
  RecipesResponse,
} from "./types.ts";
