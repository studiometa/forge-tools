import { createCommandRouter } from "../../utils/command-router.ts";
import { databasesList, databasesGet } from "./handlers.ts";

export const handleDatabasesCommand = createCommandRouter({
  resource: "databases",
  handlers: {
    list: databasesList,
    ls: databasesList,
    get: [databasesGet, "args"],
  },
});
