import { createCommandRouter } from "../../utils/command-router.ts";
import {
  redirectRulesCreate,
  redirectRulesDelete,
  redirectRulesExport,
  redirectRulesGet,
  redirectRulesImport,
  redirectRulesList,
  redirectRulesReorder,
} from "./handlers.ts";

export const handleRedirectRulesCommand = createCommandRouter({
  resource: "redirect-rules",
  handlers: {
    list: redirectRulesList,
    ls: redirectRulesList,
    get: [redirectRulesGet, "args"],
    create: redirectRulesCreate,
    delete: [redirectRulesDelete, "args"],
    export: redirectRulesExport,
    import: redirectRulesImport,
    reorder: redirectRulesReorder,
  },
  writeSubcommands: ["create", "delete", "import", "reorder"],
});
