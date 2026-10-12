export { getPhpConfig, updatePhpConfig } from "./config.ts";
export {
  getPhpMaxExecutionTime,
  getPhpMaxUploadSize,
  updatePhpMaxExecutionTime,
  updatePhpMaxUploadSize,
} from "./limits.ts";
export { disablePhpOpcache, enablePhpOpcache, getPhpOpcache } from "./opcache.ts";
export { getPhpVersion, listPhpVersions, resolvePhpVersionId } from "./versions.ts";
export { PHP_CONFIG_TYPES } from "./types.ts";
export type {
  GetPhpConfigOptions,
  GetPhpVersionOptions,
  PhpConfigType,
  PhpServerOptions,
  UpdatePhpConfigOptions,
  UpdatePhpMaxExecutionTimeOptions,
  UpdatePhpMaxUploadSizeOptions,
} from "./types.ts";
