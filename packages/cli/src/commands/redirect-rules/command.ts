import { createCommandRouter } from "../../utils/command-router.ts";
import {
  redirectRulesCreate,
  redirectRulesDelete,
  redirectRulesGet,
  redirectRulesList,
} from "./handlers.ts";

export const handleRedirectRulesCommand = createCommandRouter({
  resource: "redirect-rules",
  handlers: {
    list: redirectRulesList,
    ls: redirectRulesList,
    get: [redirectRulesGet, "args"],
    create: redirectRulesCreate,
    delete: [redirectRulesDelete, "args"],
  },
});
