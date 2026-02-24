import {
  createRecipe,
  deleteRecipe,
  getRecipe,
  listRecipes,
  runRecipe,
} from "@studiometa/forge-core";

import type { ForgeRecipe } from "@studiometa/forge-api";

import { formatRecipe, formatRecipeList } from "../formatters.ts";
import { createResourceHandler } from "./factory.ts";

export const handleRecipes = createResourceHandler({
  resource: "recipes",
  actions: ["list", "get", "create", "delete", "run"],
  requiredFields: {
    get: ["id"],
    create: ["name", "script"],
    delete: ["id"],
    run: ["id", "servers"],
  },
  executors: {
    list: listRecipes,
    get: getRecipe,
    create: createRecipe,
    delete: deleteRecipe,
    run: runRecipe,
  },
  formatResult: (action, data, args) => {
    switch (action) {
      case "list":
        return formatRecipeList(data as ForgeRecipe[]);
      case "get":
        return formatRecipe(data as ForgeRecipe);
      case "create":
        return formatRecipe(data as ForgeRecipe);
      case "delete":
        return `Recipe ${args.id} deleted.`;
      case "run": {
        const servers = args.servers;
        const count = Array.isArray(servers) ? servers.length : 1;
        return `Recipe ${args.id} run on ${count} server(s).`;
      }
      default:
        return "Done.";
    }
  },
});
