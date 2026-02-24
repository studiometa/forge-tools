import { createCommandRouter } from "../../utils/command-router.ts";
import {
  scheduledJobsCreate,
  scheduledJobsDelete,
  scheduledJobsGet,
  scheduledJobsList,
} from "./handlers.ts";

export const handleScheduledJobsCommand = createCommandRouter({
  resource: "scheduled-jobs",
  handlers: {
    list: scheduledJobsList,
    ls: scheduledJobsList,
    get: [scheduledJobsGet, "args"],
    create: scheduledJobsCreate,
    delete: [scheduledJobsDelete, "args"],
  },
});
