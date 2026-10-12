import * as v from "valibot";
import type { ExecutorContext, ExecutorResult } from "@studiometa/forge-core";
import {
  disablePhpOpcache,
  enablePhpOpcache,
  getPhpConfig,
  getPhpMaxExecutionTime,
  getPhpMaxUploadSize,
  getPhpOpcache,
  getPhpVersion,
  listPhpVersions,
  PHP_CONFIG_TYPES,
  updatePhpConfig,
  updatePhpMaxExecutionTime,
  updatePhpMaxUploadSize,
} from "@studiometa/forge-core";

import { formatPhpVersion, formatPhpVersionList } from "../formatters.ts";
import { createResourceHandler } from "./factory.ts";

/**
 * Options after input validation: `setting` picks what `get` reads and `update` writes.
 */
interface PhpOptions {
  server_id: string;
  setting: string;
  version?: string;
  type?: string;
  user?: string;
  content?: string;
  value?: number;
  enabled?: boolean;
}

const configFields = {
  server_id: v.string(),
  setting: v.literal("config"),
  version: v.string(),
  type: v.picklist(PHP_CONFIG_TYPES),
  user: v.optional(v.string()),
};

/**
 * Read one PHP setting. Scalar settings are wrapped in an object for JSON output.
 */
async function getPhpSetting(
  options: PhpOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<unknown>> {
  const { server_id } = options;
  switch (options.setting) {
    case "version":
      return getPhpVersion({ server_id, version: options.version! }, ctx);
    case "config":
      return getPhpConfig(
        { server_id, version: options.version!, type: options.type!, user: options.user },
        ctx,
      );
    case "max-upload-size":
      return { data: { max_upload_size: (await getPhpMaxUploadSize({ server_id }, ctx)).data } };
    case "max-execution-time":
      return {
        data: { max_execution_time: (await getPhpMaxExecutionTime({ server_id }, ctx)).data },
      };
    default:
      return { data: { opcache_enabled: (await getPhpOpcache({ server_id }, ctx)).data } };
  }
}

/**
 * Write one PHP setting.
 */
function updatePhpSetting(
  options: PhpOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  const { server_id } = options;
  switch (options.setting) {
    case "config":
      return updatePhpConfig(
        {
          server_id,
          version: options.version!,
          type: options.type!,
          content: options.content!,
          user: options.user,
        },
        ctx,
      );
    case "max-upload-size":
      return updatePhpMaxUploadSize({ server_id, size: options.value! }, ctx);
    case "max-execution-time":
      return updatePhpMaxExecutionTime({ server_id, seconds: options.value! }, ctx);
    default:
      return options.enabled
        ? enablePhpOpcache({ server_id }, ctx)
        : disablePhpOpcache({ server_id }, ctx);
  }
}

/**
 * Format the result of a `get` for compact output.
 */
function formatGet(data: unknown, args: Record<string, unknown>): string {
  switch (args.setting) {
    case "version":
      return formatPhpVersion(data as Parameters<typeof formatPhpVersion>[0]);
    case "config":
      return `PHP ${String(args.type)} configuration:\n${String(data)}`;
    case "max-upload-size":
      return `PHP max upload size: ${(data as { max_upload_size: string }).max_upload_size} MB`;
    case "max-execution-time":
      return `PHP max execution time: ${(data as { max_execution_time: string }).max_execution_time} seconds`;
    default:
      return `OPcache is ${(data as { opcache_enabled: boolean }).opcache_enabled ? "enabled" : "disabled"}.`;
  }
}

/**
 * Format the confirmation of an `update`.
 */
function formatUpdate(args: Record<string, unknown>): string {
  switch (args.setting) {
    case "config":
      return `PHP ${String(args.type)} configuration updated.`;
    case "max-upload-size":
      return `PHP max upload size set to ${String(args.value)} MB.`;
    case "max-execution-time":
      return `PHP max execution time set to ${String(args.value)} seconds.`;
    default:
      return `OPcache ${args.enabled ? "enabled" : "disabled"}.`;
  }
}

export const handlePhp = createResourceHandler({
  resource: "php",
  actions: ["list", "get", "update"],
  inputSchemas: {
    list: v.object({ server_id: v.string() }),
    get: v.variant("setting", [
      v.object({ server_id: v.string(), setting: v.literal("version"), version: v.string() }),
      v.object(configFields),
      v.object({
        server_id: v.string(),
        setting: v.picklist(["max-upload-size", "max-execution-time", "opcache"]),
      }),
    ]),
    update: v.variant("setting", [
      v.object({ ...configFields, content: v.string() }),
      v.object({
        server_id: v.string(),
        setting: v.picklist(["max-upload-size", "max-execution-time"]),
        value: v.pipe(v.number(), v.integer(), v.minValue(0)),
      }),
      v.object({ server_id: v.string(), setting: v.literal("opcache"), enabled: v.boolean() }),
    ]),
  },
  executors: {
    list: listPhpVersions,
    get: getPhpSetting,
    update: updatePhpSetting,
  },
  formatResult: (action, data, args) => {
    switch (action) {
      case "list":
        return formatPhpVersionList(data);
      case "get":
        return formatGet(data, args);
      default:
        return formatUpdate(args);
    }
  },
});
