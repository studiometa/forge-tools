import * as v from "valibot";
import { updateSiteGit } from "@studiometa/forge-core";

import { formatSite } from "../formatters.ts";
import { createResourceHandler } from "./factory.ts";

export const handleGit = createResourceHandler({
  resource: "git",
  actions: ["update"],
  inputSchemas: {
    update: v.object({
      server_id: v.string(),
      site_id: v.string(),
      source_control_provider: v.picklist([
        "github",
        "gitlab",
        "bitbucket",
        "gitlab-custom",
        "custom",
      ]),
      repository: v.string(),
      branch: v.string(),
    }),
  },
  executors: {
    update: updateSiteGit,
  },
  mapOptions: (_action, args) => ({
    server_id: args.server_id,
    site_id: args.site_id,
    source_control_provider: args.source_control_provider,
    repository: args.repository,
    branch: args.branch,
  }),
  formatResult: (_action, data) => formatSite(data),
});
