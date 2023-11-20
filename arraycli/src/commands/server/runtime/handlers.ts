import { useHostHandler } from "@/commands/server/runtime/handlers/host";
import { useDeviceHandler } from "./handlers/device";

export const useHandlers = () => {
  useHostHandler();
  useDeviceHandler();
};
