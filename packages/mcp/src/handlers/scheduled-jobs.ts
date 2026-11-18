import * as v from "valibot";
import {
  createScheduledJob,
  deleteScheduledJob,
  getScheduledJob,
  listScheduledJobs,
} from "@studiometa/forge-core";

import { formatScheduledJob, formatScheduledJobList } from "../formatters.ts";
import { createResourceHandler } from "./factory.ts";

export const handleScheduledJobs = createResourceHandler({
  resource: "scheduled-jobs",
  actions: ["list", "get", "create", "delete"],
  inputSchemas: {
    list: v.object({ server_id: v.string(), site_id: v.optional(v.string()) }),
    get: v.object({ server_id: v.string(), id: v.string(), site_id: v.optional(v.string()) }),
    create: v.object({
      server_id: v.string(),
      command: v.string(),
      site_id: v.optional(v.string()),
      name: v.optional(v.string()),
      user: v.optional(v.string()),
      frequency: v.optional(
        v.picklist(["minutely", "hourly", "nightly", "weekly", "monthly", "reboot", "custom"]),
      ),
      cron: v.optional(v.string()),
    }),
    delete: v.object({ server_id: v.string(), id: v.string(), site_id: v.optional(v.string()) }),
  },
  executors: {
    list: listScheduledJobs,
    get: getScheduledJob,
    create: createScheduledJob,
    delete: deleteScheduledJob,
  },
  mapOptions: (action, args) => {
    const { resource: _r, action: _a, compact: _c, ...rest } = args;
    if (action !== "create") return rest;
    // Forge requires the user and the frequency: forge by default, and custom with a cron.
    return {
      server_id: args.server_id,
      ...(args.site_id ? { site_id: args.site_id } : {}),
      command: args.command,
      user: args.user ?? "forge",
      frequency: args.frequency ?? (args.cron ? "custom" : "nightly"),
      ...(args.cron ? { cron: args.cron } : {}),
      ...(args.name ? { name: args.name } : {}),
    };
  },
  formatResult: (action, data, args) => {
    switch (action) {
      case "list":
        return formatScheduledJobList(data);
      case "get":
        return formatScheduledJob(data);
      case "create":
        return formatScheduledJob(data);
      case "delete":
        return `Scheduled job ${args.id} deleted.`;
      /* v8 ignore next */
      default:
        return "Done.";
    }
  },
});
