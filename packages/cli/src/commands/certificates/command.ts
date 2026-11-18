import { createCommandRouter } from "../../utils/command-router.ts";
import {
  certificatesActivate,
  certificatesCreate,
  certificatesDeactivate,
  certificatesDelete,
  certificatesGet,
  certificatesList,
} from "./handlers.ts";

export const handleCertificatesCommand = createCommandRouter({
  resource: "certificates",
  handlers: {
    list: certificatesList,
    ls: certificatesList,
    get: [certificatesGet, "args"],
    create: certificatesCreate,
    delete: [certificatesDelete, "args"],
    activate: [certificatesActivate, "args"],
    deactivate: [certificatesDeactivate, "args"],
  },
  writeSubcommands: ["create", "delete", "activate", "deactivate"],
});
