import * as v from "valibot";
import {
  createNginxTemplate,
  deleteNginxTemplate,
  getNginxTemplate,
  listNginxTemplates,
  updateNginxTemplate,
} from "@studiometa/forge-core";

import { formatNginxTemplate, formatNginxTemplateList } from "../formatters.ts";
import { getNginxTemplateHints } from "../hints.ts";
import { createResourceHandler } from "./factory.ts";

export const handleNginxTemplates = createResourceHandler({
  resource: "nginx-templates",
  actions: ["list", "get", "create", "update", "delete"],
  inputSchemas: {
    list: v.object({ server_id: v.string() }),
    get: v.object({ server_id: v.string(), id: v.string() }),
    create: v.object({ server_id: v.string(), name: v.string(), content: v.string() }),
    update: v.object({ server_id: v.string(), id: v.string() }),
    delete: v.object({ server_id: v.string(), id: v.string() }),
  },
  executors: {
    list: listNginxTemplates,
    get: getNginxTemplate,
    create: createNginxTemplate,
    update: updateNginxTemplate,
    delete: deleteNginxTemplate,
  },
  hints: (_data, id, args) => getNginxTemplateHints(String(args.server_id), id),
  formatResult: (action, data, args) => {
    switch (action) {
      case "list":
        return formatNginxTemplateList(data);
      case "get":
        return formatNginxTemplate(data);
      case "create":
        return formatNginxTemplate(data);
      case "update":
        return formatNginxTemplate(data);
      case "delete":
        return `Nginx template ${args.id} deleted.`;
      /* v8 ignore next */
      default:
        return "Done.";
    }
  },
});
