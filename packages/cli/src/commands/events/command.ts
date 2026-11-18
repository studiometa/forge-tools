import { createCommandRouter } from "../../utils/command-router.ts";
import { eventsGet, eventsList, eventsOutput } from "./handlers.ts";

export const handleEventsCommand = createCommandRouter({
  resource: "events",
  handlers: {
    list: eventsList,
    ls: eventsList,
    get: [eventsGet, "args"],
    output: [eventsOutput, "args"],
  },
});
