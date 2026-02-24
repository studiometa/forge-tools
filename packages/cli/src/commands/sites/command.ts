import { createCommandRouter } from "../../utils/command-router.ts";
import { sitesList, sitesGet } from "./handlers.ts";

export const handleSitesCommand = createCommandRouter({
  resource: "sites",
  handlers: {
    list: sitesList,
    ls: sitesList,
    get: [sitesGet, "args"],
  },
});
