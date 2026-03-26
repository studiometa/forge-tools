import {
  activateCertificate,
  createCertificate,
  deleteCertificate,
  getCertificate,
} from "@studiometa/forge-core";

import { formatCertificate } from "../formatters.ts";
import { getCertificateHints } from "../hints.ts";
import { createResourceHandler } from "./factory.ts";

export const handleCertificates = createResourceHandler({
  resource: "certificates",
  actions: ["get", "create", "delete", "activate"],
  requiredFields: {
    get: ["server_id", "site_id", "domain_id"],
    create: ["server_id", "site_id", "domain_id", "type"],
    delete: ["server_id", "site_id", "domain_id"],
    activate: ["server_id", "site_id", "domain_id"],
  },
  executors: {
    get: getCertificate,
    create: createCertificate,
    delete: deleteCertificate,
    activate: activateCertificate,
  },
  hints: (_data, _id, args) =>
    getCertificateHints(String(args.server_id), String(args.site_id), String(args.domain_id)),
  formatResult: (action, data, args) => {
    switch (action) {
      case "get":
        return formatCertificate(data);
      case "create":
        return formatCertificate(data);
      case "delete":
        return `Certificate for domain ${args.domain_id} deleted.`;
      case "activate":
        return `Certificate for domain ${args.domain_id} activated.`;
      /* v8 ignore next */
      default:
        return "Done.";
    }
  },
});
