import {
  createRecipe,
  deleteRecipe,
  getRecipe,
  listRecipes,
  runRecipe,
} from "@studiometa/forge-core";

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
});
