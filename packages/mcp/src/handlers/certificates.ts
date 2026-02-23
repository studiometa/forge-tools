import {
  activateCertificate,
  createCertificate,
  deleteCertificate,
  getCertificate,
  listCertificates,
} from "@studiometa/forge-core";

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
});
