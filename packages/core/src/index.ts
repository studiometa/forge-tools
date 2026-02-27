// @studiometa/forge-core
// Shared business logic — pure executor functions with injectable dependencies

export { ACTIONS, RESOURCES } from "./constants.ts";
export type { Action, Resource } from "./constants.ts";

// Audit logging
export { createAuditLogger, sanitizeArgs, getAuditLogPath } from "./logger.ts";
export type { AuditLogger, AuditLogEntry } from "./logger.ts";
export { createTestExecutorContext } from "./context.ts";
export type { ExecutorContext, ExecutorResult } from "./context.ts";
export type { Executor } from "./executors/types.ts";

// Servers
export {
  createServer,
  deleteServer,
  getServer,
  listServers,
  rebootServer,
  resolveServers,
} from "./executors/servers/index.ts";
export type {
  CreateServerOptions,
  DeleteServerOptions,
  GetServerOptions,
  ListServersOptions,
  RebootServerOptions,
  ResolveServersOptions,
  ResolveMatch,
  ResolveResult,
} from "./executors/servers/index.ts";

// Sites
export {
  createSite,
  deleteSite,
  getSite,
  listSites,
  resolveSites,
} from "./executors/sites/index.ts";
export type {
  CreateSiteOptions,
  DeleteSiteOptions,
  GetSiteOptions,
  ListSitesOptions,
  ResolveSitesOptions,
  ResolveSiteMatch,
  ResolveSiteResult,
} from "./executors/sites/index.ts";

// Deployments
export {
  deploySite,
  deploySiteAndWait,
  getDeploymentLog,
  getDeploymentOutput,
  getDeploymentScript,
  listDeployments,
  updateDeploymentScript,
} from "./executors/deployments/index.ts";
export type {
  DeployResult,
  DeploySiteAndWaitOptions,
  DeploySiteOptions,
  GetDeploymentLogOptions,
  GetDeploymentOutputOptions,
  GetDeploymentScriptOptions,
  ListDeploymentsOptions,
  UpdateDeploymentScriptOptions,
} from "./executors/deployments/index.ts";

// Certificates
export {
  activateCertificate,
  createCertificate,
  deleteCertificate,
  getCertificate,
  listCertificates,
} from "./executors/certificates/index.ts";
export type {
  ActivateCertificateOptions,
  CreateCertificateOptions,
  DeleteCertificateOptions,
  GetCertificateOptions,
  ListCertificatesOptions,
} from "./executors/certificates/index.ts";

// Databases
export {
  createDatabase,
  deleteDatabase,
  getDatabase,
  listDatabases,
} from "./executors/databases/index.ts";
export type {
  CreateDatabaseOptions,
  DeleteDatabaseOptions,
  GetDatabaseOptions,
  ListDatabasesOptions,
} from "./executors/databases/index.ts";

// Database Users
export {
  createDatabaseUser,
  deleteDatabaseUser,
  getDatabaseUser,
  listDatabaseUsers,
} from "./executors/database-users/index.ts";
export type {
  CreateDatabaseUserOptions,
  DeleteDatabaseUserOptions,
  GetDatabaseUserOptions,
  ListDatabaseUsersOptions,
} from "./executors/database-users/index.ts";

// Daemons
export {
  createDaemon,
  deleteDaemon,
  getDaemon,
  listDaemons,
  restartDaemon,
} from "./executors/daemons/index.ts";
export type {
  CreateDaemonOptions,
  DeleteDaemonOptions,
  GetDaemonOptions,
  ListDaemonsOptions,
  RestartDaemonOptions,
} from "./executors/daemons/index.ts";

// Firewall Rules
export {
  createFirewallRule,
  deleteFirewallRule,
  getFirewallRule,
  listFirewallRules,
} from "./executors/firewall-rules/index.ts";
export type {
  CreateFirewallRuleOptions,
  DeleteFirewallRuleOptions,
  GetFirewallRuleOptions,
  ListFirewallRulesOptions,
} from "./executors/firewall-rules/index.ts";

// SSH Keys
export { createSshKey, deleteSshKey, getSshKey, listSshKeys } from "./executors/ssh-keys/index.ts";
export type {
  CreateSshKeyOptions,
  DeleteSshKeyOptions,
  GetSshKeyOptions,
  ListSshKeysOptions,
} from "./executors/ssh-keys/index.ts";

// Security Rules
export {
  createSecurityRule,
  deleteSecurityRule,
  getSecurityRule,
  listSecurityRules,
} from "./executors/security-rules/index.ts";
export type {
  CreateSecurityRuleOptions,
  DeleteSecurityRuleOptions,
  GetSecurityRuleOptions,
  ListSecurityRulesOptions,
} from "./executors/security-rules/index.ts";

// Redirect Rules
export {
  createRedirectRule,
  deleteRedirectRule,
  getRedirectRule,
  listRedirectRules,
} from "./executors/redirect-rules/index.ts";
export type {
  CreateRedirectRuleOptions,
  DeleteRedirectRuleOptions,
  GetRedirectRuleOptions,
  ListRedirectRulesOptions,
} from "./executors/redirect-rules/index.ts";

// Monitors
export {
  createMonitor,
  deleteMonitor,
  getMonitor,
  listMonitors,
} from "./executors/monitors/index.ts";
export type {
  CreateMonitorOptions,
  DeleteMonitorOptions,
  GetMonitorOptions,
  ListMonitorsOptions,
} from "./executors/monitors/index.ts";

// Nginx Templates
export {
  createNginxTemplate,
  deleteNginxTemplate,
  getNginxTemplate,
  listNginxTemplates,
  updateNginxTemplate,
} from "./executors/nginx-templates/index.ts";
export type {
  CreateNginxTemplateOptions,
  DeleteNginxTemplateOptions,
  GetNginxTemplateOptions,
  ListNginxTemplatesOptions,
  UpdateNginxTemplateOptions,
} from "./executors/nginx-templates/index.ts";

// Env
export { getEnv, updateEnv } from "./executors/env/index.ts";
export type { GetEnvOptions, UpdateEnvOptions } from "./executors/env/index.ts";

// Nginx Config
export { getNginxConfig, updateNginxConfig } from "./executors/nginx/index.ts";
export type { GetNginxConfigOptions, UpdateNginxConfigOptions } from "./executors/nginx/index.ts";

// Recipes
export {
  createRecipe,
  deleteRecipe,
  getRecipe,
  listRecipes,
  runRecipe,
} from "./executors/recipes/index.ts";
export type {
  CreateRecipeOptions,
  DeleteRecipeOptions,
  GetRecipeOptions,
  ListRecipesOptions,
  RunRecipeOptions,
} from "./executors/recipes/index.ts";

// Backups
export {
  createBackupConfig,
  deleteBackupConfig,
  getBackupConfig,
  listBackupConfigs,
} from "./executors/backups/index.ts";
export type {
  CreateBackupConfigOptions,
  DeleteBackupConfigOptions,
  GetBackupConfigOptions,
  ListBackupConfigsOptions,
} from "./executors/backups/index.ts";

// Commands
export { createCommand, getCommand, listCommands } from "./executors/commands/index.ts";
export type {
  CreateCommandOptions,
  GetCommandOptions,
  ListCommandsOptions,
} from "./executors/commands/index.ts";

// Scheduled Jobs
export {
  createScheduledJob,
  deleteScheduledJob,
  getScheduledJob,
  listScheduledJobs,
} from "./executors/scheduled-jobs/index.ts";
export type {
  CreateScheduledJobOptions,
  DeleteScheduledJobOptions,
  GetScheduledJobOptions,
  ListScheduledJobsOptions,
} from "./executors/scheduled-jobs/index.ts";

// User
export { getUser } from "./executors/user/index.ts";
export type { GetUserOptions } from "./executors/user/index.ts";
