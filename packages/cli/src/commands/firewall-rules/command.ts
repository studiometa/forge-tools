import { createCommandRouter } from "../../utils/command-router.ts";
import { firewallRulesList, firewallRulesGet } from "./handlers.ts";

export const handleFirewallRulesCommand = createCommandRouter({
  resource: "firewall-rules",
  handlers: {
    list: firewallRulesList,
    ls: firewallRulesList,
    get: [firewallRulesGet, "args"],
  },
});
