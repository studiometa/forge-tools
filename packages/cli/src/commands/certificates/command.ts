import { createCommandRouter } from "../../utils/command-router.ts";
import { certificatesList, certificatesGet, certificatesActivate } from "./handlers.ts";

export const handleCertificatesCommand = createCommandRouter({
  resource: "certificates",
  handlers: {
    list: certificatesList,
    ls: certificatesList,
    get: [certificatesGet, "args"],
    activate: [certificatesActivate, "args"],
  },
  writeSubcommands: ["activate"],
});
