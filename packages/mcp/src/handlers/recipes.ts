import * as v from "valibot";
import {
  createRecipe,
  deleteRecipe,
  getRecipe,
  listRecipes,
  runRecipe,
} from "@studiometa/forge-core";

import { formatRecipe, formatRecipeList } from "../formatters.ts";
import { getRecipeHints } from "../hints.ts";
import { createResourceHandler } from "./factory.ts";

export const handleRecipes = createResourceHandler({
  resource: "recipes",
  actions: ["list", "get", "create", "delete", "run"],
  inputSchemas: {
    get: v.object({ id: v.string() }),
    create: v.object({ name: v.string(), script: v.string() }),
    delete: v.object({ id: v.string() }),
    run: v.object({ id: v.string(), servers: v.unknown() }),
  },
  executors: {
    list: listRecipes,
    get: getRecipe,
    create: createRecipe,
    delete: deleteRecipe,
    run: runRecipe,
  },
  hints: (_data, id) => getRecipeHints(id),
  formatResult: (action, data, args) => {
    switch (action) {
      case "list":
        return formatRecipeList(data);
      case "get":
        return formatRecipe(data);
      case "create":
        return formatRecipe(data);
      case "delete":
        return `Recipe ${args.id} deleted.`;
      case "run": {
        const servers = args.servers;
        const count = Array.isArray(servers) ? servers.length : 1;
        return `Recipe ${args.id} run on ${count} server(s).`;
      }
      /* v8 ignore next */
      default:
        return "Done.";
    }
  },
});
