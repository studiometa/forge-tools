import { createCommandRouter } from "../../utils/command-router.ts";
import { commandsCreate, commandsGet, commandsList } from "./handlers.ts";

export const handleCommandsCommand = createCommandRouter({
  resource: "commands",
  handlers: {
    list: commandsList,
    ls: commandsList,
    get: [commandsGet, "args"],
    create: commandsCreate,
  },
  writeSubcommands: ["create"],
});
