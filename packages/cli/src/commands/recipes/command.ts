import { createCommandRouter } from "../../utils/command-router.ts";
import { recipesList, recipesGet, recipesRun } from "./handlers.ts";

export const handleRecipesCommand = createCommandRouter({
  resource: "recipes",
  handlers: {
    list: recipesList,
    ls: recipesList,
    get: [recipesGet, "args"],
    run: [recipesRun, "args"],
  },
});
