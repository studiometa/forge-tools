import { createCommandRouter } from "../../utils/command-router.ts";
import { daemonsList, daemonsGet, daemonsRestart, daemonsUpdate } from "./handlers.ts";

export const handleDaemonsCommand = createCommandRouter({
  resource: "daemons",
  handlers: {
    list: daemonsList,
    ls: daemonsList,
    get: [daemonsGet, "args"],
    restart: [daemonsRestart, "args"],
    update: [daemonsUpdate, "args"],
  },
  writeSubcommands: ["restart", "update"],
});
