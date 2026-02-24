import {
  createScheduledJob,
  deleteScheduledJob,
  getScheduledJob,
  listScheduledJobs,
} from "@studiometa/forge-core";

import type { ForgeScheduledJob } from "@studiometa/forge-api";

import { formatScheduledJob, formatScheduledJobList } from "../formatters.ts";
import { createResourceHandler } from "./factory.ts";

export const handleScheduledJobs = createResourceHandler({
  resource: "scheduled-jobs",
  actions: ["list", "get", "create", "delete"],
  requiredFields: {
    list: ["server_id"],
    get: ["server_id", "id"],
    create: ["server_id", "command"],
    delete: ["server_id", "id"],
  },
  executors: {
    list: listScheduledJobs,
    get: getScheduledJob,
    create: createScheduledJob,
    delete: deleteScheduledJob,
  },
  formatResult: (action, data, args) => {
    switch (action) {
      case "list":
        return formatScheduledJobList(data as ForgeScheduledJob[]);
      case "get":
        return formatScheduledJob(data as ForgeScheduledJob);
      case "create":
        return formatScheduledJob(data as ForgeScheduledJob);
      case "delete":
        return `Scheduled job ${args.id} deleted.`;
      default:
        return "Done.";
    }
  },
});
