import { createCommandRouter } from "../../utils/command-router.ts";
import {
  nginxTemplatesCreate,
  nginxTemplatesDelete,
  nginxTemplatesGet,
  nginxTemplatesList,
  nginxTemplatesUpdate,
} from "./handlers.ts";

export const handleNginxTemplatesCommand = createCommandRouter({
  resource: "nginx-templates",
  handlers: {
    list: nginxTemplatesList,
    ls: nginxTemplatesList,
    get: [nginxTemplatesGet, "args"],
    create: nginxTemplatesCreate,
    update: [nginxTemplatesUpdate, "args"],
    delete: [nginxTemplatesDelete, "args"],
  },
  writeSubcommands: ["create", "update", "delete"],
});
