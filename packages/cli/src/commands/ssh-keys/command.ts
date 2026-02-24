import { createCommandRouter } from "../../utils/command-router.ts";
import { sshKeysList, sshKeysGet } from "./handlers.ts";

export const handleSshKeysCommand = createCommandRouter({
  resource: "ssh-keys",
  handlers: {
    list: sshKeysList,
    ls: sshKeysList,
    get: [sshKeysGet, "args"],
  },
});
