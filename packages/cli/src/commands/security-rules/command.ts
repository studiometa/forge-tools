import { createCommandRouter } from "../../utils/command-router.ts";
import {
  securityRulesCreate,
  securityRulesDelete,
  securityRulesGet,
  securityRulesList,
} from "./handlers.ts";

export const handleSecurityRulesCommand = createCommandRouter({
  resource: "security-rules",
  handlers: {
    list: securityRulesList,
    ls: securityRulesList,
    get: [securityRulesGet, "args"],
    create: securityRulesCreate,
    delete: [securityRulesDelete, "args"],
  },
  writeSubcommands: ["create", "delete"],
});
