import {
  activateCertificate,
  createCertificate,
  deleteCertificate,
  getCertificate,
  listCertificates,
} from "@studiometa/forge-core";

import type { ForgeCertificate } from "@studiometa/forge-api";

import { formatCertificate, formatCertificateList } from "../formatters.ts";
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
  formatResult: (action, data, args) => {
    switch (action) {
      case "list":
        return formatCertificateList(data as ForgeCertificate[]);
      case "get":
        return formatCertificate(data as ForgeCertificate);
      case "create":
        return formatCertificate(data as ForgeCertificate);
      case "delete":
        return `Certificate ${args.id} deleted.`;
      case "activate":
        return `Certificate ${args.id} activated.`;
      default:
        return "Done.";
    }
  },
});
