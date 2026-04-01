import { createCommandRouter } from "../../utils/command-router.ts";
import {
  securityRulesCreate,
  securityRulesDelete,
  securityRulesGet,
  securityRulesList,
  securityRulesUpdate,
} from "./handlers.ts";

export const handleSecurityRulesCommand = createCommandRouter({
  resource: "security-rules",
  handlers: {
    list: securityRulesList,
    ls: securityRulesList,
    get: [securityRulesGet, "args"],
    create: securityRulesCreate,
    update: [securityRulesUpdate, "args"],
    delete: [securityRulesDelete, "args"],
  },
  writeSubcommands: ["create", "update", "delete"],
});
