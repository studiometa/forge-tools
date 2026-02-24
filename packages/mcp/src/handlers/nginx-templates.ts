import {
  createNginxTemplate,
  deleteNginxTemplate,
  getNginxTemplate,
  listNginxTemplates,
  updateNginxTemplate,
} from "@studiometa/forge-core";

import type { ForgeNginxTemplate } from "@studiometa/forge-api";

import { formatNginxTemplate, formatNginxTemplateList } from "../formatters.ts";
import { getNginxTemplateHints } from "../hints.ts";
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
  hints: (data, id) => {
    const template = data as ForgeNginxTemplate;
    return getNginxTemplateHints(String(template.server_id), id);
  },
  formatResult: (action, data, args) => {
    switch (action) {
      case "list":
        return formatNginxTemplateList(data as ForgeNginxTemplate[]);
      case "get":
        return formatNginxTemplate(data as ForgeNginxTemplate);
      case "create":
        return formatNginxTemplate(data as ForgeNginxTemplate);
      case "update":
        return formatNginxTemplate(data as ForgeNginxTemplate);
      case "delete":
        return `Nginx template ${args.id} deleted.`;
      default:
        return "Done.";
    }
  },
});
