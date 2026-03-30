import * as v from "valibot";
import { createSshKey, deleteSshKey, getSshKey, listSshKeys } from "@studiometa/forge-core";

import { formatSshKey, formatSshKeyList } from "../formatters.ts";
import { getSshKeyHints } from "../hints.ts";
import { createResourceHandler } from "./factory.ts";

export const handleSshKeys = createResourceHandler({
  resource: "ssh-keys",
  actions: ["list", "get", "create", "delete"],
  inputSchemas: {
    list: v.object({ server_id: v.string() }),
    get: v.object({ server_id: v.string(), id: v.string() }),
    create: v.object({ server_id: v.string(), name: v.string(), key: v.string() }),
    delete: v.object({ server_id: v.string(), id: v.string() }),
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
        return "Done.";
      case "delete":
        return `SSH key ${args.id} deleted.`;
      /* v8 ignore next */
      default:
        return "Done.";
    }
  },
});
