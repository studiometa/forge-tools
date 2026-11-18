import * as v from "valibot";
import {
  activateCertificate,
  createCertificate,
  deactivateCertificate,
  deleteCertificate,
  getCertificate,
  listCertificates,
} from "@studiometa/forge-core";

import { formatCertificate, formatCertificateList } from "../formatters.ts";
import { getCertificateHints } from "../hints.ts";
import { createResourceHandler } from "./factory.ts";

const domainArgs = { server_id: v.string(), site_id: v.string(), domain_id: v.string() };

export const handleCertificates = createResourceHandler({
  resource: "certificates",
  actions: ["list", "get", "create", "delete", "activate", "deactivate"],
  inputSchemas: {
    list: v.object({
      server_id: v.string(),
      site_id: v.string(),
      domain_id: v.optional(v.string()),
    }),
    get: v.object({ ...domainArgs, id: v.optional(v.string()) }),
    create: v.object({ ...domainArgs, type: v.string() }),
    delete: v.object({ ...domainArgs, id: v.string() }),
    activate: v.object({ ...domainArgs, id: v.string() }),
    deactivate: v.object({ ...domainArgs, id: v.string() }),
  },
  executors: {
    list: listCertificates,
    get: getCertificate,
    create: createCertificate,
    delete: deleteCertificate,
    activate: activateCertificate,
    deactivate: deactivateCertificate,
  },
  hints: (data, _id, args) =>
    getCertificateHints(
      String(args.server_id),
      String(args.site_id),
      String(args.domain_id),
      String((data as { id: number }).id),
    ),
  formatResult: (action, data, args) => {
    switch (action) {
      case "list":
        return formatCertificateList(data);
      case "get":
      case "create":
        return formatCertificate(data);
      case "delete":
        return `Certificate ${String(args.id)} of domain ${String(args.domain_id)} deleted.`;
      case "activate":
        return `Certificate ${String(args.id)} of domain ${String(args.domain_id)} activated.`;
      case "deactivate":
        return `Certificate ${String(args.id)} of domain ${String(args.domain_id)} deactivated.`;
      /* v8 ignore next */
      default:
        return "Done.";
    }
  },
});
