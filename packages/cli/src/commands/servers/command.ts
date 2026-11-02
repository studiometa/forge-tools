import { createCommandRouter } from "../../utils/command-router.ts";
import { serversList, serversGet, serversCreate, serversReboot } from "./handlers.ts";

export const handleServersCommand = createCommandRouter({
  resource: "servers",
  handlers: {
    list: serversList,
    ls: serversList,
    get: [serversGet, "args"],
    create: serversCreate,
    reboot: [serversReboot, "args"],
  },
  writeSubcommands: ["create", "reboot"],
});
