import { createSshKey, deleteSshKey, getSshKey, listSshKeys } from "@studiometa/forge-core";

import type { ForgeSshKey } from "@studiometa/forge-api";

import { formatSshKey, formatSshKeyList } from "../formatters.ts";
import { getSshKeyHints } from "../hints.ts";
import { createResourceHandler } from "./factory.ts";

export const handleSshKeys = createResourceHandler({
  resource: "ssh-keys",
  actions: ["list", "get", "create", "delete"],
  requiredFields: {
    list: ["server_id"],
    get: ["server_id", "id"],
    create: ["server_id", "name", "key"],
    delete: ["server_id", "id"],
  },
  executors: {
    list: listSshKeys,
    get: getSshKey,
    create: createSshKey,
    delete: deleteSshKey,
  },
  hints: (data, id) => {
    const key = data as ForgeSshKey;
    return getSshKeyHints(String(key.server_id), id);
  },
  formatResult: (action, data, args) => {
    switch (action) {
      case "list":
        return formatSshKeyList(data as ForgeSshKey[]);
      case "get":
        return formatSshKey(data as ForgeSshKey);
      case "create":
        return formatSshKey(data as ForgeSshKey);
      case "delete":
        return `SSH key ${args.id} deleted.`;
      /* v8 ignore next */
      default:
        return "Done.";
    }
  },
});
