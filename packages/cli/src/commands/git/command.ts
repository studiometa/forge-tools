import { createCommandRouter } from "../../utils/command-router.ts";
import { gitUpdate } from "./handlers.ts";

export const handleGitCommand = createCommandRouter({
  resource: "git",
  handlers: {
    update: gitUpdate,
  },
  writeSubcommands: ["update"],
});
