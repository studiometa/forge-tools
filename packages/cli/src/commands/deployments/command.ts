import { createCommandRouter } from "../../utils/command-router.ts";
import {
  deploymentsList,
  deploymentsDeploy,
  deploymentsLogs,
  deploymentsScript,
  deploymentsUpdateScript,
} from "./handlers.ts";

export const handleDeploymentsCommand = createCommandRouter({
  resource: "deployments",
  handlers: {
    list: deploymentsList,
    ls: deploymentsList,
    deploy: deploymentsDeploy,
    logs: [deploymentsLogs, "args"],
    log: [deploymentsLogs, "args"],
    script: deploymentsScript,
    "update-script": deploymentsUpdateScript,
  },
  writeSubcommands: ["deploy", "update-script"],
});
