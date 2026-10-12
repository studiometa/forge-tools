import { createCommandRouter } from "../../utils/command-router.ts";
import {
  phpConfig,
  phpDisableOpcache,
  phpEnableOpcache,
  phpList,
  phpMaxExecutionTime,
  phpMaxUploadSize,
  phpOpcache,
  phpSetMaxExecutionTime,
  phpSetMaxUploadSize,
  phpUpdateConfig,
} from "./handlers.ts";

export const handlePhpCommand = createCommandRouter({
  resource: "php",
  handlers: {
    list: phpList,
    ls: phpList,
    config: phpConfig,
    "update-config": phpUpdateConfig,
    "max-upload-size": phpMaxUploadSize,
    "set-max-upload-size": [phpSetMaxUploadSize, "args"],
    "max-execution-time": phpMaxExecutionTime,
    "set-max-execution-time": [phpSetMaxExecutionTime, "args"],
    opcache: phpOpcache,
    "enable-opcache": phpEnableOpcache,
    "disable-opcache": phpDisableOpcache,
  },
  writeSubcommands: [
    "update-config",
    "set-max-upload-size",
    "set-max-execution-time",
    "enable-opcache",
    "disable-opcache",
  ],
});
