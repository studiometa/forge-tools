import { createCommandRouter } from "../../utils/command-router.ts";
import { userGet } from "./handlers.ts";

export const handleUserCommand = createCommandRouter({
  resource: "user",
  handlers: {
    get: userGet,
  },
});
