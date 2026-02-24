import { createCommandRouter } from "../../utils/command-router.ts";
import { envGet, envUpdate } from "./handlers.ts";

export const handleEnvCommand = createCommandRouter({
  resource: "env",
  handlers: {
    get: envGet,
    update: envUpdate,
  },
});
