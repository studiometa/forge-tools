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
    list: v.object({ server_id: v.string() }),
    get: v.object({ server_id: v.string(), id: v.string() }),
    create: v.object({ server_id: v.string(), command: v.string() }),
    delete: v.object({ server_id: v.string(), id: v.string() }),
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
