import { createCommandRouter } from "../../utils/command-router.ts";
import { serversList, serversGet, serversReboot } from "./handlers.ts";

export const handleServersCommand = createCommandRouter({
  resource: "servers",
  handlers: {
    list: serversList,
    ls: serversList,
    get: [serversGet, "args"],
    reboot: [serversReboot, "args"],
  },
});
