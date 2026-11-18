import { createCommandRouter } from "../../utils/command-router.ts";
import { networkGet, networkUpdate } from "./handlers.ts";

export const handleNetworkCommand = createCommandRouter({
  resource: "network",
  handlers: {
    get: networkGet,
    update: networkUpdate,
  },
  writeSubcommands: ["update"],
});
