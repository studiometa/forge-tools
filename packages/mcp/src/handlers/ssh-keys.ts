import { createSshKey, deleteSshKey, getSshKey, listSshKeys } from "@studiometa/forge-core";

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
});
