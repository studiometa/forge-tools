import { createCommandRouter } from "../../utils/command-router.ts";
import { monitorsCreate, monitorsDelete, monitorsGet, monitorsList } from "./handlers.ts";

export const handleMonitorsCommand = createCommandRouter({
  resource: "monitors",
  handlers: {
    list: monitorsList,
    ls: monitorsList,
    get: [monitorsGet, "args"],
    create: monitorsCreate,
    delete: [monitorsDelete, "args"],
  },
});
