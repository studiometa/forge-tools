import { createCommandRouter } from "../../utils/command-router.ts";
import { daemonsList, daemonsGet, daemonsRestart } from "./handlers.ts";

export const handleDaemonsCommand = createCommandRouter({
  resource: "daemons",
  handlers: {
    list: daemonsList,
    ls: daemonsList,
    get: [daemonsGet, "args"],
    restart: [daemonsRestart, "args"],
  },
  writeSubcommands: ["restart"],
});
