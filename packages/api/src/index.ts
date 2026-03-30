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
  SiteRepository,
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
  EnvironmentAttributes,
} from "./types/v2-attributes.ts";

// Config and input types
export type {
  ForgeConfig,
  ForgeOptions,
  RateLimitOptions,
  // Create input types (used by core executors)
  CreateServerData,
  CreateSiteData,
  CreateCertificateData,
  CreateDatabaseData,
  CreateDatabaseUserData,
  CreateDaemonData,
  CreateBackupConfigData,
  CreateCommandData,
  CreateScheduledJobData,
  CreateFirewallRuleData,
  CreateSshKeyData,
  CreateSecurityRuleData,
  CreateRedirectRuleData,
  CreateMonitorData,
  CreateNginxTemplateData,
  CreateRecipeData,
} from "./types.ts";
