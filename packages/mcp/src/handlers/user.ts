import { getUser } from "@studiometa/forge-core";

import type { ForgeUser } from "@studiometa/forge-api";

import { formatUser } from "../formatters.ts";
import { createResourceHandler } from "./factory.ts";

export const handleUser = createResourceHandler({
  resource: "user",
  actions: ["get"],
  executors: {
    get: getUser,
  },
  formatResult: (_action, data) => {
    return formatUser(data as ForgeUser);
  },
});
