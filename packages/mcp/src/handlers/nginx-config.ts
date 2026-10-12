import * as v from "valibot";
import type { ExecutorContext } from "@studiometa/forge-core";
import {
  getDomainNginxConfig,
  getNginxConfig,
  updateDomainNginxConfig,
  updateNginxConfig,
} from "@studiometa/forge-core";

import { formatNginxConfig } from "../formatters.ts";
import { createResourceHandler } from "./factory.ts";

interface NginxOptions {
  server_id: string;
  site_id: string;
  domain?: string;
  content: string;
}

export const handleNginxConfig = createResourceHandler({
  resource: "nginx",
  actions: ["get", "update"],
  inputSchemas: {
    get: v.object({
      server_id: v.string(),
      site_id: v.string(),
      domain_id: v.optional(v.string()),
    }),
    update: v.object({
      server_id: v.string(),
      site_id: v.string(),
      domain_id: v.optional(v.string()),
      content: v.string(),
    }),
  },
  // With a domain_id (ID or name), read and write the Nginx config of that domain.
  executors: {
    get: ({ domain, ...options }: NginxOptions, ctx: ExecutorContext) =>
      domain ? getDomainNginxConfig({ ...options, domain }, ctx) : getNginxConfig(options, ctx),
    update: ({ domain, ...options }: NginxOptions, ctx: ExecutorContext) =>
      domain
        ? updateDomainNginxConfig({ ...options, domain }, ctx)
        : updateNginxConfig(options, ctx),
  },
  mapOptions: (_action, args) => ({
    server_id: args.server_id,
    site_id: args.site_id,
    domain: args.domain_id,
    content: args.content,
  }),
  formatResult: (action, data, args) => {
    const domain = typeof args.domain_id === "string" ? args.domain_id : "";
    const target = domain ? ` for domain ${domain}` : "";
    switch (action) {
      case "get":
        return formatNginxConfig(data as string);
      case "update":
        return `Nginx configuration${target} updated.`;
      /* v8 ignore next */
      default:
        return "Done.";
    }
  },
});
