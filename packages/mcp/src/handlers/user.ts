import { getUser } from "@studiometa/forge-core";

import { createResourceHandler } from "./factory.ts";

export const handleUser = createResourceHandler({
  resource: "user",
  actions: ["get"],
  executors: {
    get: getUser,
  },
});
