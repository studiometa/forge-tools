import { createCommandRouter } from "../../utils/command-router.ts";
import { certificatesGet, certificatesActivate } from "./handlers.ts";

export const handleCertificatesCommand = createCommandRouter({
  resource: "certificates",
  handlers: {
    get: [certificatesGet, "args"],
    activate: [certificatesActivate, "args"],
  },
  writeSubcommands: ["activate"],
});
