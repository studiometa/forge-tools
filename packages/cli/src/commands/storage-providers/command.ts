import { createCommandRouter } from "../../utils/command-router.ts";
import {
  storageProvidersCreate,
  storageProvidersDelete,
  storageProvidersGet,
  storageProvidersList,
} from "./handlers.ts";

export const handleStorageProvidersCommand = createCommandRouter({
  resource: "storage-providers",
  handlers: {
    list: storageProvidersList,
    ls: storageProvidersList,
    get: [storageProvidersGet, "args"],
    create: storageProvidersCreate,
    delete: [storageProvidersDelete, "args"],
  },
  writeSubcommands: ["create", "delete"],
});
