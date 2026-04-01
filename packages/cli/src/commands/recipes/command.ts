import { createCommandRouter } from "../../utils/command-router.ts";
import { recipesList, recipesGet, recipesRun, recipesUpdate } from "./handlers.ts";

export const handleRecipesCommand = createCommandRouter({
  resource: "recipes",
  handlers: {
    list: recipesList,
    ls: recipesList,
    get: [recipesGet, "args"],
    update: [recipesUpdate, "args"],
    run: [recipesRun, "args"],
  },
  writeSubcommands: ["update", "run"],
});
