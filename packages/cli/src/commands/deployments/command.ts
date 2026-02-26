import { createCommandRouter } from "../../utils/command-router.ts";
import { deploymentsList, deploymentsDeploy } from "./handlers.ts";

export const handleDeploymentsCommand = createCommandRouter({
  resource: "deployments",
  handlers: {
    list: deploymentsList,
    ls: deploymentsList,
    deploy: deploymentsDeploy,
  },
  writeSubcommands: ["deploy"],
});
