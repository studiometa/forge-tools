import { createCommandRouter } from "../../utils/command-router.ts";
import { nginxGet, nginxUpdate } from "./handlers.ts";

export const handleNginxCommand = createCommandRouter({
  resource: "nginx",
  handlers: {
    get: nginxGet,
    update: nginxUpdate,
  },
});
