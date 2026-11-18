import { createCommandRouter } from "../../utils/command-router.ts";
import { deployKeyCreate, deployKeyDelete, deployKeyGet } from "./handlers.ts";

export const handleDeployKeyCommand = createCommandRouter({
  resource: "deploy-key",
  handlers: {
    get: deployKeyGet,
    create: deployKeyCreate,
    delete: deployKeyDelete,
  },
  writeSubcommands: ["create", "delete"],
});
