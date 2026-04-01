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

// JSON:API schemas + types (v2)
export {
  JsonApiResourceIdentifierSchema,
  JsonApiRelationshipSchema,
  JsonApiLinkSchema,
  JsonApiPaginationLinksSchema,
  JsonApiPaginationMetaSchema,
  jsonApiResourceSchema,
  jsonApiDocumentSchema,
  jsonApiListDocumentSchema,
} from "./schemas/jsonapi.ts";

export type {
  JsonApiResource,
  JsonApiRelationship,
  JsonApiResourceIdentifier,
  JsonApiLink,
  JsonApiDocument,
  JsonApiListDocument,
  JsonApiPaginationLinks,
  JsonApiPaginationMeta,
} from "./schemas/jsonapi.ts";

// v2 resource attribute schemas + types
export {
  UserAttributesSchema,
  ServerAttributesSchema,
  SiteAttributesSchema,
  SiteRepositorySchema,
  DeploymentAttributesSchema,
  DeploymentCommitSchema,
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
} from "./schemas/attributes.ts";

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
} from "./schemas/attributes.ts";

// Create data schemas + types
export {
  CreateServerDataSchema,
  CreateSiteDataSchema,
  CreateCertificateDataSchema,
  CreateDatabaseDataSchema,
  CreateDatabaseUserDataSchema,
  CreateDaemonDataSchema,
  CreateBackupConfigDataSchema,
  UpdateBackupConfigDataSchema,
  CreateCommandDataSchema,
  CreateScheduledJobDataSchema,
  CreateFirewallRuleDataSchema,
  CreateSshKeyDataSchema,
  CreateSecurityRuleDataSchema,
  CreateRedirectRuleDataSchema,
  CreateMonitorDataSchema,
  CreateNginxTemplateDataSchema,
  CreateRecipeDataSchema,
} from "./schemas/types.ts";

export type {
  CreateServerData,
  CreateSiteData,
  CreateCertificateData,
  CreateDatabaseData,
  CreateDatabaseUserData,
  CreateDaemonData,
  CreateBackupConfigData,
  UpdateBackupConfigData,
  CreateCommandData,
  CreateScheduledJobData,
  CreateFirewallRuleData,
  CreateSshKeyData,
  CreateSecurityRuleData,
  CreateRedirectRuleData,
  CreateMonitorData,
  CreateNginxTemplateData,
  CreateRecipeData,
} from "./schemas/types.ts";

// Config and options types
export type { ForgeConfig, ForgeOptions, RateLimitOptions } from "./types.ts";
