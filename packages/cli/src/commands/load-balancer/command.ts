import { createCommandRouter } from "../../utils/command-router.ts";
import { loadBalancerApply } from "./apply/handler.ts";

export const handleLoadBalancerCommand = createCommandRouter({
  resource: "load-balancer",
  handlers: {
    apply: (ctx) => loadBalancerApply(ctx),
  },
  writeSubcommands: ["apply"],
});
