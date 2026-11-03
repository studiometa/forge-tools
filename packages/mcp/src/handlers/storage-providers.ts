import * as v from "valibot";
import { STORAGE_PROVIDER_TYPES } from "@studiometa/forge-api";
import {
  createStorageProvider,
  deleteStorageProvider,
  getStorageProvider,
  listStorageProviders,
} from "@studiometa/forge-core";

import { formatStorageProvider, formatStorageProviderList } from "../formatters.ts";
import { createResourceHandler } from "./factory.ts";

export const handleStorageProviders = createResourceHandler({
  resource: "storage-providers",
  actions: ["list", "get", "create", "delete"],
  inputSchemas: {
    get: v.object({ id: v.string() }),
    create: v.object({
      name: v.string(),
      provider: v.picklist(STORAGE_PROVIDER_TYPES),
      region: v.optional(v.string()),
      bucket: v.optional(v.nullable(v.string())),
      directory: v.optional(v.nullable(v.string())),
      endpoint: v.optional(v.string()),
      access_key: v.optional(v.nullable(v.string())),
      secret_key: v.optional(v.nullable(v.string())),
      assume_role: v.optional(v.boolean()),
    }),
    delete: v.object({ id: v.string() }),
  },
  executors: {
    list: listStorageProviders,
    get: getStorageProvider,
    create: createStorageProvider,
    delete: deleteStorageProvider,
  },
  formatResult: (action, data, args) => {
    switch (action) {
      case "list":
        return formatStorageProviderList(data);
      case "get":
      case "create":
        return formatStorageProvider(data);
      case "delete":
        return `Storage provider ${args.id} deleted.`;
      /* v8 ignore next */
      default:
        return "Done.";
    }
  },
});
