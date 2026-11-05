import { createCommandRouter } from "../../utils/command-router.ts";
import { sitesApply } from "./apply/handler.ts";
import { sitesList, sitesGet, sitesUpdate } from "./handlers.ts";

export const handleSitesCommand = createCommandRouter({
  resource: "sites",
  handlers: {
    list: sitesList,
    ls: sitesList,
    get: [sitesGet, "args"],
    update: [sitesUpdate, "args"],
    apply: (ctx) => sitesApply(ctx),
  },
  writeSubcommands: ["apply"],
});
