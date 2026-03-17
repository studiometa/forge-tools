import {
  activateCertificate,
  createCertificate,
  deleteCertificate,
  getCertificate,
  listCertificates,
} from "@studiometa/forge-core";

import { formatCertificate, formatCertificateList } from "../formatters.ts";
import { getCertificateHints } from "../hints.ts";
import { createResourceHandler } from "./factory.ts";

export const handleCertificates = createResourceHandler({
  resource: "certificates",
  actions: ["list", "get", "create", "delete", "activate"],
  requiredFields: {
    list: ["server_id", "site_id"],
    get: ["server_id", "site_id", "id"],
    create: ["server_id", "site_id", "domain"],
    delete: ["server_id", "site_id", "id"],
    activate: ["server_id", "site_id", "id"],
  },
  executors: {
    list: listCertificates,
    get: getCertificate,
    create: createCertificate,
    delete: deleteCertificate,
    activate: activateCertificate,
  },
  hints: (_data, id, args) => getCertificateHints(String(args.server_id), String(args.site_id), id),
  formatResult: (action, data, args) => {
    switch (action) {
      case "list":
        return formatCertificateList(data);
      case "get":
        return formatCertificate(data);
      case "create":
        return formatCertificate(data);
      case "delete":
        return `Certificate ${args.id} deleted.`;
      case "activate":
        return `Certificate ${args.id} activated.`;
      /* v8 ignore next */
      default:
        return "Done.";
    }
  },
});
