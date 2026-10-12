/**
 * Option types for PHP executors.
 */

/**
 * The PHP configuration files that Forge can read and write.
 */
export const PHP_CONFIG_TYPES = ["cli", "fpm", "pool"] as const;

export type PhpConfigType = (typeof PHP_CONFIG_TYPES)[number];

/**
 * Options for server-level PHP executors (versions list, limits, OPcache).
 */
export interface PhpServerOptions {
  server_id: string;
}

/**
 * Options for getting one installed PHP version.
 */
export interface GetPhpVersionOptions {
  server_id: string;
  /** PHP version ID, or a version such as "8.3", "php83" or "php8.3". */
  version: string;
}

/**
 * Options for getting a PHP configuration file.
 */
export interface GetPhpConfigOptions {
  server_id: string;
  /** PHP version ID, or a version such as "8.3", "php83" or "php8.3". */
  version: string;
  /** One of: cli, fpm, pool. */
  type: string;
  /** Unix user of the FPM pool (pool only). */
  user?: string;
}

/**
 * Options for updating a PHP configuration file.
 */
export interface UpdatePhpConfigOptions extends GetPhpConfigOptions {
  content: string;
}

/**
 * Options for setting the PHP max upload size.
 */
export interface UpdatePhpMaxUploadSizeOptions {
  server_id: string;
  /** Size in megabytes. */
  size: number;
}

/**
 * Options for setting the PHP max execution time.
 */
export interface UpdatePhpMaxExecutionTimeOptions {
  server_id: string;
  /** Time in seconds. */
  seconds: number;
}
