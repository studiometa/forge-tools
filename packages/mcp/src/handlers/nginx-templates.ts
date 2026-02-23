import {
  createNginxTemplate,
  deleteNginxTemplate,
  getNginxTemplate,
  listNginxTemplates,
  updateNginxTemplate,
} from "@studiometa/forge-core";

import { createResourceHandler } from "./factory.ts";

export const handleNginxTemplates = createResourceHandler({
  resource: "nginx-templates",
  actions: ["list", "get", "create", "update", "delete"],
  requiredFields: {
    list: ["server_id"],
    get: ["server_id", "id"],
    create: ["server_id", "name", "content"],
    update: ["server_id", "id"],
    delete: ["server_id", "id"],
  },
  executors: {
    list: listNginxTemplates,
    get: getNginxTemplate,
    create: createNginxTemplate,
    update: updateNginxTemplate,
    delete: deleteNginxTemplate,
  },
});
