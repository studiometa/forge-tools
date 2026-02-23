// @studiometa/forge-core
// Shared business logic — pure executor functions with injectable dependencies

export { ACTIONS, RESOURCES } from "./constants.ts";
export type { Action, Resource } from "./constants.ts";
export { createTestExecutorContext } from "./context.ts";
export type { ExecutorContext, ExecutorResult } from "./context.ts";

// Servers
export {
  createServer,
  deleteServer,
  getServer,
  listServers,
  rebootServer,
} from "./executors/servers/index.ts";

// Sites
export { createSite, deleteSite, getSite, listSites } from "./executors/sites/index.ts";

// Deployments
export {
  deploySite,
  getDeploymentOutput,
  getDeploymentScript,
  listDeployments,
  updateDeploymentScript,
} from "./executors/deployments/index.ts";

// Certificates
export {
  activateCertificate,
  createCertificate,
  deleteCertificate,
  getCertificate,
  listCertificates,
} from "./executors/certificates/index.ts";

// Databases
export {
  createDatabase,
  deleteDatabase,
  getDatabase,
  listDatabases,
} from "./executors/databases/index.ts";

// Daemons
export {
  createDaemon,
  deleteDaemon,
  getDaemon,
  listDaemons,
  restartDaemon,
} from "./executors/daemons/index.ts";

// Firewall Rules
export {
  createFirewallRule,
  deleteFirewallRule,
  getFirewallRule,
  listFirewallRules,
} from "./executors/firewall-rules/index.ts";

// SSH Keys
export { createSshKey, deleteSshKey, getSshKey, listSshKeys } from "./executors/ssh-keys/index.ts";

// Security Rules
export {
  createSecurityRule,
  deleteSecurityRule,
  getSecurityRule,
  listSecurityRules,
} from "./executors/security-rules/index.ts";

// Redirect Rules
export {
  createRedirectRule,
  deleteRedirectRule,
  getRedirectRule,
  listRedirectRules,
} from "./executors/redirect-rules/index.ts";

// Monitors
export {
  createMonitor,
  deleteMonitor,
  getMonitor,
  listMonitors,
} from "./executors/monitors/index.ts";

// Nginx Templates
export {
  createNginxTemplate,
  deleteNginxTemplate,
  getNginxTemplate,
  listNginxTemplates,
  updateNginxTemplate,
} from "./executors/nginx-templates/index.ts";

// Env
export { getEnv, updateEnv } from "./executors/env/index.ts";

// Nginx Config
export { getNginxConfig, updateNginxConfig } from "./executors/nginx/index.ts";

// Recipes
export {
  createRecipe,
  deleteRecipe,
  getRecipe,
  listRecipes,
  runRecipe,
} from "./executors/recipes/index.ts";
