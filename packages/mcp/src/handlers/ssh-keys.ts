import { createSshKey, deleteSshKey, getSshKey, listSshKeys } from "@studiometa/forge-core";

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
  hints: (_data, id, args) => getSshKeyHints(String(args.server_id), id),
  formatResult: (action, data, args) => {
    switch (action) {
      case "list":
        return formatSshKeyList(data);
      case "get":
        return formatSshKey(data);
      case "create":
        return formatSshKey(data);
      case "delete":
        return `SSH key ${args.id} deleted.`;
      /* v8 ignore next */
      default:
        return "Done.";
    }
  },
});
