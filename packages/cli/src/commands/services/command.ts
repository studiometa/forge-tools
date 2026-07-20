import { createCommandRouter } from "../../utils/command-router.ts";
import { servicesList, servicesRestart } from "./handlers.ts";

export const handleServicesCommand = createCommandRouter({
  resource: "services",
  handlers: {
    list: [servicesList, "args"],
    ls: [servicesList, "args"],
    restart: [servicesRestart, "args"],
  },
  writeSubcommands: ["restart"],
});
