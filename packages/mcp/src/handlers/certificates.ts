import * as v from "valibot";
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
  inputSchemas: {
    get: v.object({ server_id: v.string(), site_id: v.string(), domain_id: v.string() }),
    create: v.object({
      server_id: v.string(),
      site_id: v.string(),
      domain_id: v.string(),
      type: v.string(),
    }),
    delete: v.object({ server_id: v.string(), site_id: v.string(), domain_id: v.string() }),
    activate: v.object({ server_id: v.string(), site_id: v.string(), domain_id: v.string() }),
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
        return `Certificate for domain ${String(args.domain_id)} deleted.`;
      case "activate":
        return `Certificate for domain ${String(args.domain_id)} activated.`;
      /* v8 ignore next */
      default:
        return "Done.";
    }
  },
});
